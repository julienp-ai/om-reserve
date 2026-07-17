'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Ticket, User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PresenceList } from '@/components/presence-list'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/matches', label: 'Matchs', icon: Calendar, exact: false },
  { href: '/dashboard/reservations', label: 'Réservations', icon: Ticket, exact: false },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, exact: false },
  { href: '/dashboard/profil', label: 'Mon profil', icon: User, exact: false },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-sidebar h-full border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
        <Image src="/concept-erp-logo.png" alt="Concept ERP" width={28} height={28} className="object-contain" />
        <div>
          <p className="text-white font-semibold text-sm leading-none">Concept ERP</p>
          <p className="text-white/40 text-[11px] mt-0.5">Réservation OM</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3" aria-label="Navigation principale">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5',
                active
                  ? 'bg-sidebar-accent text-white font-medium'
                  : 'text-white/55 hover:bg-sidebar-accent/50 hover:text-white',
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand-orange' : 'text-white/40')} />
              {label}
            </Link>
          )
        })}
      </nav>

      <PresenceList basePath="dashboard" />
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-white/25 text-[11px]">
          © {new Date().getFullYear()} Concept ERP
        </p>
      </div>
    </aside>
  )
}
