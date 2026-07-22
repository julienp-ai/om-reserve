'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Reservation } from '@/lib/types'
import { createReservation, cancelReservation } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Minus, Plus, CheckCircle2 } from 'lucide-react'

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
      setSuccess(autoApprove ? 'Réservation confirmée !' : 'Votre demande a bien été envoyée.')
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
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <p className="text-[#0D3B5E] font-semibold text-base">{success}</p>
        {!autoApprove && (
          <p className="text-sm text-gray-500">Un administrateur va valider votre demande.</p>
        )}
      </div>
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
          className="w-full h-12 border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-base"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Annulation...</> : 'Annuler ma réservation'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Selecteur de places */}
      <div>
        <p className="text-sm font-semibold text-[#0D3B5E] mb-3">
          Nombre de places <span className="font-normal text-gray-400">(max. 4)</span>
        </p>

        <div className="flex items-center justify-center gap-6 bg-gray-50 rounded-2xl p-4">
          <button
            type="button"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
            disabled={seats <= 1}
            className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center text-[#0D3B5E] disabled:opacity-30 hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors active:scale-95"
            aria-label="Diminuer"
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="text-center min-w-[60px]">
            <span className="text-4xl font-bold text-[#0D3B5E]">{seats}</span>
            <p className="text-xs text-gray-400 mt-0.5">place{seats > 1 ? 's' : ''}</p>
          </div>

          <button
            type="button"
            onClick={() => setSeats((s) => Math.min(4, s + 1))}
            disabled={seats >= 4}
            className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center text-[#0D3B5E] disabled:opacity-30 hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors active:scale-95"
            aria-label="Augmenter"
          >
            <Plus className="w-5 h-5" />
          </button>
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
        className="w-full h-13 bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold rounded-xl text-base"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Réservation en cours...</>
        ) : (
          `Réserver ${seats} place${seats > 1 ? 's' : ''}`
        )}
      </Button>

      {!autoApprove && (
        <p className="text-xs text-center text-gray-400">
          Votre demande sera validée par un administrateur.
        </p>
      )}
    </div>
  )
}
