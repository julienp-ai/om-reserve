'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelReservation } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleCancel() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setLoading(true)
    await cancelReservation(reservationId)
    setLoading(false)
    startTransition(() => router.refresh())
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Confirmer ?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/5"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Oui'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="h-7 text-xs"
        >
          Non
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      className="h-7 text-xs text-muted-foreground hover:text-destructive"
    >
      <X className="w-3 h-3 mr-1" />
      Annuler
    </Button>
  )
}
