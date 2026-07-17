import type { Match } from '@/lib/types'
import Link from 'next/link'
import { formatMatchDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users } from 'lucide-react'

interface MatchCardProps {
  match: Match
  reservation?: { status: string; seats_requested: number } | null
  href?: string
}

const competitionColors: Record<string, string> = {
  'Ligue 1':          'bg-om-blue/10 text-om-blue border-om-blue/20',
  'Champions League': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
  'Coupe de France':  'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
}

const reservationColors: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
  pending:  'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  rejected: 'bg-muted text-muted-foreground border-border',
}

const reservationLabels: Record<string, string> = {
  approved: 'Confirmée',
  pending:  'En attente',
  rejected: 'Refusée',
}

export function MatchCard({ match, reservation, href }: MatchCardProps) {
  const available = match.total_seats - match.seats_reserved
  const isFull = available <= 0 || match.status === 'full'
  const competitionClass = competitionColors[match.competition] ?? 'bg-muted text-muted-foreground border-border'
  const cardHref = href ?? `/dashboard/matches/${match.id}`

  return (
    <Link
      href={cardHref}
      className="block border border-border rounded-lg bg-card hover:bg-accent/30 transition-colors overflow-hidden"
    >
      {/* Top */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="outline" className={`text-[11px] ${competitionClass}`}>
            {match.competition}
          </Badge>
          {reservation && (
            <Badge variant="outline" className={`text-[11px] ${reservationColors[reservation.status] ?? ''}`}>
              {reservationLabels[reservation.status] ?? reservation.status}
            </Badge>
          )}
          {!reservation && isFull && (
            <Badge variant="outline" className="text-[11px] bg-destructive/10 text-destructive border-destructive/20">
              Complet
            </Badge>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">OM</span>
          <span className="text-[11px] text-muted-foreground font-medium">vs</span>
          <span className="text-sm font-semibold text-foreground text-right">{match.away_team}</span>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-4 space-y-1 border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{formatMatchDate(match.match_date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{match.venue}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <span className={isFull ? 'text-destructive' : 'text-muted-foreground'}>
            {isFull
              ? 'Plus de places'
              : `${available} place${available > 1 ? 's' : ''} disponible${available > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
