import { getPayments, getClients } from '@/lib/actions';
import { Payment, Client } from '@/lib/types';
import Badge, { statusVariant, statusLabel } from '@/components/Badge';
import NewPaymentForm from './NewPaymentForm';
import PaymentActions from './PaymentActions';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default async function PaymentsPage() {
  const [payments, clients] = await Promise.all([getPayments(), getClients()]);

  const total = (payments as Payment[]).filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = (payments as Payment[]).filter(p => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Pagos</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Cobrado: <span className="text-emerald-400 font-medium">{fmt(total)}</span>
            {' · '}Pendiente: <span className="text-amber-400 font-medium">{fmt(pending)}</span>
          </p>
        </div>
        <NewPaymentForm clients={clients as Client[]} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid #1a2035' }}>
        {payments.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No hay pagos registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest" style={{ borderBottom: '1px solid #1a2035', color: 'var(--text-dim)' }}>
                <th className="text-left px-5 py-3">Descripcion</th>
                <th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Proyecto</th>
                <th className="text-left px-5 py-3">Monto</th>
                <th className="text-left px-5 py-3">Vencimiento</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(payments as Payment[]).map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #0f1520' }}>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text)" }}>{p.description}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{p.client_name ?? '—'}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{p.project_name ?? '—'}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text)" }}>{fmt(p.amount)}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{p.due_date ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={statusLabel(p.status)} variant={statusVariant(p.status)} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PaymentActions id={p.id} currentStatus={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
