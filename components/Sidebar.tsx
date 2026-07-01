'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban, CreditCard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/projects', label: 'Proyectos', icon: FolderKanban },
  { href: '/payments', label: 'Pagos', icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nexary-logo.png" alt="Nexary" width={28} height={28} style={{ objectFit: 'contain', flexShrink: 0, borderRadius: 6, background: '#fff', padding: 2 }} />
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text)' }}>nexary</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={active ? {
                background: 'var(--brand-subtle2)',
                color: 'var(--brand)',
                borderLeft: '2px solid var(--brand)',
              } : {
                color: 'var(--text-muted)',
                borderLeft: '2px solid transparent',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>© 2025 Nexary</p>
      </div>
    </aside>
  );
}
