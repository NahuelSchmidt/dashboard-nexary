'use client';

import { useState } from 'react';
import { createProject, createPlan } from '@/lib/actions';
import { ClientType } from '@/lib/types';
import { Plus, X, Trash2 } from 'lucide-react';
import { ModalActions } from '@/components/FormField';

const PRODUCT_LABELS: Record<string, string> = {
  turnify: 'Turnify',
  web: 'Desarrollo Web',
  gym: 'Gym SaaS',
  erp: 'ERP',
};

interface PlanDraft { name: string; price: string; }

export default function NewProjectForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ClientType>('turnify');
  const [plans, setPlans] = useState<PlanDraft[]>([]);

  function addPlan() { setPlans(p => [...p, { name: '', price: '' }]); }
  function updatePlan(i: number, field: keyof PlanDraft, val: string) {
    setPlans(p => p.map((pl, idx) => idx === i ? { ...pl, [field]: val } : pl));
  }
  function removePlan(i: number) { setPlans(p => p.filter((_, idx) => idx !== i)); }

  function close() { setOpen(false); setPlans([]); setType('turnify'); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const projectId = await createProject({ name: PRODUCT_LABELS[type], type });
    for (const plan of plans) {
      if (plan.name.trim()) {
        await createPlan({ project_id: projectId, name: plan.name.trim(), price: Number(plan.price) || 0 });
      }
    }
    setLoading(false);
    close();
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
    background: active ? 'var(--brand-subtle2)' : 'var(--bg-input)',
    color: active ? 'var(--brand)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
    transition: 'all 0.15s',
  });

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '7px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', flex: 1,
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}>
        <Plus size={16} /> Nuevo proyecto
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Nuevo proyecto</h2>
              <button onClick={close} style={{ color: 'var(--text-dim)' }} className="hover:opacity-70"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Tipo = nombre */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tipo de proyecto
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(PRODUCT_LABELS) as [ClientType, string][]).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setType(key)} style={btnStyle(type === key)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Planes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Planes de suscripción
                  </label>
                  <button type="button" onClick={addPlan}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', border: '1px solid var(--brand-subtle2)' }}>
                    <Plus size={12} /> Agregar plan
                  </button>
                </div>
                {plans.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Opcional — si tiene suscripción, agregá los planes con su precio.</p>
                )}
                <div className="space-y-2 mt-2">
                  {plans.map((plan, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={plan.name} onChange={e => updatePlan(i, 'name', e.target.value)}
                        placeholder="Nombre (ej: Básico)" style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                      <div className="flex items-center flex-shrink-0"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px' }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: 13, marginRight: 2 }}>$</span>
                        <input type="number" min="0" value={plan.price} onChange={e => updatePlan(i, 'price', e.target.value)}
                          placeholder="0"
                          style={{ background: 'transparent', border: 'none', outline: 'none', width: 65, fontSize: 13, color: 'var(--text)' }} />
                      </div>
                      <button type="button" onClick={() => removePlan(i)} className="flex-shrink-0 hover:opacity-60" style={{ color: 'var(--text-dim)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <ModalActions onCancel={close} loading={loading} />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
