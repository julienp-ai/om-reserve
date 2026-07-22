'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface PresenceUser {
  id: string
  full_name: string
  avatar_url: string | null
  role: string
  online: boolean
}

export function PresenceList({ basePath }: { basePath: 'dashboard' | 'admin' }) {
  const [users, setUsers] = useState<PresenceUser[]>([])

  const fetchPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/presence')
      if (res.ok) setUsers(await res.json())
    } catch {}
  }, [])

  // Heartbeat : signale que l'utilisateur est en ligne
  const sendHeartbeat = useCallback(async () => {
    try { await fetch('/api/presence', { method: 'POST' }) } catch {}
  }, [])

  useEffect(() => {
    sendHeartbeat()
    fetchPresence()
    const heartbeatInterval = setInterval(sendHeartbeat, 30_000)
    const fetchInterval = setInterval(fetchPresence, 15_000)
    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(fetchInterval)
    }
  }, [sendHeartbeat, fetchPresence])

  const online = users.filter((u) => u.online)
  const offline = users.filter((u) => !u.online)

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  }

  return (
    <div className="px-3 py-3 border-t border-sidebar-border">
      <p className="text-sidebar-foreground/40 text-[10px] font-semibold uppercase tracking-wider mb-2 px-1">
        Équipe — {online.length} en ligne
      </p>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {[...online, ...offline].map((u) => (
          <Link
            key={u.id}
            href={`/${basePath}/equipe/${u.id}`}
            className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-sidebar-accent/50 transition-colors"
          >
            <div className="relative shrink-0">
              <Avatar className="h-6 w-6">
                {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.full_name} />}
                <AvatarFallback className="bg-om-blue text-white text-[9px] font-semibold">
                  {initials(u.full_name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-sidebar',
                  u.online ? 'bg-green-400' : 'bg-sidebar-foreground/20',
                )}
              />
            </div>
            <span className={cn('text-xs truncate', u.online ? 'text-sidebar-foreground' : 'text-sidebar-foreground/40')}>
              {u.full_name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
