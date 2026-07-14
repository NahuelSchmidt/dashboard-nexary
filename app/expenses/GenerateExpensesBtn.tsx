'use client';

import { useState } from 'react';
import { generateMonthlyExpenses } from '@/lib/actions';
import { RefreshCw } from 'lucide-react';

export default function GenerateExpensesBtn() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  async function handle() {
    if (!confirm('Generar los gastos mensuales recurrentes de este mes?')) return;
    setLoading(true);
    const created = await generateMonthlyExpenses();
    setLoading(false);
    setResult(created);
    setTimeout(() => setResult(null), 4000);
  }

  return (
    <button onClick={handle} disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
      style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', border: '1px solid var(--brand-subtle2)' }}>
      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      {result !== null ? `${result} gastos generados` : 'Generar gastos del mes'}
    </button>
  );
}
