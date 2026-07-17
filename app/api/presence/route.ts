import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, last_seen_at')
    .eq('status', 'active')
    .order('full_name')

  const result = (profiles ?? []).map((p) => ({
    ...p,
    online: p.last_seen_at ? p.last_seen_at > twoMinutesAgo : false,
  }))

  return NextResponse.json(result)
}
