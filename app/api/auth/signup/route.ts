import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_DOMAIN = '@concept-erp.com'

export async function POST(request: NextRequest) {
  const { email, password, fullName } = await request.json()

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
  }

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    return NextResponse.json({ error: `Seules les adresses ${ALLOWED_DOMAIN} sont autorisées.` }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Crée l'utilisateur avec email déjà confirmé — pas de mail de vérification envoyé
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'collaborator',
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ userId: data.user.id }, { status: 200 })
}
