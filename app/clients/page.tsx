import { getClients, getProjects } from '@/lib/actions';
import { Client, Project } from '@/lib/types';
import NewClientForm from './NewClientForm';
import ClientRow from './ClientRow';
import GenerateBillingBtn from './GenerateBillingBtn';

export default async function ClientsPage() {
  const [clients, projects] = await Promise.all([getClients(), getProjects()]);
  const activeWithBilling = (clients as Client[]).filter(c => c.status === 'active' && c.monthly_amount && c.monthly_amount > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Clientes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>
            {(clients as Client[]).length} registrados · {activeWithBilling} con facturación activa
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeWithBilling > 0 && <GenerateBillingBtn count={activeWithBilling} />}
          <NewClientForm projects={projects as Project[]} />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {clients.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No hay clientes todavía.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3">Empresa</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Teléfono</th>
                <th className="text-left px-5 py-3">Alta</th>
                <th className="text-left px-5 py-3">Servicio</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Próx. vencimiento</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(clients as Client[]).map(c => (
                <ClientRow key={c.id} c={c} projects={projects as Project[]} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
