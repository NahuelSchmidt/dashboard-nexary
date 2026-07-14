'use client';

import { updateExpenseStatus, deleteExpense } from '@/lib/actions';
import { ExpenseStatus } from '@/lib/types';
import { Trash2, Check, Clock } from 'lucide-react';

export default function ExpenseActions({ id, currentStatus }: { id: number; currentStatus: ExpenseStatus }) {
  async function handleDelete() {
    if (!confirm('Eliminar este gasto?')) return;
    await deleteExpense(id);
  }

  async function cycleStatus() {
    await updateExpenseStatus(id, currentStatus === 'paid' ? 'pending' : 'paid');
  }

  const icon = currentStatus === 'paid'
    ? <Check size={15} className="text-emerald-400" />
    : <Clock size={15} className="text-amber-400" />;

  return (
    <div className="flex items-center gap-2">
      <button onClick={cycleStatus} title="Cambiar estado" className="hover:opacity-70 transition-opacity">
        {icon}
      </button>
      <button onClick={handleDelete} className="text-zinc-500 hover:text-red-400 transition-colors">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
