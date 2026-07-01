'use client';

import { useState } from 'react';
import { deleteClient } from '@/lib/actions';
import { Client, Project } from '@/lib/types';
import { Trash2, Pencil } from 'lucide-react';
import EditClientModal from './EditClientModal';

export default function ClientActions({ id, client, projects }: { id: number; client: Client; projects: Project[] }) {
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm('Eliminar este cliente?')) return;
    await deleteClient(id);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          <Pencil size={15} />
        </button>
        <button onClick={handleDelete} className="transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <Trash2 size={15} />
        </button>
      </div>
      {editing && <EditClientModal client={client} projects={projects} onClose={() => setEditing(false)} />}
    </>
  );
}
