interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'default' | 'green' | 'yellow' | 'brand';
}

const accents: Record<string, string> = {
  default: 'var(--text-muted)',
  green: '#4ade80',
  yellow: '#fbbf24',
  brand: 'var(--brand)',
  cyan: 'var(--brand)',
};

export default function StatCard({ label, value, sub, color = 'default' }: StatCardProps) {
  const accent = accents[color] ?? accents.default;
  return (
    <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}44, transparent)` }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold mt-1.5" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{sub}</p>}
    </div>
  );
}
