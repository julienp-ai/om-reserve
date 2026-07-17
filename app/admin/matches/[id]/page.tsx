import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Match, Reservation } from '@/lib/types'
import { ReservationForm } from '@/components/reservation-form'
import { ReservationStatusBadge } from '@/components/reservation-status-badge'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Calendar, MapPin, Users, Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatMatchDate } from '@/lib/format'

const competitionColors: Record<string, string> = {
  'Ligue 1': 'bg-om-blue/10 text-om-blue border-om-blue/20',
  'Champions League': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
  'Coupe de France': 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
}

export default async function AdminMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (!match) notFound()

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', user.id)
    .eq('match_id', id)
    .maybeSingle()

  const available = match.total_seats - match.seats_reserved
  const isFull = available <= 0 || match.status === 'full'
  const competitionClass = competitionColors[(match as Match).competition] ?? 'bg-muted text-muted-foreground border-border'

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/matches"
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' -ml-2 gap-1.5 text-muted-foreground hover:text-foreground'}
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux matchs
      </Link>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="bg-om-blue px-6 py-8 text-center">
          <Badge variant="outline" className={`mb-4 ${competitionClass} border-white/20 text-white`}>
            {match.competition}
          </Badge>
          <div className="flex items-center justify-center gap-6 text-white">
            <div className="text-center">
              <p className="text-2xl font-bold">OM</p>
              <p className="text-white/70 text-sm mt-1">Domicile</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-lg font-bold">VS</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{match.away_team}</p>
              <p className="text-white/70 text-sm mt-1">Visiteur</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0 text-om-blue" />
            <span>{formatMatchDate(match.match_date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 text-om-blue" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 shrink-0 text-om-blue" />
            <span>{match.competition}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 shrink-0 text-om-blue" />
            <span className={isFull ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {isFull
                ? 'Plus de places disponibles'
                : `${available} place${available > 1 ? 's' : ''} disponible${available > 1 ? 's' : ''} sur ${match.total_seats}`}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card px-6 py-5 space-y-4">
        {reservation ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Votre réservation</h2>
              <ReservationStatusBadge status={reservation.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {reservation.seats_requested} place{reservation.seats_requested > 1 ? 's' : ''} réservée{reservation.seats_requested > 1 ? 's' : ''}.
            </p>
            {(reservation.status === 'pending' || reservation.status === 'approved') && (
              <ReservationForm
                matchId={id}
                userId={user.id}
                mode="cancel"
                existingReservation={reservation as Reservation}
                autoApprove
              />
            )}
          </>
        ) : isFull ? (
          <p className="text-sm text-muted-foreground">Ce match est complet.</p>
        ) : (
          <>
            <h2 className="text-base font-semibold text-foreground">Réserver des places</h2>
            <p className="text-xs text-muted-foreground">
              En tant qu&apos;admin, votre réservation est confirmée immédiatement.
            </p>
            <ReservationForm
              matchId={id}
              userId={user.id}
              mode="create"
              autoApprove
            />
          </>
        )}
      </div>
    </div>
  )
}
