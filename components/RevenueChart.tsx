'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MonthData {
  month: string;
  total: number;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split('-');
  const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return names[parseInt(month) - 1] + ' ' + year.slice(2);
}

function fmt(n: number) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
  return '$' + n;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid #1a2035', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15 }}>
          ${payload[0].value.toLocaleString('es-AR')}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: { data: MonthData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        Sin datos de ingresos todavia.
      </div>
    );
  }

  const chartData = data.map(d => ({ ...d, label: formatMonth(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#1a2035" strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.05)' }} />
        <Bar
          dataKey="total"
          fill="url(#greenGradient)"
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
