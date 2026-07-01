import { getProject, getClientsByProject, getPlansByProject } from '@/lib/actions';
import { Client, Project, Plan } from '@/lib/types';
import Badge, { typeVariant, typeLabel, statusVariant, statusLabel } from '@/components/Badge';
import ClientRow from '@/app/clients/ClientRow';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import PlanManager from './PlanManager';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  const [project, clients, plans] = await Promise.all([
    getProject(projectId),
    getClientsByProject(projectId),
    getPlansByProject(projectId),
  ]);

  if (!project) notFound();

  const p = project as Project;
  const cs = clients as Client[];
  const totalPaid = cs.reduce((s, c) => s + (c.total_paid ?? 0), 0);
  const totalPending = cs.reduce((s, c) => s + (c.total_pending ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: 'var(--text-dim)' }}>
          <ArrowLeft size={14} /> Proyectos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{p.name}</h1>
          <Badge label={typeLabel(p.type)} variant={typeVariant(p.type)} />
        </div>
        {p.description && <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{p.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Clientes</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{cs.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Total cobrado</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--brand)' }}>{fmt(totalPaid)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Pendiente</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#fbbf24' }}>{fmt(totalPending)}</p>
        </div>
      </div>

      {/* Planes */}
      <PlanManager projectId={projectId} plans={plans as Plan[]} />

      {/* Clientes */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            Clientes del proyecto
          </h2>
        </div>
        {cs.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
            Sin clientes asignados. Asigná clientes desde la sección Clientes.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3">Empresa</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Teléfono</th>
                <th className="text-left px-5 py-3">Alta</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Plan</th>
                <th className="text-left px-5 py-3">Cobrado</th>
                <th className="text-left px-5 py-3">Pendiente</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cs.map(c => <ClientRow key={c.id} c={c} showPayments />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
