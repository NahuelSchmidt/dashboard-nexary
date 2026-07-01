'use client';

import { deleteProject } from '@/lib/actions';
import { Trash2 } from 'lucide-react';

export default function ProjectDeleteBtn({ id }: { id: number }) {
  async function handle(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm('Eliminar este proyecto? Los clientes quedarán sin proyecto asignado.')) return;
    await deleteProject(id);
  }
  return (
    <button onClick={handle} className="transition-colors" style={{ color: 'var(--text-dim)' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
      <Trash2 size={15} />
    </button>
  );
}
