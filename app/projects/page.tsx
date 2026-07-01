import { getProjects } from '@/lib/actions';
import { Project } from '@/lib/types';
import Badge, { typeVariant, typeLabel } from '@/components/Badge';
import Link from 'next/link';
import NewProjectForm from './NewProjectForm';
import ProjectDeleteBtn from './ProjectDeleteBtn';
import { Users, ChevronRight } from 'lucide-react';

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default async function ProjectsPage() {
  const projects = await getProjects() as Project[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Proyectos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{projects.length} proyectos</p>
        </div>
        <NewProjectForm />
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl p-12 text-center text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
          No hay proyectos todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block group">
              <div className="rounded-xl p-5 transition-all relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--brand)22, transparent)' }} />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="mb-1"><Badge label={typeLabel(p.type)} variant={typeVariant(p.type)} /></div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{p.name}</h2>
                    {p.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <ProjectDeleteBtn id={p.id} />
                    <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-input)' }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={12} style={{ color: 'var(--text-dim)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Clientes</span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{p.client_count ?? 0}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-input)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Cobrado</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{fmt(p.total_revenue ?? 0)}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-input)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Pendiente</p>
                    <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>{fmt(p.pending_revenue ?? 0)}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
