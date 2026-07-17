import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReservationStatus } from '@/lib/types'
import { AdminReservationActions } from '@/components/admin-reservation-actions'
import { ReservationStatusBadge } from '@/components/reservation-status-badge'
import { Ticket, Calendar } from 'lucide-react'
import { formatMatchDate } from '@/lib/format'

export default async function AdminReservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Requêtes séparées pour éviter le problème de RLS sur le join profiles
  const { data: reservations, error: resError } = await supabase
    .from('reservations')
    .select('*, match:matches(*)')
    .order('created_at', { ascending: false })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  // Merge manuellement les profils
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const enriched = (reservations ?? []).map((r) => ({
    ...r,
    profile: profileMap[r.user_id] ?? null,
  }))

  const pending = enriched.filter((r) => r.status === 'pending')
  const others = enriched.filter((r) => r.status !== 'pending')

  function ReservationRow({ r, idx, total, showActions }: { r: any; idx: number; total: number; showActions: boolean }) {
    return (
      <div className={`flex items-start justify-between px-5 py-4 gap-4 ${idx !== total - 1 ? 'border-b border-border' : ''}`}>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{r.profile?.full_name ?? 'Inconnu'}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{r.match ? `OM vs ${r.match.away_team} — ${formatMatchDate(r.match.match_date)}` : 'Match inconnu'}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {r.seats_requested} place{r.seats_requested > 1 ? 's' : ''} demandée{r.seats_requested > 1 ? 's' : ''}
            {r.client_name && (
              <span className="ml-1.5 font-medium text-foreground">— pour {r.client_name}</span>
            )}
          </p>
          {r.admin_note && (
            <p className="text-xs text-muted-foreground italic">&quot;{r.admin_note}&quot;</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ReservationStatusBadge status={r.status as ReservationStatus} />
          {showActions && (
            <AdminReservationActions
              reservationId={r.id}
              matchId={r.match_id}
              seatsRequested={r.seats_requested}
              userId={r.user_id}
              matchName={r.match ? `OM vs ${r.match.away_team}` : 'ce match'}
              status={r.status}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Réservations</h1>
        <p className="text-muted-foreground mt-1">
          Approuvez ou refusez les demandes de places.
        </p>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            En attente ({pending.length})
          </h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {pending.map((r, idx) => (
              <ReservationRow key={r.id} r={r} idx={idx} total={pending.length} showActions />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Historique ({others.length})
          </h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {others.map((r, idx) => (
              <ReservationRow key={r.id} r={r} idx={idx} total={others.length} showActions />
            ))}
          </div>
        </section>
      )}

      {enriched.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ticket className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm">Aucune réservation pour le moment.</p>
        </div>
      )}
    </div>
  )
}
