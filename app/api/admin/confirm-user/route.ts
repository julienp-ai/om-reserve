import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cette route confirme l'email d'un utilisateur via le Supabase Admin client
// Elle ne peut être appelée que par un admin authentifié
export async function POST(request: Request) {
  const supabase = await createClient()

  // Vérifier que l'appelant est un admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId manquant' }, { status: 400 })

  // Utiliser le client admin (service role) pour confirmer l'email
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })

  if (error) {
    console.error('[v0] confirm-user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
