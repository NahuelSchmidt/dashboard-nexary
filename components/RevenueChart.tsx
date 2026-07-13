'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
  return '$' + n;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 15 }}>
          ${payload[0].value.toLocaleString('es-AR')}
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy } = props;
  return <circle cx={cx} cy={cy} r={4} fill="var(--brand)" stroke="var(--bg-card)" strokeWidth={2} />;
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
      <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmt}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--brand)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="natural"
          dataKey="total"
          stroke="var(--brand)"
          strokeWidth={3}
          fill="url(#greenGradient)"
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: 'var(--brand)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
