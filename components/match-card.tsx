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
  'Ligue 1':          'bg-[#0D3B5E]/10 text-[#0D3B5E] border-[#0D3B5E]/20',
  'Champions League': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  'Coupe de France':  'bg-red-500/10 text-red-700 border-red-500/20',
}

const reservationColors: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  pending:  'bg-[#FF4F00]/10 text-[#FF4F00] border-[#FF4F00]/20',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
}

const reservationLabels: Record<string, string> = {
  approved: 'Confirmée',
  pending:  'En attente',
  rejected: 'Refusée',
}

export function MatchCard({ match, reservation, href }: MatchCardProps) {
  const available = match.total_seats - match.seats_reserved
  const isFull = available <= 0 || match.status === 'full'
  const competitionClass = competitionColors[match.competition] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  const cardHref = href ?? `/dashboard/matches/${match.id}`

  return (
    <Link
      href={cardHref}
      className="block border border-gray-200 rounded-2xl bg-white hover:border-[#FF4F00]/40 hover:shadow-sm transition-all overflow-hidden"
    >
      {/* Bandeau couleur en haut */}
      <div className="h-1.5 bg-[#0D3B5E]" />

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="outline" className={`text-[11px] font-medium ${competitionClass}`}>
            {match.competition}
          </Badge>
          {reservation ? (
            <Badge variant="outline" className={`text-[11px] font-medium ${reservationColors[reservation.status] ?? ''}`}>
              {reservationLabels[reservation.status] ?? reservation.status}
            </Badge>
          ) : isFull ? (
            <Badge variant="outline" className="text-[11px] font-medium bg-red-50 text-red-600 border-red-200">
              Complet
            </Badge>
          ) : null}
        </div>

        {/* Equipes */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-base font-bold text-[#0D3B5E]">OM</span>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">VS</span>
          <span className="text-base font-bold text-[#0D3B5E] text-right flex-1 text-right">{match.away_team}</span>
        </div>

        {/* Infos */}
        <div className="space-y-2 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 shrink-0 text-[#FF4F00]" />
            <span>{formatMatchDate(match.match_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 shrink-0 text-[#FF4F00]" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 shrink-0 text-[#FF4F00]" />
            <span className={isFull ? 'text-red-500 font-medium' : 'text-gray-500'}>
              {isFull
                ? 'Plus de places disponibles'
                : `${available} place${available > 1 ? 's' : ''} disponible${available > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
