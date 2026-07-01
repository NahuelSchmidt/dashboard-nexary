'use client';

import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';

function getNextDue(billingStartDate: string | null, lastPaidDate: string | null): Date | null {
  if (!billingStartDate) return null;
  const start = new Date(billingStartDate);
  const now = new Date();

  // Día del mes en que vence (mismo día que empezó la suscripción)
  const dueDay = start.getDate();

  // Si ya pagó este mes, el próximo vencimiento es el mes siguiente
  if (lastPaidDate) {
    const lastPaid = new Date(lastPaidDate);
    const nextDue = new Date(lastPaid.getFullYear(), lastPaid.getMonth() + 1, dueDay);
    return nextDue;
  }

  // Si no pagó, el vencimiento es este mes (o el próximo si ya pasó)
  let nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (nextDue < now) {
    nextDue = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }
  return nextDue;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NextDueDate({ billingStartDate, lastPaidDate, thisMonthStatus }: {
  billingStartDate: string | null;
  lastPaidDate: string | null;
  thisMonthStatus: 'paid' | 'pending' | null | undefined;
}) {
  if (!billingStartDate) return <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>;

  const nextDue = getNextDue(billingStartDate, lastPaidDate);
  if (!nextDue) return null;

  const now = new Date();
  const daysUntil = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntil < 0 && thisMonthStatus !== 'paid';
  const isDueSoon = daysUntil <= 5 && daysUntil >= 0 && thisMonthStatus !== 'paid';

  if (thisMonthStatus === 'paid') {
    return (
      <div className="flex items-center gap-1" style={{ color: '#4ade80', fontSize: 12 }}>
        <CheckCircle size={12} />
        <span>Próx. {formatDate(nextDue)}</span>
      </div>
    );
  }

  if (isOverdue) {
    return (
      <div className="flex items-center gap-1" style={{ color: '#f87171', fontSize: 12 }}>
        <AlertCircle size={12} />
        <span>Venció {formatDate(nextDue)}</span>
      </div>
    );
  }

  if (isDueSoon) {
    return (
      <div className="flex items-center gap-1" style={{ color: '#fbbf24', fontSize: 12 }}>
        <Calendar size={12} />
        <span>Vence en {daysUntil}d</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
      <Calendar size={12} />
      <span>{formatDate(nextDue)}</span>
    </div>
  );
}
