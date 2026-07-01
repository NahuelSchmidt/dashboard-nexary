export type ClientType = 'web' | 'turnify' | 'gym' | 'erp';

export interface Plan {
  id: number;
  project_id: number;
  name: string;
  price: number;
  created_at: string;
}
export type ClientStatus = 'active' | 'inactive';
export type ProjectStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Client {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  type: ClientType;
  status: ClientStatus;
  project_id: number | null;
  plan_id: number | null;
  monthly_amount: number | null;
  billing_start_date: string | null;
  discount_months: number;
  discount_amount: number;
  plan_name?: string;
  plan_price?: number;
  this_month_status?: 'paid' | 'pending' | null;
  last_paid_date?: string | null;
  service_email: string | null;
  service_password: string | null;
  start_date: string | null;
  notes: string | null;
  created_at: string;
  project_name?: string;
  total_paid?: number;
  total_pending?: number;
}

export interface Project {
  id: number;
  name: string;
  type: ClientType;
  description: string | null;
  created_at: string;
  client_count?: number;
  total_revenue?: number;
  pending_revenue?: number;
}

export interface Payment {
  id: number;
  client_id: number | null;
  project_id: number | null;
  description: string;
  amount: number;
  status: PaymentStatus;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  client_name?: string;
  project_name?: string;
}
