import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Match, Reservation } from '@/lib/types'
import { MatchCard } from '@/components/match-card'
import { ReservationStatusBadge } from '@/components/reservation-status-badge'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { formatMatchDate } from '@/lib/format'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true })
    .limit(3)

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, match:matches(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const upcomingCount = matches?.length ?? 0
  const pendingCount = reservations?.filter((r) => r.status === 'pending').length ?? 0
  const approvedCount = reservations?.filter((r) => r.status === 'approved').length ?? 0

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Bonjour</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Réservez vos places pour les prochains matchs de l&apos;OM.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-2xl font-semibold text-foreground">{upcomingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Matchs à venir</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">En attente</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-2xl font-semibold text-foreground">{approvedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmées</p>
        </div>
      </div>

      {/* Upcoming matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide text-muted-foreground">Prochains matchs</h2>
          <Link href="/dashboard/matches" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' text-xs gap-1 h-7'}>
            Voir tous <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {matches && matches.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(matches as Match[]).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6">Aucun match à venir pour le moment.</p>
        )}
      </section>

      {/* Recent reservations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Mes réservations récentes</h2>
          <Link href="/dashboard/reservations" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' text-xs gap-1 h-7'}>
            Voir toutes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {reservations && reservations.length > 0 ? (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            {(reservations as Reservation[]).map((r, idx) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-4 py-3 ${idx !== reservations.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {r.match ? `OM — ${r.match.away_team}` : 'Match'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.match ? formatMatchDate(r.match.match_date) : ''} · {r.seats_requested} place{r.seats_requested > 1 ? 's' : ''}
                  </p>
                </div>
                <ReservationStatusBadge status={r.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6">
            Pas encore de réservation.{' '}
            <Link href="/dashboard/matches" className="text-om-blue hover:underline">
              Voir les matchs disponibles
            </Link>
          </p>
        )}
      </section>
    </div>
  )
}
