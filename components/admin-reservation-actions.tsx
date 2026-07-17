'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveReservation, rejectReservation, deleteReservation } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react'

interface AdminReservationActionsProps {
  reservationId: string
  matchId: string
  seatsRequested: number
  userId: string
  matchName: string
  status?: string
}

export function AdminReservationActions({
  reservationId,
  matchId,
  seatsRequested,
  userId,
  matchName,
  status,
}: AdminReservationActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showRejectNote, setShowRejectNote] = useState(false)
  const [clientName, setClientName] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  function doRefresh() {
    startTransition(() => router.refresh())
  }

  async function handleApprove() {
    if (!showApproveForm) {
      setShowApproveForm(true)
      setShowRejectNote(false)
      return
    }
    setLoading('approve')
    setError(null)
    const result = await approveReservation({ reservationId, userId, matchName, seatsRequested, clientName })
    setLoading(null)
    if (result.error) {
      setError(result.error)
    } else {
      doRefresh()
    }
  }

  async function handleDelete() {
    setLoading('delete')
    setError(null)
    const result = await deleteReservation(reservationId)
    setLoading(null)
    if (result.error) {
      setError(result.error)
    } else {
      doRefresh()
    }
  }

  async function handleReject() {
    if (!showRejectNote) {
      setShowRejectNote(true)
      setShowApproveForm(false)
      return
    }
    setLoading('reject')
    setError(null)
    const result = await rejectReservation({ reservationId, userId, matchName, note })
    setLoading(null)
    if (result.error) {
      setError(result.error)
    } else {
      doRefresh()
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      {showApproveForm && (
        <Input
          placeholder="Nom du client (optionnel)"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="h-8 text-xs w-52"
          autoFocus
        />
      )}
      {showRejectNote && (
        <Input
          placeholder="Motif du refus (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-8 text-xs w-52"
          autoFocus
        />
      )}
      <div className="flex items-center gap-2">
        {status === 'approved' || status === 'rejected' || status === 'cancelled' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={!!loading}
            className="border-destructive/30 text-destructive hover:bg-destructive/5 h-8 text-xs"
          >
            {loading === 'delete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            <span className="ml-1.5">Supprimer</span>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={!!loading}
              className="border-green-500/30 text-green-600 hover:bg-green-500/5 h-8 text-xs"
            >
              {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              <span className="ml-1.5">{showApproveForm ? 'Valider' : 'Confirmer'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={loading === 'approve'}
              className="border-destructive/30 text-destructive hover:bg-destructive/5 h-8 text-xs"
            >
              {loading === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              <span className="ml-1.5">{showRejectNote ? 'Confirmer le refus' : 'Refuser'}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
