import { getExpenses } from '@/lib/actions';
import { Expense } from '@/lib/types';
import Badge, { statusVariant, statusLabel } from '@/components/Badge';
import { fmtDate } from '@/lib/dates';
import NewExpenseForm from './NewExpenseForm';
import ExpenseActions from './ExpenseActions';
import GenerateExpensesBtn from './GenerateExpensesBtn';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  const total = (expenses as Expense[]).filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const pending = (expenses as Expense[]).filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Gastos</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Pagado: <span className="text-emerald-400 font-medium">{fmt(total)}</span>
            {' · '}Pendiente: <span className="text-amber-400 font-medium">{fmt(pending)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GenerateExpensesBtn />
          <NewExpenseForm />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No hay gastos registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                <th className="text-left px-5 py-3">Descripcion</th>
                <th className="text-left px-5 py-3">Categoria</th>
                <th className="text-left px-5 py-3">Monto</th>
                <th className="text-left px-5 py-3">Mensual</th>
                <th className="text-left px-5 py-3">Vencimiento</th>
                <th className="text-left px-5 py-3">Fecha de pago</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(expenses as Expense[]).map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text)" }}>{e.description}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{e.category ?? '—'}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text)" }}>{fmt(e.amount)}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{e.is_recurring ? 'Si' : '—'}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{fmtDate(e.due_date)}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{fmtDate(e.paid_date)}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={statusLabel(e.status)} variant={statusVariant(e.status)} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ExpenseActions id={e.id} currentStatus={e.status} />
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
