import { getStats, getPayments } from '@/lib/actions';
import StatCard from '@/components/StatCard';
import Badge, { statusVariant, statusLabel } from '@/components/Badge';
import RevenueChart from '@/components/RevenueChart';
import { Payment } from '@/lib/types';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default async function HomePage() {
  const [stats, allPayments] = await Promise.all([getStats(), getPayments()]);
  const payments = allPayments as Payment[];
  const recent = payments.slice(0, 6);
  const pending = payments.filter(p => p.status === 'pending' || p.status === 'overdue').slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Dashboard</h1>
        <p className="text-sm mt-1 capitalize" style={{ color: 'var(--text-dim)' }}>
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingresos este mes" value={fmt(stats.monthRevenue)} color="green" />
        <StatCard label="Pendiente de cobro" value={fmt(stats.pending)} color="yellow" />
        <StatCard label="Clientes activos" value={String(stats.activeClients)} color="brand" />
        <StatCard label="Proyectos en curso" value={String(stats.totalProjects)} />
      </div>

      {/* Gráfico de ingresos */}
      <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid #1a2035' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #22c55e33, transparent)' }} />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Ingresos mensuales</h2>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            últimos 6 meses
          </span>
        </div>
        <RevenueChart data={stats.monthlyRevenue as any} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid #1a2035' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #22c55e22, transparent)' }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Ultimos movimientos</h2>
          {recent.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Sin pagos registrados.</p>
          ) : (
            <div className="space-y-3">
              {recent.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #0f1520' }}>
                  <div>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{p.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{p.client_name ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{fmt(p.amount)}</p>
                    <Badge label={statusLabel(p.status)} variant={statusVariant(p.status)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid #1a2035' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #fbbf2422, transparent)' }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Por cobrar</h2>
          {pending.length === 0 ? (
            <p className="text-sm flex items-center gap-2" style={{ color: '#4ade80' }}>
              <span>✓</span> Todo al dia
            </p>
          ) : (
            <div className="space-y-3">
              {pending.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #0f1520' }}>
                  <div>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{p.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                      {p.client_name ?? '—'} {p.due_date ? `· vence ${p.due_date}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#fbbf24' }}>{fmt(p.amount)}</p>
                    <Badge label={statusLabel(p.status)} variant={statusVariant(p.status)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
