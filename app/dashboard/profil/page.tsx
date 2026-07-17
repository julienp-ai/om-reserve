import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChangePasswordForm } from '@/components/change-password-form'
import { AvatarUploadClient } from '@/components/avatar-upload-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  return (
    <main className="max-w-xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Photo de profil et mot de passe.</p>
      </div>

      {/* Avatar */}
      <section className="rounded-lg border border-border bg-card p-6 flex flex-col items-center gap-4">
        <AvatarUploadClient
          userId={profile.id}
          avatarUrl={profile.avatar_url ?? null}
          fullName={profile.full_name}
        />
      </section>

      {/* Infos */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-foreground mb-4">Informations</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground mb-0.5">Nom complet</dt>
            <dd className="font-medium text-foreground">{profile.full_name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-0.5">Email</dt>
            <dd className="font-medium text-foreground">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-0.5">Rôle</dt>
            <dd className="font-medium text-foreground">
              {profile.role === 'admin' ? 'Administrateur' : 'Collaborateur'}
            </dd>
          </div>
        </dl>
      </section>

      {/* Password */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-foreground mb-5">Changer le mot de passe</h2>
        <ChangePasswordForm />
      </section>
    </main>
  )
}
