import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Match, Reservation } from '@/lib/types'
import { MatchCard } from '@/components/match-card'
import { Calendar } from 'lucide-react'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true })

  const { data: userReservations } = await supabase
    .from('reservations')
    .select('match_id, status, seats_requested')
    .eq('user_id', user.id)

  const reservationMap = new Map(
    (userReservations ?? []).map((r) => [r.match_id, r]),
  )

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance flex items-center gap-2">
          <Calendar className="w-6 h-6 text-om-blue" />
          Prochains matchs
        </h1>
        <p className="text-muted-foreground mt-1">
          Cliquez sur un match pour demander vos places.
        </p>
      </div>

      {matches && matches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(matches as Match[]).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              reservation={reservationMap.get(match.id) ?? null}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Aucun match à venir pour le moment.</p>
        </div>
      )}
    </div>
  )
}
