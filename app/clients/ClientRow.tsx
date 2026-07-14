'use client';

import { useState } from 'react';
import { Client, Project } from '@/lib/types';
import Badge, { typeVariant, typeLabel, statusVariant, statusLabel } from '@/components/Badge';
import ClientActions from './ClientActions';
import MonthPayBtn from './MonthPayBtn';
import NextDueDate from '@/components/NextDueDate';
import { fmtDate } from '@/lib/dates';
import { ChevronDown, Mail, Phone, Calendar, Eye, EyeOff, Key } from 'lucide-react';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default function ClientRow({ c, showPayments, projects = [] }: { c: Client; showPayments?: boolean; projects?: Project[] }) {
  const [expanded, setExpanded] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const colSpan = showPayments ? 11 : 9;

  return (
    <>
      <tr className="cursor-pointer" style={{ borderBottom: expanded ? 'none' : '1px solid var(--border-subtle)' }}
        onClick={() => setExpanded(v => !v)}>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ChevronDown size={14} style={{ color: 'var(--text-dim)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            <span className="font-medium" style={{ color: 'var(--text)' }}>{c.name}</span>
          </div>
        </td>
        <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{c.company ?? '—'}</td>
        <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{c.email ?? '—'}</td>
        <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{c.phone ?? '—'}</td>
        <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{fmtDate(c.start_date)}</td>
        {!showPayments && <td className="px-5 py-3.5"><Badge label={typeLabel(c.type)} variant={typeVariant(c.type)} /></td>}
        <td className="px-5 py-3.5"><Badge label={statusLabel(c.status)} variant={statusVariant(c.status)} /></td>
        <td className="px-5 py-3.5">
          <NextDueDate
            billingStartDate={c.billing_start_date}
            lastPaidDate={c.last_paid_date ?? null}
            thisMonthStatus={c.this_month_status}
          />
        </td>
        {showPayments && (
          <>
            <td className="px-5 py-3.5">
              {c.plan_name ? (
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{c.plan_name}</span>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--brand)' }}>
                    {c.monthly_amount != null && c.monthly_amount > 0
                      ? `$${c.monthly_amount.toLocaleString('es-AR')}/mes`
                      : c.plan_price != null && c.plan_price > 0
                        ? `$${c.plan_price.toLocaleString('es-AR')}/mes`
                        : '—'}
                  </div>
                </div>
              ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
            </td>
            <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--brand)' }}>{fmt(c.total_paid ?? 0)}</td>
            <td className="px-5 py-3.5 font-semibold" style={{ color: '#fbbf24' }}>{fmt(c.total_pending ?? 0)}</td>
          </>
        )}
        <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <MonthPayBtn
              clientId={c.id}
              clientName={c.name}
              status={c.this_month_status}
              monthlyAmount={c.monthly_amount}
              hasAmount={!!c.monthly_amount && c.monthly_amount > 0}
            />
            <ClientActions id={c.id} client={c} projects={projects} />
          </div>
        </td>
      </tr>

      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <td colSpan={colSpan} className="px-5 pb-4">
            <div className="rounded-lg p-4 grid grid-cols-2 gap-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--brand)' }}>Contacto</p>
                {c.email && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={13} style={{ color: 'var(--text-dim)' }} />{c.email}
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Phone size={13} style={{ color: 'var(--text-dim)' }} />{c.phone}
                  </div>
                )}
                {c.start_date && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={13} style={{ color: 'var(--text-dim)' }} />Alta: {fmtDate(c.start_date)}
                  </div>
                )}
                {c.notes && <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>{c.notes}</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--brand)' }}>Acceso al servicio</p>
                {c.service_email ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={13} style={{ color: 'var(--text-dim)' }} />{c.service_email}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Sin usuario registrado</p>
                )}
                {c.service_password && (
                  <div className="flex items-center gap-2 text-sm">
                    <Key size={13} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {showPass ? c.service_password : '••••••••'}
                    </span>
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ color: 'var(--text-dim)' }}>
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
