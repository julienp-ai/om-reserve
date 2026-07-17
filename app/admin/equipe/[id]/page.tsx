import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SendMessageModal } from '@/components/send-message-modal'

export default async function AdminTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role, status, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: presenceData } = await supabase
    .from('profiles')
    .select('last_seen_at')
    .eq('id', id)
    .single()

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
  const isOnline = presenceData?.last_seen_at ? presenceData.last_seen_at > twoMinutesAgo : false

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {profile.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            )}
            <AvatarFallback className="bg-om-blue text-white text-2xl font-semibold">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${
              isOnline ? 'bg-green-400' : 'bg-muted'
            }`}
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-foreground">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className={isOnline ? 'text-green-600 border-green-500/30' : 'text-muted-foreground'}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Badge>
            {profile.role === 'admin' && (
              <Badge variant="outline" className="text-brand-orange border-brand-orange/30">
                Admin
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>

        {profile.id !== user.id && (
          <SendMessageModal
            senderId={user.id}
            receiverId={profile.id}
            receiverName={profile.full_name}
          />
        )}
      </div>
    </div>
  )
}
