'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './notification-bell'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { LogOut } from 'lucide-react'
import { Button } from './ui/button'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Accueil',
  '/dashboard/matches': 'Matchs',
  '/dashboard/reservations': 'Réservations',
  '/dashboard/messages': 'Messages',
  '/dashboard/profil': 'Mon profil',
  '/admin': 'Vue d\'ensemble',
  '/admin/accounts': 'Comptes',
  '/admin/reservations': 'Réservations',
  '/admin/matches': 'Matchs',
  '/admin/messages': 'Messages',
  '/admin/profil': 'Mon profil',
}

export function MobileHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
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

  // Find best matching title
  const title =
    Object.entries(pageTitles)
      .filter(([path]) => pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'OM Reserve'

  const profilHref = pathname.startsWith('/admin') ? '/admin/profil' : '/dashboard/profil'

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center px-4 h-14"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Logo */}
      <Image src="/concept-erp-logo.png" alt="Concept ERP" width={28} height={28} className="object-contain shrink-0" />

      {/* Title */}
      <span className="ml-3 text-[#0D3B5E] font-bold text-base flex-1 truncate">{title}</span>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <NotificationBell userId={profile.id} />

        <Link href={profilHref} className="flex items-center justify-center w-8 h-8 rounded-full">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={profile.full_name} />}
            <AvatarFallback className="bg-[#0D3B5E] text-white text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-8 w-8 text-[#0D3B5E]/40 hover:text-[#0D3B5E]"
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4" />
          <span className="sr-only">Se déconnecter</span>
        </Button>
      </div>
    </header>
  )
}
