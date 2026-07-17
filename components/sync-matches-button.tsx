'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'

export function SyncMatchesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/matches/sync', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setMessage(data.message ?? 'Synchronisation terminée.')
        router.refresh()
      } else {
        setMessage(data.error ?? 'Erreur lors de la synchronisation.')
      }
    } catch {
      setMessage('Erreur réseau lors de la synchronisation.')
    }
    setLoading(false)
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={loading}
        className="shrink-0"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Synchroniser le calendrier
      </Button>
      {message && (
        <p className="text-xs text-muted-foreground max-w-52 text-right">{message}</p>
      )}
    </div>
  )
}
