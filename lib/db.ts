import postgres from 'postgres';

let client: ReturnType<typeof postgres>;

export function getDb() {
  if (!client) {
    client = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  }
  return client;
}

export async function initDb() {
  const sql = getDb();
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

  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      is_recurring BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'paid' CHECK(status IN ('paid', 'pending')),
      due_date TEXT,
      paid_date TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}
