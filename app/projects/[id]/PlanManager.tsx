'use client';

import { useState } from 'react';
import { createPlan, updatePlan, deletePlan } from '@/lib/actions';
import { Plan } from '@/lib/types';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR');
}

function PlanRow({ plan }: { plan: Plan }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(String(plan.price));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updatePlan(plan.id, { name, price: Number(price) });
    setSaving(false);
    setEditing(false);
  }

  async function remove() {
    if (!confirm(`Eliminar plan "${plan.name}"?`)) return;
    await deletePlan(plan.id, plan.project_id);
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '4px 8px', fontSize: 13, color: 'var(--text)', outline: 'none',
  };

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {editing ? (
        <>
          <div className="flex items-center gap-2 flex-1">
            <input value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, width: 140 }} placeholder="Nombre del plan" />
            <div className="flex items-center gap-1" style={{ ...inputStyle }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>$</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
                style={{ background: 'transparent', border: 'none', outline: 'none', width: 80, fontSize: 13, color: 'var(--text)' }} />
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>/mes</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <button onClick={save} disabled={saving} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--brand-subtle2)', color: 'var(--brand)' }}>
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{plan.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: plan.price > 0 ? 'var(--brand)' : 'var(--text-dim)' }}>
              {plan.price > 0 ? `${fmt(plan.price)}/mes` : 'Sin precio'}
            </span>
            <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              <Pencil size={13} />
            </button>
            <button onClick={remove} className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NewPlanRow({ projectId, onDone }: { projectId: number; onDone: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await createPlan({ project_id: projectId, name: name.trim(), price: Number(price) || 0 });
    setSaving(false);
    onDone();
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '4px 8px', fontSize: 13, color: 'var(--text)', outline: 'none',
  };

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 flex-1">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, width: 140 }}
          placeholder="Nombre del plan" onKeyDown={e => e.key === 'Enter' && save()} />
        <div className="flex items-center gap-1" style={{ ...inputStyle }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>$</span>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
            style={{ background: 'transparent', border: 'none', outline: 'none', width: 80, fontSize: 13, color: 'var(--text)' }}
            placeholder="0" onKeyDown={e => e.key === 'Enter' && save()} />
          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>/mes</span>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-3">
        <button onClick={save} disabled={saving || !name.trim()} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
          style={{ background: 'var(--brand-subtle2)', color: 'var(--brand)' }}>
          <Check size={14} />
        </button>
        <button onClick={onDone} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function PlanManager({ projectId, plans }: { projectId: number; plans: Plan[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          Planes de suscripción
        </h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', border: '1px solid var(--brand-subtle2)' }}>
            <Plus size={13} /> Agregar plan
          </button>
        )}
      </div>

      {plans.length === 0 && !adding ? (
        <div className="px-5 py-6 text-sm" style={{ color: 'var(--text-dim)' }}>
          Sin planes. Agregá uno para poder asignarlo a tus clientes.
        </div>
      ) : (
        <div>
          {plans.map(plan => <PlanRow key={plan.id} plan={plan} />)}
        </div>
      )}

      {adding && <NewPlanRow projectId={projectId} onDone={() => setAdding(false)} />}
    </div>
  );
}
