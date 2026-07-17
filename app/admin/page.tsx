import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ReservationStatusBadge } from '@/components/reservation-status-badge'
import { formatMatchDate } from '@/lib/format'
import type { Reservation } from '@/lib/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { count: totalUsers },
    { count: pendingAccounts },
    { count: totalReservations },
    { count: pendingReservations },
    { count: approvedReservations },
    { count: upcomingMatches },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'collaborator'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reservations').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
  ])

  const { data: recentReservations } = await supabase
    .from('reservations')
    .select('*, match:matches(*), profile:profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Collaborateurs', value: totalUsers ?? 0, href: '/admin/accounts' },
    { label: 'Comptes en attente', value: pendingAccounts ?? 0, href: '/admin/accounts?status=pending', alert: (pendingAccounts ?? 0) > 0 },
    { label: 'Réservations', value: totalReservations ?? 0, href: '/admin/reservations' },
    { label: 'Demandes en attente', value: pendingReservations ?? 0, href: '/admin/reservations?status=pending', alert: (pendingReservations ?? 0) > 0 },
    { label: 'Places confirmées', value: approvedReservations ?? 0, href: '/admin/reservations?status=approved' },
    { label: 'Matchs à venir', value: upcomingMatches ?? 0, href: '/admin/matches' },
  ]

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestion de la plateforme de réservation OM.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(({ label, value, href, alert }) => (
          <Link
            key={label}
            href={href}
            className="border border-border rounded-lg p-4 bg-card hover:border-border/80 hover:bg-accent/40 transition-colors"
          >
            <p className={`text-2xl font-semibold ${alert ? 'text-brand-orange' : 'text-foreground'}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Pending reservations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Demandes en attente
            {(pendingReservations ?? 0) > 0 && (
              <span className="ml-2 normal-case font-normal">({pendingReservations})</span>
            )}
          </h2>
          <Link href="/admin/reservations" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' text-xs gap-1 h-7'}>
            Gérer <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentReservations && recentReservations.length > 0 ? (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            {(recentReservations as Reservation[]).map((r, idx) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-4 py-3 gap-4 ${idx !== recentReservations.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {(r as any).profile?.full_name ?? 'Utilisateur'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.match ? `OM — ${r.match.away_team}` : 'Match'}
                    {r.match && ` · ${formatMatchDate(r.match.match_date)}`}
                    {` · ${r.seats_requested} place${r.seats_requested > 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ReservationStatusBadge status={r.status} />
                  <Link href="/admin/reservations" className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' h-7 w-7'}>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="sr-only">Gérer</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-lg bg-card px-4 py-10 text-center">
            <CheckCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune demande en attente.</p>
          </div>
        )}
      </section>
    </div>
  )
}
