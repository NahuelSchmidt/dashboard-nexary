type Variant = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'zinc';

const styles: Record<Variant, { bg: string; color: string; border: string }> = {
  green:  { bg: 'rgba(74,222,128,0.08)',  color: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  yellow: { bg: 'rgba(251,191,36,0.08)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  red:    { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
  blue:   { bg: 'rgba(34,197,94,0.08)',   color: '#22c55e', border: 'rgba(6,182,212,0.2)' },
  purple: { bg: 'rgba(167,139,250,0.08)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
  zinc:   { bg: 'rgba(100,116,139,0.08)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
};

export default function Badge({ label, variant }: { label: string; variant: Variant }) {
  const s = styles[variant];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
}

export function typeVariant(type: string): Variant {
  const map: Record<string, Variant> = {
    web: 'blue', turnify: 'purple', gym: 'green', erp: 'yellow',
  };
  return map[type] ?? 'zinc';
}

export function statusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    active: 'green', inactive: 'zinc',
    in_progress: 'blue', completed: 'green', paused: 'yellow', cancelled: 'red',
    paid: 'green', pending: 'yellow', overdue: 'red',
  };
  return map[status] ?? 'zinc';
}

export function typeLabel(type: string) {
  const map: Record<string, string> = {
    web: 'Web', turnify: 'Turnify', gym: 'Gym SaaS', erp: 'ERP',
  };
  return map[type] ?? type;
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    active: 'Activo', inactive: 'Inactivo',
    in_progress: 'En curso', completed: 'Completado', paused: 'Pausado', cancelled: 'Cancelado',
    paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido',
  };
  return map[status] ?? status;
}
