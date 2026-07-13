import Database from 'better-sqlite3';
import postgres from 'postgres';
import path from 'node:path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Falta DATABASE_URL. Corré este script con: node --env-file=.env.local scripts/migrate-to-supabase.mjs');
  process.exit(1);
}

const sqlite = new Database(path.join(process.cwd(), 'nexary.db'), { readonly: true });
const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function main() {
  console.log('Creando tablas en Supabase...');
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('web', 'turnify', 'gym', 'erp')),
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS plans (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      type TEXT NOT NULL CHECK(type IN ('web', 'turnify', 'gym', 'erp')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      project_id INTEGER REFERENCES projects(id),
      plan_id INTEGER REFERENCES plans(id),
      monthly_amount REAL,
      billing_start_date TEXT,
      discount_months INTEGER DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      service_email TEXT,
      service_password TEXT,
      start_date TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      project_id INTEGER REFERENCES projects(id),
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('paid', 'pending', 'overdue')),
      due_date TEXT,
      paid_date TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  console.log('Migrando datos...');

  const projects = sqlite.prepare('SELECT * FROM projects').all();
  for (const p of projects) {
    await sql`
      INSERT INTO projects (id, name, type, description, created_at)
      VALUES (${p.id}, ${p.name}, ${p.type}, ${p.description}, ${p.created_at})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const plans = sqlite.prepare('SELECT * FROM plans').all();
  for (const p of plans) {
    await sql`
      INSERT INTO plans (id, project_id, name, price, created_at)
      VALUES (${p.id}, ${p.project_id}, ${p.name}, ${p.price}, ${p.created_at})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const clients = sqlite.prepare('SELECT * FROM clients').all();
  for (const c of clients) {
    await sql`
      INSERT INTO clients (
        id, name, company, email, phone, type, status, project_id, plan_id,
        monthly_amount, billing_start_date, discount_months, discount_amount,
        service_email, service_password, start_date, notes, created_at
      ) VALUES (
        ${c.id}, ${c.name}, ${c.company}, ${c.email}, ${c.phone}, ${c.type}, ${c.status},
        ${c.project_id}, ${c.plan_id}, ${c.monthly_amount}, ${c.billing_start_date},
        ${c.discount_months}, ${c.discount_amount}, ${c.service_email}, ${c.service_password},
        ${c.start_date}, ${c.notes}, ${c.created_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const payments = sqlite.prepare('SELECT * FROM payments').all();
  for (const p of payments) {
    await sql`
      INSERT INTO payments (id, client_id, project_id, description, amount, status, due_date, paid_date, created_at)
      VALUES (${p.id}, ${p.client_id}, ${p.project_id}, ${p.description}, ${p.amount}, ${p.status}, ${p.due_date}, ${p.paid_date}, ${p.created_at})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const [table, rows] of [['projects', projects], ['plans', plans], ['clients', clients], ['payments', payments]]) {
    if (rows.length > 0) {
      const maxId = Math.max(...rows.map(r => r.id));
      await sql`SELECT setval(pg_get_serial_sequence(${table}, 'id'), ${maxId})`;
    }
  }

  console.log(`Listo: ${projects.length} proyectos, ${plans.length} planes, ${clients.length} clientes, ${payments.length} pagos.`);
  await sql.end();
  sqlite.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
