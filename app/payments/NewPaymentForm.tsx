'use client';

import { useState } from 'react';
import { createPayment } from '@/lib/actions';
import { Client } from '@/lib/types';
import { Plus, X } from 'lucide-react';
import { Field, Select, ModalActions } from '@/components/FormField';

export default function NewPaymentForm({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const clientId = fd.get('client_id') as string;
    await createPayment({
      client_id: clientId ? Number(clientId) : undefined,
      description: fd.get('description') as string,
      amount: Number(fd.get('amount')),
      due_date: fd.get('due_date') as string || undefined,
    });
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}>
        <Plus size={16} /> Registrar pago
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Registrar pago</h2>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-dim)' }} className="hover:opacity-70"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Descripción *" name="description" required placeholder="ej: Cuota Turnify junio" />
                </div>
                <Field label="Monto *" name="amount" type="number" required min="0" step="0.01" />
                <Field label="Fecha vencimiento" name="due_date" type="date" />
                <div className="col-span-2">
                  <Select label="Cliente" name="client_id">
                    <option value="">— Sin cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.project_name ? ` (${c.project_name})` : ''}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <ModalActions onCancel={() => setOpen(false)} loading={loading} />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
