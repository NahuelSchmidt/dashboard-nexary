'use client';

import { updatePaymentStatus, deletePayment } from '@/lib/actions';
import { PaymentStatus } from '@/lib/types';
import { Trash2, Check, Clock, AlertCircle } from 'lucide-react';

export default function PaymentActions({ id, currentStatus }: { id: number; currentStatus: PaymentStatus }) {
  async function handleDelete() {
    if (!confirm('Eliminar este pago?')) return;
    await deletePayment(id);
  }

  async function cycleStatus() {
    const next: Record<PaymentStatus, PaymentStatus> = {
      pending: 'paid',
      overdue: 'paid',
      paid: 'pending',
    };
    await updatePaymentStatus(id, next[currentStatus]);
  }

  const icon = currentStatus === 'paid'
    ? <Check size={15} className="text-emerald-400" />
    : currentStatus === 'overdue'
    ? <AlertCircle size={15} className="text-red-400" />
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
