'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Reservation } from '@/lib/types'
import { createReservation, cancelReservation } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Minus, Plus } from 'lucide-react'

interface ReservationFormProps {
  matchId: string
  userId: string
  mode: 'create' | 'cancel'
  existingReservation?: Reservation
  autoApprove?: boolean
}

export function ReservationForm({ matchId, userId, mode, existingReservation, autoApprove = false }: ReservationFormProps) {
  const router = useRouter()
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)
    setLoading(true)
    const result = await createReservation({ matchId, userId, seatsRequested: seats, autoApprove })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(autoApprove ? 'Réservation confirmée directement.' : 'Votre demande de réservation a été envoyée avec succès.')
      router.refresh()
    }
  }

  async function handleCancel() {
    if (!existingReservation) return
    setError(null)
    setLoading(true)
    const result = await cancelReservation(existingReservation.id)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Votre réservation a été annulée.')
      router.refresh()
    }
  }

  if (success) {
    return (
      <Alert className="border-green-500/30 bg-green-500/5">
        <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
      </Alert>
    )
  }

  if (mode === 'cancel') {
    return (
      <div className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/5"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Annulation...</> : 'Annuler ma demande'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Nombre de places (max. 4)
        </label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
            disabled={seats <= 1}
            type="button"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-xl font-bold text-foreground w-8 text-center">{seats}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSeats((s) => Math.min(4, s + 1))}
            disabled={seats >= 4}
            type="button"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-1">
            place{seats > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleCreate}
        disabled={loading}
        className="bg-om-blue text-om-blue-foreground hover:bg-om-blue/90"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réservation...</>
        ) : (
          `Réserver ${seats} place${seats > 1 ? 's' : ''}`
        )}
      </Button>

      {!autoApprove && (
        <p className="text-xs text-muted-foreground">
          Votre demande sera validée par un administrateur.
        </p>
      )}
    </div>
  )
}
