'use client';

import { useState, useEffect } from 'react';
import { updateClient, getPlansByProject } from '@/lib/actions';
import { Client, Project, Plan, ClientType } from '@/lib/types';
import { X, Eye, EyeOff } from 'lucide-react';
import { Field, Select, TextArea, ModalActions } from '@/components/FormField';

export default function EditClientModal({ client, projects, onClose }: {
  client: Client;
  projects: Project[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(String(client.project_id ?? ''));
  const [plans, setPlans] = useState<Plan[]>([]);
  const [monthlyAmount, setMonthlyAmount] = useState(String(client.monthly_amount ?? ''));
  useEffect(() => {
    if (client.project_id) {
      getPlansByProject(client.project_id).then(p => setPlans(p as Plan[]));
    }
  }, [client.project_id]);

  async function loadPlans(projectId: string) {
    setSelectedProjectId(projectId);
    if (projectId) {
      const p = await getPlansByProject(Number(projectId));
      setPlans(p as Plan[]);
    } else {
      setPlans([]);
    }
  }

  function handlePlanChange(planId: string) {
    const plan = plans.find(p => String(p.id) === planId);
    if (plan && plan.price > 0) setMonthlyAmount(String(plan.price));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const planId = fd.get('plan_id') as string;
    await updateClient(client.id, {
      name: fd.get('name') as string,
      company: fd.get('company') as string || undefined,
      email: fd.get('email') as string || undefined,
      phone: fd.get('phone') as string || undefined,
      type: fd.get('type') as ClientType,
      status: fd.get('status') as string,
      project_id: selectedProjectId ? Number(selectedProjectId) : null,
      plan_id: planId ? Number(planId) : null,
      monthly_amount: monthlyAmount ? Number(monthlyAmount) : null,
      billing_start_date: fd.get('billing_start_date') as string || undefined,
      discount_months: Number(fd.get('discount_months') || 0),
      discount_amount: Number(fd.get('discount_amount') || 0),
      service_email: fd.get('service_email') as string || undefined,
      service_password: fd.get('service_password') as string || undefined,
      start_date: fd.get('start_date') as string || undefined,
      notes: fd.get('notes') as string || undefined,
    });
    setLoading(false);
    onClose();
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const selStyle: React.CSSProperties = { background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)', width: '100%', outline: 'none' };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Editar cliente</h2>
          <button onClick={onClose} style={{ color: 'var(--text-dim)' }} className="hover:opacity-70"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--brand)' }}>Datos de contacto</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Field label="Nombre *" name="name" required defaultValue={client.name} /></div>
              <Field label="Empresa" name="company" defaultValue={client.company ?? ''} />
              <Select label="Servicio" name="type" defaultValue={client.type}>
                <option value="web">Web</option>
                <option value="turnify">Turnify</option>
                <option value="gym">Gym SaaS</option>
                <option value="erp">ERP</option>
              </Select>
              <Select label="Estado" name="status" defaultValue={client.status}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </Select>
              <Field label="Email" name="email" type="email" defaultValue={client.email ?? ''} />
              <Field label="Teléfono" name="phone" defaultValue={client.phone ?? ''} />
              <Field label="Fecha de alta" name="start_date" type="date" defaultValue={client.start_date ?? ''} />
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--brand)' }}>Proyecto y suscripción</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Proyecto</label>
                  <select value={selectedProjectId} onChange={e => loadPlans(e.target.value)} style={selStyle}>
                    <option value="">Sin proyecto</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Plan</label>
                  <select name="plan_id" defaultValue={client.plan_id ?? ''} onChange={e => handlePlanChange(e.target.value)}
                    style={{ ...selStyle, opacity: plans.length === 0 ? 0.5 : 1 }} disabled={plans.length === 0}>
                    <option value="">{plans.length === 0 ? 'Elegí un proyecto' : 'Sin plan'}</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}{p.price > 0 ? ` ($${p.price.toLocaleString('es-AR')})` : ''}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label style={labelStyle}>Monto mensual</label>
                  <div className="flex items-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    <span className="px-3 text-sm" style={{ color: 'var(--text-dim)' }}>$</span>
                    <input type="number" min="0" step="0.01" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, padding: '8px 0', fontSize: 13, color: 'var(--text)' }} />
                    <span className="px-3 text-xs" style={{ color: 'var(--text-dim)' }}>/mes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--brand)' }}>Renovación y descuento</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Inicio de facturación" name="billing_start_date" type="date" defaultValue={client.billing_start_date ?? ''} />
              <Field label="Meses de descuento" name="discount_months" type="number" min="0" defaultValue={String(client.discount_months ?? 0)}
                placeholder="0" />
              <div className="col-span-2">
                <label style={labelStyle}>Monto durante descuento</label>
                <div className="flex items-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <span className="px-3 text-sm" style={{ color: 'var(--text-dim)' }}>$</span>
                  <input name="discount_amount" type="number" min="0" step="0.01" defaultValue={client.discount_amount ?? 0}
                    style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, padding: '8px 0', fontSize: 13, color: 'var(--text)' }} />
                  <span className="px-3 text-xs" style={{ color: 'var(--text-dim)' }}>/mes · 0 = gratis</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--brand)' }}>Acceso al servicio</p>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Usuario (email de login)" name="service_email" type="email" defaultValue={client.service_email ?? ''} />
              <div>
                <label style={labelStyle}>Contraseña</label>
                <div className="relative">
                  <input name="service_password" type={showPass ? 'text' : 'password'} defaultValue={client.service_password ?? ''}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 36px 8px 12px', fontSize: 13, color: 'var(--text)', width: '100%', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <TextArea label="Notas" name="notes" rows={2} defaultValue={client.notes ?? ''} />
          <ModalActions onCancel={onClose} loading={loading} label="Guardar cambios" />
        </form>
      </div>
    </div>
  );
}
