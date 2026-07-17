import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Tries to fetch OM fixtures from a public football API.
// Falls back gracefully if unavailable — admins can always add manually.
const OM_TEAM_ID = 516 // football-data.org OM team ID

export async function POST() {
  const supabase = await createClient()

  // Check admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  // Attempt to fetch from football-data.org
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      message: 'Aucune clé API configurée (FOOTBALL_DATA_API_KEY). Ajoutez des matchs manuellement.',
    })
  }

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/teams/${OM_TEAM_ID}/matches?status=SCHEDULED`,
      {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 0 },
      },
    )

    if (!res.ok) {
      return NextResponse.json({ message: 'API football indisponible. Ajoutez des matchs manuellement.' })
    }

    const json = await res.json()
    const matches = json.matches ?? []

    let imported = 0
    for (const m of matches.slice(0, 20)) {
      const homeIsOM = m.homeTeam?.id === OM_TEAM_ID
      const awayTeam = homeIsOM ? m.awayTeam?.name : m.homeTeam?.name
      if (!awayTeam) continue

      const competition = m.competition?.name ?? 'Ligue 1'
      const matchDate = m.utcDate

      // Insert only new matches (by external_id)
      const externalId = String(m.id)
      const { error } = await supabase.from('matches').upsert(
        {
          away_team: awayTeam,
          match_date: matchDate,
          competition,
          venue: homeIsOM ? 'Orange Vélodrome, Marseille' : m.venue ?? 'Stade extérieur',
          total_seats: 10,
          status: 'upcoming',
          external_id: externalId,
        },
        { onConflict: 'external_id', ignoreDuplicates: true },
      )
      if (!error) imported++
    }

    return NextResponse.json({
      message: `${imported} match(s) importé(s) depuis le calendrier officiel.`,
    })
  } catch {
    return NextResponse.json({
      message: 'Erreur lors de la récupération du calendrier. Ajoutez des matchs manuellement.',
    })
  }
}
