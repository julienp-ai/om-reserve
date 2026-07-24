import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSbAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const adminSb = createSbAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const cleanEmail = email.toLowerCase().trim()

    // Verifie que l'email existe dans les profiles
    const { data: profile, error: profileError } = await adminSb
      .from('profiles')
      .select('id, full_name')
      .eq('email', cleanEmail)
      .single()

    console.log('[v0] profile lookup:', profile, profileError)

    if (!profile) {
      // Ne pas reveler si l'email existe ou non
      return NextResponse.json({})
    }

    // Verifie si une demande pending existe deja
    const { data: existing } = await adminSb
      .from('password_reset_requests')
      .select('id')
      .eq('email', cleanEmail)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({})
    }

    // Cree la demande
    const { error: insertError } = await adminSb
      .from('password_reset_requests')
      .insert({ email: cleanEmail, user_id: profile.id })

    console.log('[v0] insert error:', insertError)

    if (insertError) {
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de la demande. (' + insertError.message + ')' },
        { status: 500 },
      )
    }

    // Notifier tous les admins
    const { data: admins } = await adminSb
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      await adminSb.from('notifications').insert(
        admins.map((admin) => ({
          user_id: admin.id,
          title: 'Demande de reinitialisation de mot de passe',
          message: `${profile.full_name} (${cleanEmail}) demande la reinitialisation de son mot de passe.`,
          type: 'new_account',
        })),
      )
    }

    return NextResponse.json({})
  } catch (err) {
    console.log('[v0] unexpected error:', err)
    return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 })
  }
}
