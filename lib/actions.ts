'use server';

import { getDb } from './db';
import { revalidatePath } from 'next/cache';
import { ClientType, PaymentStatus } from './types';

// ─── Clients ───────────────────────────────────────────────────────────────

export async function getClients() {
  const db = getDb();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return db.prepare(`
    SELECT c.*, p.name as project_name, pl.name as plan_name, pl.price as plan_price,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status = 'paid'), 0) as total_paid,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status != 'paid'), 0) as total_pending,
      (SELECT status FROM payments WHERE client_id = c.id AND strftime('%Y-%m', created_at) = '${thisMonth}'
       ORDER BY created_at DESC LIMIT 1) as this_month_status,
      (SELECT paid_date FROM payments WHERE client_id = c.id AND status = 'paid'
       ORDER BY paid_date DESC LIMIT 1) as last_paid_date
    FROM clients c
    LEFT JOIN projects p ON c.project_id = p.id
    LEFT JOIN plans pl ON c.plan_id = pl.id
    ORDER BY c.created_at DESC
  `).all();
}

export async function getClientsByProject(projectId: number) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, pl.name as plan_name, pl.price as plan_price,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status = 'paid'), 0) as total_paid,
      COALESCE((SELECT SUM(amount) FROM payments WHERE client_id = c.id AND status != 'paid'), 0) as total_pending
    FROM clients c
    LEFT JOIN plans pl ON c.plan_id = pl.id
    WHERE c.project_id = ?
    ORDER BY c.created_at DESC
  `).all(projectId);
}

export async function createClient(data: {
  name: string; company?: string; email?: string; phone?: string; type: ClientType;
  project_id?: number; plan_id?: number; monthly_amount?: number;
  billing_start_date?: string; discount_months?: number; discount_amount?: number;
  service_email?: string; service_password?: string; start_date?: string; notes?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO clients (name, company, email, phone, type, project_id, plan_id, monthly_amount, billing_start_date, discount_months, discount_amount, service_email, service_password, start_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.name, data.company ?? null, data.email ?? null, data.phone ?? null, data.type,
    data.project_id ?? null, data.plan_id ?? null, data.monthly_amount ?? null,
    data.billing_start_date ?? null, data.discount_months ?? 0, data.discount_amount ?? 0,
    data.service_email ?? null, data.service_password ?? null, data.start_date ?? null, data.notes ?? null
  );
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
  const db = getDb();
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  const params: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(data)) params[k] = v ?? null;
  db.prepare(`UPDATE clients SET ${fields} WHERE id = @id`).run(params);
  revalidatePath('/clients');
  revalidatePath('/projects');
}

export async function markClientPaidThisMonth(clientId: number, customAmount?: number) {
  const db = getDb();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Buscar si ya tiene un pago este mes
  const existing = db.prepare(`
    SELECT * FROM payments WHERE client_id = ? AND strftime('%Y-%m', created_at) = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(clientId, thisMonth) as any;

  const today = now.toISOString().split('T')[0];

  if (existing) {
    db.prepare(`UPDATE payments SET status = 'paid', paid_date = ?, amount = COALESCE(?, amount) WHERE id = ?`)
      .run(today, customAmount ?? null, existing.id);
  } else {
    let amount = customAmount;
    if (amount === undefined) {
      const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(clientId) as any;
      if (!client) return;
      amount = client.monthly_amount ?? 0;
      if (client.billing_start_date && client.discount_months > 0) {
        const start = new Date(client.billing_start_date);
        const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (monthsElapsed < client.discount_months) amount = client.discount_amount ?? 0;
      }
    }
    db.prepare(`INSERT INTO payments (client_id, description, amount, status, paid_date, due_date) VALUES (?, ?, ?, 'paid', ?, ?)`)
      .run(clientId, `Suscripción ${thisMonth}`, amount, today, today);
  }

  revalidatePath('/clients');
  revalidatePath('/payments');
  revalidatePath('/');
}

export async function getClientMonthStatus(clientId: number): Promise<'paid' | 'pending' | 'none'> {
  const db = getDb();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const payment = db.prepare(`
    SELECT status FROM payments WHERE client_id = ? AND strftime('%Y-%m', created_at) = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(clientId, thisMonth) as any;
  if (!payment) return 'none';
  return payment.status === 'paid' ? 'paid' : 'pending';
}

export async function generateMonthlyPayments() {
  const db = getDb();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const clients = db.prepare(`
    SELECT c.*, pl.price as plan_price FROM clients c
    LEFT JOIN plans pl ON c.plan_id = pl.id
    WHERE c.status = 'active' AND c.monthly_amount IS NOT NULL AND c.monthly_amount > 0
  `).all() as any[];

  let created = 0;
  for (const client of clients) {
    const alreadyBilled = db.prepare(`
      SELECT COUNT(*) as c FROM payments
      WHERE client_id = ? AND strftime('%Y-%m', created_at) = ?
    `).get(client.id, thisMonth) as any;
    if (alreadyBilled.c > 0) continue;

    // Calcular si está en período de descuento
    let amount = client.monthly_amount;
    if (client.billing_start_date && client.discount_months > 0) {
      const start = new Date(client.billing_start_date);
      const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if (monthsElapsed < client.discount_months) {
        amount = client.discount_amount ?? 0;
      }
    }

    const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10`;
    db.prepare(`INSERT INTO payments (client_id, description, amount, due_date) VALUES (?, ?, ?, ?)`)
      .run(client.id, `Suscripción ${thisMonth}`, amount, dueDate);
    created++;
  }
  revalidatePath('/payments');
  revalidatePath('/');
  return created;
}

export async function deleteClient(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  revalidatePath('/clients');
  revalidatePath('/projects');
}

// ─── Projects ──────────────────────────────────────────────────────────────

export async function getProjects() {
  const db = getDb();
  return db.prepare(`
    SELECT p.*,
      COUNT(c.id) as client_count,
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
  `).all();
}

export async function getProject(id: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

export async function createProject(data: { name: string; type: ClientType; description?: string }): Promise<number> {
  const db = getDb();
  const result = db.prepare('INSERT INTO projects (name, type, description) VALUES (?, ?, ?)').run(
    data.name, data.type, data.description ?? null
  );
  revalidatePath('/projects');
  return Number(result.lastInsertRowid);
}

export async function deleteProject(id: number) {
  const db = getDb();
  db.prepare('UPDATE clients SET project_id = NULL WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  revalidatePath('/projects');
}

// ─── Payments ──────────────────────────────────────────────────────────────

export async function getPayments() {
  const db = getDb();
  return db.prepare(`
    SELECT pay.*, c.name as client_name, p.name as project_name
    FROM payments pay
    LEFT JOIN clients c ON pay.client_id = c.id
    LEFT JOIN projects p ON c.project_id = p.id
    ORDER BY pay.created_at DESC
  `).all();
}

export async function getPaymentsByClient(clientId: number) {
  const db = getDb();
  return db.prepare(`SELECT * FROM payments WHERE client_id = ? ORDER BY created_at DESC`).all(clientId);
}

export async function createPayment(data: {
  client_id?: number;
  description: string;
  amount: number;
  due_date?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO payments (client_id, description, amount, due_date)
    VALUES (?, ?, ?, ?)
  `).run(data.client_id ?? null, data.description, data.amount, data.due_date ?? null);
  revalidatePath('/');
  revalidatePath('/payments');
  revalidatePath('/projects');
}

export async function updatePaymentStatus(id: number, status: PaymentStatus) {
  const db = getDb();
  const paid_date = status === 'paid' ? new Date().toISOString().split('T')[0] : null;
  db.prepare('UPDATE payments SET status = ?, paid_date = ? WHERE id = ?').run(status, paid_date, id);
  revalidatePath('/payments');
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function deletePayment(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM payments WHERE id = ?').run(id);
  revalidatePath('/payments');
}

// ─── Plans ─────────────────────────────────────────────────────────────────

export async function getPlansByProject(projectId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM plans WHERE project_id = ? ORDER BY price ASC').all(projectId);
}

export async function createPlan(data: { project_id: number; name: string; price: number }) {
  const db = getDb();
  db.prepare('INSERT INTO plans (project_id, name, price) VALUES (?, ?, ?)').run(data.project_id, data.name, data.price);
  revalidatePath(`/projects/${data.project_id}`);
}

export async function updatePlan(id: number, data: { name?: string; price?: number }) {
  const db = getDb();
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE plans SET ${fields} WHERE id = @id`).run({ ...data, id });
  revalidatePath('/projects');
}

export async function deletePlan(id: number, projectId: number) {
  const db = getDb();
  db.prepare('UPDATE clients SET plan_id = NULL WHERE plan_id = ?').run(id);
  db.prepare('DELETE FROM plans WHERE id = ?').run(id);
  revalidatePath(`/projects/${projectId}`);
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export async function getStats() {
  const db = getDb();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalRevenue = (db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='paid'`).get() as any).v;
  const monthRevenue = (db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='paid' AND strftime('%Y-%m', paid_date)=?`).get(thisMonth) as any).v;
  const pending = (db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE status='pending'`).get() as any).v;
  const activeClients = (db.prepare(`SELECT COUNT(*) as v FROM clients WHERE status='active'`).get() as any).v;
  const totalProjects = (db.prepare(`SELECT COUNT(*) as v FROM projects`).get() as any).v;

  const monthlyRevenue = db.prepare(`
    SELECT strftime('%Y-%m', paid_date) as month, SUM(amount) as total
    FROM payments WHERE status='paid' AND paid_date IS NOT NULL
    GROUP BY month ORDER BY month DESC LIMIT 6
  `).all().reverse();

  return { totalRevenue, monthRevenue, pending, activeClients, totalProjects, monthlyRevenue };
}
