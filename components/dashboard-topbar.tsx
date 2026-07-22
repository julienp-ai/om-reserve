'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { NotificationBell } from './notification-bell'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

export function DashboardTopbar({ profile }: { profile: Profile }) {
  const router = useRouter()
  const pathname = usePathname()
  // Charge avatar_url fraîchement depuis Supabase côté client
  // pour qu'il s'affiche immédiatement après upload sans attendre
  // un re-render du layout serveur.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', profile.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      })

    const handler = (e: Event) => {
      const url = (e as CustomEvent<{ url: string }>).detail?.url
      if (url) setAvatarUrl(url)
    }
    window.addEventListener('avatar-updated', handler)
    return () => window.removeEventListener('avatar-updated', handler)
  }, [profile.id])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const profilHref = pathname.startsWith('/admin') ? '/admin/profil' : '/dashboard/profil'

  return (
    <header className="h-14 shrink-0 flex items-center justify-end px-5 border-b border-sidebar-border bg-sidebar gap-2">
      <NotificationBell userId={profile.id} />

      <Link
        href={profilHref}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
      >
        <Avatar className="h-7 w-7">
          {avatarUrl && (
            <AvatarImage src={avatarUrl} alt={profile.full_name} />
          )}
          <AvatarFallback className="bg-om-blue text-om-blue-foreground text-[11px] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">{profile.full_name}</p>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground"
        title="Se déconnecter"
      >
        <LogOut className="w-4 h-4" />
        <span className="sr-only">Se déconnecter</span>
      </Button>
    </header>
  )
}
