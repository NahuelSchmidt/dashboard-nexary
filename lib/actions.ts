'use server';

import { getDb } from './db';
import { revalidatePath } from 'next/cache';
import { Client, ClientType, Payment, PaymentStatus, Plan, Project } from './types';

function thisMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Clients ───────────────────────────────────────────────────────────────

export async function getClients() {
  const sql = getDb();
  const thisMonth = thisMonthStr();
  return sql<Client[]>`
    SELECT c.*, p.name as project_name, pl.name as plan_name, pl.price as plan_price,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status = 'paid'), 0) as total_paid,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status != 'paid'), 0) as total_pending,
      (SELECT status FROM payments WHERE client_id = c.id AND to_char(created_at, 'YYYY-MM') = ${thisMonth}
       ORDER BY created_at DESC LIMIT 1) as this_month_status,
      (SELECT paid_date FROM payments WHERE client_id = c.id AND status = 'paid'
       ORDER BY paid_date DESC LIMIT 1) as last_paid_date
    FROM clients c
    LEFT JOIN projects p ON c.project_id = p.id
    LEFT JOIN plans pl ON c.plan_id = pl.id
    ORDER BY c.created_at DESC
  `;
}

export async function getClientsByProject(projectId: number) {
  const sql = getDb();
  return sql<Client[]>`
    SELECT c.*, pl.name as plan_name, pl.price as plan_price,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status = 'paid'), 0) as total_paid,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status != 'paid'), 0) as total_pending
    FROM clients c
    LEFT JOIN plans pl ON c.plan_id = pl.id
    WHERE c.project_id = ${projectId}
    ORDER BY c.created_at DESC
  `;
}

export async function createClient(data: {
  name: string; company?: string; email?: string; phone?: string; type: ClientType;
  project_id?: number; plan_id?: number; monthly_amount?: number;
  billing_start_date?: string; discount_months?: number; discount_amount?: number;
  service_email?: string; service_password?: string; start_date?: string; notes?: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO clients (name, company, email, phone, type, project_id, plan_id, monthly_amount, billing_start_date, discount_months, discount_amount, service_email, service_password, start_date, notes)
    VALUES (${data.name}, ${data.company ?? null}, ${data.email ?? null}, ${data.phone ?? null}, ${data.type},
      ${data.project_id ?? null}, ${data.plan_id ?? null}, ${data.monthly_amount ?? null},
      ${data.billing_start_date ?? null}, ${data.discount_months ?? 0}, ${data.discount_amount ?? 0},
      ${data.service_email ?? null}, ${data.service_password ?? null}, ${data.start_date ?? null}, ${data.notes ?? null})
  `;
  revalidatePath('/');
  revalidatePath('/clients');
  revalidatePath('/projects');
}

export async function updateClient(id: number, data: {
  name?: string; company?: string; email?: string; phone?: string;
  type?: ClientType; status?: string; project_id?: number | null;
  plan_id?: number | null; monthly_amount?: number | null;
  billing_start_date?: string | null; discount_months?: number; discount_amount?: number;
  service_email?: string | null; service_password?: string | null;
  start_date?: string | null; notes?: string | null;
}) {
  const sql = getDb();
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) cleaned[k] = v ?? null;
  await sql`UPDATE clients SET ${sql(cleaned, ...(keys as (keyof typeof cleaned)[]))} WHERE id = ${id}`;
  revalidatePath('/clients');
  revalidatePath('/projects');
}

export async function markClientPaidThisMonth(clientId: number, customAmount?: number) {
  const sql = getDb();
  const thisMonth = thisMonthStr();

  const existingRows = await sql`
    SELECT * FROM payments WHERE client_id = ${clientId} AND to_char(created_at, 'YYYY-MM') = ${thisMonth}
    ORDER BY created_at DESC LIMIT 1
  `;
  const existing = existingRows[0];

  const today = new Date().toISOString().split('T')[0];

  if (existing) {
    await sql`UPDATE payments SET status = 'paid', paid_date = ${today}, amount = COALESCE(${customAmount ?? null}, amount) WHERE id = ${existing.id}`;
  } else {
    let amount: number;
    if (customAmount !== undefined) {
      amount = customAmount;
    } else {
      const clientRows = await sql<Client[]>`SELECT * FROM clients WHERE id = ${clientId}`;
      const client = clientRows[0];
      if (!client) return;
      amount = client.monthly_amount ?? 0;
      if (client.billing_start_date && client.discount_months > 0) {
        const now = new Date();
        const start = new Date(client.billing_start_date);
        const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (monthsElapsed < client.discount_months) amount = client.discount_amount ?? 0;
      }
    }
    await sql`INSERT INTO payments (client_id, description, amount, status, paid_date, due_date) VALUES (${clientId}, ${`Suscripción ${thisMonth}`}, ${amount}, 'paid', ${today}, ${today})`;
  }

  revalidatePath('/clients');
  revalidatePath('/payments');
  revalidatePath('/');
}

export async function getClientMonthStatus(clientId: number): Promise<'paid' | 'pending' | 'none'> {
  const sql = getDb();
  const thisMonth = thisMonthStr();
  const rows = await sql`
    SELECT status FROM payments WHERE client_id = ${clientId} AND to_char(created_at, 'YYYY-MM') = ${thisMonth}
    ORDER BY created_at DESC LIMIT 1
  `;
  const payment = rows[0];
  if (!payment) return 'none';
  return payment.status === 'paid' ? 'paid' : 'pending';
}

export async function generateMonthlyPayments() {
  const sql = getDb();
  const now = new Date();
  const thisMonth = thisMonthStr();
  const clients = await sql`
    SELECT c.*, pl.price as plan_price FROM clients c
    LEFT JOIN plans pl ON c.plan_id = pl.id
    WHERE c.status = 'active' AND c.monthly_amount IS NOT NULL AND c.monthly_amount > 0
  `;

  let created = 0;
  for (const client of clients) {
    const alreadyBilledRows = await sql`
      SELECT COUNT(*) as c FROM payments
      WHERE client_id = ${client.id} AND to_char(created_at, 'YYYY-MM') = ${thisMonth}
    `;
    if (Number(alreadyBilledRows[0].c) > 0) continue;

    let amount = client.monthly_amount;
    if (client.billing_start_date && client.discount_months > 0) {
      const start = new Date(client.billing_start_date);
      const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if (monthsElapsed < client.discount_months) {
        amount = client.discount_amount ?? 0;
      }
    }

    const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10`;
    await sql`INSERT INTO payments (client_id, description, amount, due_date) VALUES (${client.id}, ${`Suscripción ${thisMonth}`}, ${amount}, ${dueDate})`;
    created++;
  }
  revalidatePath('/payments');
  revalidatePath('/');
  return created;
}

export async function deleteClient(id: number) {
  const sql = getDb();
  await sql`DELETE FROM clients WHERE id = ${id}`;
  revalidatePath('/clients');
  revalidatePath('/projects');
}

// ─── Projects ──────────────────────────────────────────────────────────────

export async function getProjects() {
  const sql = getDb();
  return sql<Project[]>`
    SELECT p.*,
      COUNT(c.id)::int as client_count,
      COALESCE((
        SELECT SUM(pay.amount) FROM payments pay
        JOIN clients c2 ON pay.client_id = c2.id
        WHERE c2.project_id = p.id AND pay.status = 'paid'
      ), 0) as total_revenue,
      COALESCE((
        SELECT SUM(pay.amount) FROM payments pay
        JOIN clients c2 ON pay.client_id = c2.id
        WHERE c2.project_id = p.id AND pay.status != 'paid'
      ), 0) as pending_revenue
    FROM projects p
    LEFT JOIN clients c ON c.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
}

export async function getProject(id: number) {
  const sql = getDb();
  const rows = await sql<Project[]>`SELECT * FROM projects WHERE id = ${id}`;
  return rows[0];
}

export async function createProject(data: { name: string; type: ClientType; description?: string }): Promise<number> {
  const sql = getDb();
  const rows = await sql`INSERT INTO projects (name, type, description) VALUES (${data.name}, ${data.type}, ${data.description ?? null}) RETURNING id`;
  revalidatePath('/projects');
  return Number(rows[0].id);
}

export async function deleteProject(id: number) {
  const sql = getDb();
  await sql`UPDATE clients SET project_id = NULL WHERE project_id = ${id}`;
  await sql`DELETE FROM projects WHERE id = ${id}`;
  revalidatePath('/projects');
}

// ─── Payments ──────────────────────────────────────────────────────────────

export async function getPayments() {
  const sql = getDb();
  return sql<Payment[]>`
    SELECT pay.*, c.name as client_name, p.name as project_name
    FROM payments pay
    LEFT JOIN clients c ON pay.client_id = c.id
    LEFT JOIN projects p ON c.project_id = p.id
    ORDER BY pay.created_at DESC
  `;
}

export async function getPaymentsByClient(clientId: number) {
  const sql = getDb();
  return sql<Payment[]>`SELECT * FROM payments WHERE client_id = ${clientId} ORDER BY created_at DESC`;
}

export async function createPayment(data: {
  client_id?: number;
  description: string;
  amount: number;
  due_date?: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO payments (client_id, description, amount, due_date)
    VALUES (${data.client_id ?? null}, ${data.description}, ${data.amount}, ${data.due_date ?? null})
  `;
  revalidatePath('/');
  revalidatePath('/payments');
  revalidatePath('/projects');
}

export async function updatePaymentStatus(id: number, status: PaymentStatus) {
  const sql = getDb();
  const paid_date = status === 'paid' ? new Date().toISOString().split('T')[0] : null;
  await sql`UPDATE payments SET status = ${status}, paid_date = ${paid_date} WHERE id = ${id}`;
  revalidatePath('/payments');
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function deletePayment(id: number) {
  const sql = getDb();
  await sql`DELETE FROM payments WHERE id = ${id}`;
  revalidatePath('/payments');
}

// ─── Plans ─────────────────────────────────────────────────────────────────

export async function getPlansByProject(projectId: number) {
  const sql = getDb();
  return sql<Plan[]>`SELECT * FROM plans WHERE project_id = ${projectId} ORDER BY price ASC`;
}

export async function createPlan(data: { project_id: number; name: string; price: number }) {
  const sql = getDb();
  await sql`INSERT INTO plans (project_id, name, price) VALUES (${data.project_id}, ${data.name}, ${data.price})`;
  revalidatePath(`/projects/${data.project_id}`);
}

export async function updatePlan(id: number, data: { name?: string; price?: number }) {
  const sql = getDb();
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  await sql`UPDATE plans SET ${sql(data, ...(keys as (keyof typeof data)[]))} WHERE id = ${id}`;
  revalidatePath('/projects');
}

export async function deletePlan(id: number, projectId: number) {
  const sql = getDb();
  await sql`UPDATE clients SET plan_id = NULL WHERE plan_id = ${id}`;
  await sql`DELETE FROM plans WHERE id = ${id}`;
  revalidatePath(`/projects/${projectId}`);
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export async function getStats() {
  const sql = getDb();
  const thisMonth = thisMonthStr();

  const totalRevenueRows = await sql`SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='paid'`;
  const monthRevenueRows = await sql`SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='paid' AND to_char(paid_date::date, 'YYYY-MM')=${thisMonth}`;
  const pendingRows = await sql`SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='pending'`;
  const activeClientsRows = await sql`SELECT COUNT(*)::int as v FROM clients WHERE status='active'`;
  const totalProjectsRows = await sql`SELECT COUNT(*)::int as v FROM projects`;

  const monthlyRevenue = await sql`
    SELECT to_char(paid_date::date, 'YYYY-MM') as month, SUM(amount) as total
    FROM payments WHERE status='paid' AND paid_date IS NOT NULL
    GROUP BY month ORDER BY month DESC LIMIT 6
  `;

  return {
    totalRevenue: totalRevenueRows[0].v,
    monthRevenue: monthRevenueRows[0].v,
    pending: pendingRows[0].v,
    activeClients: activeClientsRows[0].v,
    totalProjects: totalProjectsRows[0].v,
    monthlyRevenue: [...monthlyRevenue].reverse(),
  };
}
