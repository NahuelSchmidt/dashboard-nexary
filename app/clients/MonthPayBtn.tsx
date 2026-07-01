'use client';

import { useState } from 'react';
import { markClientPaidThisMonth } from '@/lib/actions';
import { CheckCircle, Clock, CircleDashed, X, Check } from 'lucide-react';

type Status = 'paid' | 'pending' | null | undefined;

export default function MonthPayBtn({ clientId, clientName, status, monthlyAmount, hasAmount }: {
  clientId: number;
  clientName: string;
  status: Status;
  monthlyAmount: number | null;
  hasAmount: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(monthlyAmount ?? ''));
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<Status>(status);

  if (!hasAmount) return null;

  async function confirm() {
    setLoading(true);
    await markClientPaidThisMonth(clientId, Number(amount));
    setLocalStatus('paid');
    setLoading(false);
    setOpen(false);
  }

  if (localStatus === 'paid') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#4ade80' }}>
        <CheckCircle size={14} /> Pagó
      </span>
    );
  }

  const month = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <>
      <button
        onClick={e => { e.stopPropagation(); setAmount(String(monthlyAmount ?? '')); setOpen(true); }}
        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all"
        style={localStatus === 'pending'
          ? { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }
          : { background: 'var(--bg-input)', color: 'var(--text-dim)', border: '1px solid var(--border)' }
        }
      >
        {localStatus === 'pending' ? <Clock size={13} /> : <CircleDashed size={13} />}
        {localStatus === 'pending' ? 'Pendiente' : 'Registrar pago'}
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { e.stopPropagation(); setOpen(false); }}>
          <div className="rounded-xl p-6 w-80" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Registrar pago</h3>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-dim)' }}><X size={16} /></button>
            </div>

            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{clientName}</p>
            <p className="text-xs mb-4 capitalize" style={{ color: 'var(--text-dim)' }}>{month}</p>

            <div className="mb-4">
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monto
              </label>
              <div className="flex items-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <span className="px-3 text-sm font-medium" style={{ color: 'var(--text-dim)' }}>$</span>
                <input
                  type="number" min="0" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  autoFocus
                  style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, padding: '10px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}
                />
              </div>
              {monthlyAmount && Number(amount) !== monthlyAmount && (
                <p className="text-xs mt-1.5" style={{ color: '#fbbf24' }}>
                  Precio original: ${monthlyAmount.toLocaleString('es-AR')}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 py-2 rounded-lg text-sm transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
              <button onClick={confirm} disabled={loading || !amount}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <Check size={14} />
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
