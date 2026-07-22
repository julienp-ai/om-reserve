'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Ticket, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  basePath: 'dashboard' | 'admin'
}

export function MobileBottomNav({ basePath }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems =
    basePath === 'admin'
      ? [
          { href: '/admin', label: 'Accueil', icon: LayoutDashboard, exact: true },
          { href: '/admin/accounts', label: 'Comptes', icon: User, exact: false },
          { href: '/admin/reservations', label: 'Réservations', icon: Ticket, exact: false },
          { href: '/admin/matches', label: 'Matchs', icon: Calendar, exact: false },
          { href: '/admin/messages', label: 'Messages', icon: MessageSquare, exact: false },
        ]
      : [
          { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard, exact: true },
          { href: '/dashboard/matches', label: 'Matchs', icon: Calendar, exact: false },
          { href: '/dashboard/reservations', label: 'Réservations', icon: Ticket, exact: false },
          { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, exact: false },
          { href: '/dashboard/profil', label: 'Profil', icon: User, exact: false },
        ]

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden"
      aria-label="Navigation mobile"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors"
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                active ? 'bg-[#FF4F00]' : 'bg-transparent',
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  active ? 'text-white' : 'text-[#0D3B5E]/40',
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-medium leading-none',
                active ? 'text-[#FF4F00]' : 'text-[#0D3B5E]/50',
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
