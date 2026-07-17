import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Match } from '@/lib/types'
import { AdminMatchActions } from '@/components/admin-match-actions'
import { AddMatchForm } from '@/components/add-match-form'
import { SyncMatchesButton } from '@/components/sync-matches-button'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Calendar, Users, Ticket } from 'lucide-react'
import { formatMatchDate } from '@/lib/format'
import Link from 'next/link'

const competitionColors: Record<string, string> = {
  'Ligue 1': 'bg-om-blue/10 text-om-blue border-om-blue/20',
  'Champions League': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
  'Coupe de France': 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
}

export default async function AdminMatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  const upcoming = (matches ?? []).filter((m) => m.status === 'upcoming' && new Date(m.match_date) >= new Date())
  const past = (matches ?? []).filter((m) => m.status !== 'upcoming' || new Date(m.match_date) < new Date())

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-om-blue" />
            Gestion des matchs
          </h1>
          <p className="text-muted-foreground mt-1">
            Ajoutez ou modifiez les matchs disponibles pour les réservations.
          </p>
        </div>
        <SyncMatchesButton />
      </div>

      {/* Add match */}
      <AddMatchForm />

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Prochains matchs ({upcoming.length})
        </h2>
        {upcoming.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {(upcoming as Match[]).map((m, idx) => {
              const competitionClass = competitionColors[m.competition] ?? 'bg-muted text-muted-foreground border-border'
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between px-5 py-4 gap-4 ${idx !== upcoming.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">OM vs {m.away_team}</p>
                      <Badge variant="outline" className={competitionClass + ' text-xs'}>
                        {m.competition}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatMatchDate(m.match_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {m.seats_reserved}/{m.total_seats} places réservées
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/matches/${m.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' h-8 text-xs gap-1.5'}
                    >
                      <Ticket className="w-3 h-3" />
                      Réserver
                    </Link>
                    <AdminMatchActions match={m} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucun match à venir.</p>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Matchs passés ({past.length})
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden opacity-70">
            {(past as Match[]).map((m, idx) => {
              const competitionClass = competitionColors[m.competition] ?? 'bg-muted text-muted-foreground border-border'
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between px-5 py-3.5 gap-4 ${idx !== past.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">OM vs {m.away_team}</p>
                      <Badge variant="outline" className={competitionClass + ' text-xs'}>
                        {m.competition}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{formatMatchDate(m.match_date)}</p>
                  </div>
                  <AdminMatchActions match={m} />
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
