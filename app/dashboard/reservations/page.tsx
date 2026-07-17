import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Reservation } from '@/lib/types'
import { ReservationStatusBadge } from '@/components/reservation-status-badge'
import { CancelReservationButton } from '@/components/cancel-reservation-button'
import { buttonVariants } from '@/components/ui/button'
import { Ticket, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatMatchDate } from '@/lib/format'

export default async function ReservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, match:matches(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const groups = {
    pending: (reservations ?? []).filter((r) => r.status === 'pending'),
    approved: (reservations ?? []).filter((r) => r.status === 'approved'),
    rejected: (reservations ?? []).filter((r) => r.status === 'rejected'),
    cancelled: (reservations ?? []).filter((r) => r.status === 'cancelled'),
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Ticket className="w-6 h-6 text-om-blue" />
          Mes réservations
        </h1>
        <p className="text-muted-foreground mt-1">
          Suivez l&apos;état de toutes vos demandes de places.
        </p>
      </div>

      {(!reservations || reservations.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ticket className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore de réservation.</p>
          <Link href="/dashboard/matches" className={buttonVariants() + ' bg-om-blue text-om-blue-foreground hover:bg-om-blue/90'}>
            Voir les matchs disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {(['pending', 'approved', 'rejected', 'cancelled'] as const).map((status) => {
            const items = groups[status]
            if (items.length === 0) return null
            const labels = { pending: 'En attente', approved: 'Confirmées', rejected: 'Refusées', cancelled: 'Annulées' }
            return (
              <section key={status}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {labels[status]} ({items.length})
                </h2>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {(items as Reservation[]).map((r, idx) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between px-5 py-4 gap-4 ${idx !== items.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {r.match ? `OM vs ${r.match.away_team}` : 'Match'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {r.match && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatMatchDate(r.match.match_date)}
                            </span>
                          )}
                          <span>{r.seats_requested} place{r.seats_requested > 1 ? 's' : ''}</span>
                        </div>
                        {r.admin_note && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            &quot;{r.admin_note}&quot;
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ReservationStatusBadge status={r.status} />
                        {(r.status === 'pending' || r.status === 'approved') && (
                          <CancelReservationButton reservationId={r.id} />
                        )}
                        {r.match && (
                          <Link href={`/dashboard/matches/${r.match.id}`} className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' h-7 w-7'}>
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span className="sr-only">Voir le match</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
