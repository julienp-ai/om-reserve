'use client'

import { useState } from 'react'
import { sendMessage } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MessageSquare, Loader2, CheckCircle } from 'lucide-react'

interface SendMessageModalProps {
  senderId: string
  receiverId: string
  receiverName: string
}

export function SendMessageModal({ senderId, receiverId, receiverName }: SendMessageModalProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [reservationRelated, setReservationRelated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function reset() {
    setSubject('')
    setBody('')
    setReservationRelated(false)
    setError(null)
    setSent(false)
  }

  async function handleSend() {
    if (!subject.trim()) { setError('Veuillez indiquer un motif.'); return }
    if (!body.trim()) { setError('Veuillez écrire un message.'); return }
    setError(null)
    setLoading(true)
    const result = await sendMessage({ senderId, receiverId, subject: subject.trim(), body: body.trim(), reservationRelated })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
      setTimeout(() => { setOpen(false); reset() }, 1800)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Envoyer un message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message à {receiverName}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <p className="text-sm font-medium text-foreground">Message envoyé !</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Motif du message <span className="text-destructive">*</span></Label>
              <Input
                id="subject"
                placeholder="Ex : Question sur ma réservation, Demande d'info..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/40">
              <Checkbox
                id="reservation_related"
                checked={reservationRelated}
                onCheckedChange={(v) => setReservationRelated(Boolean(v))}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="reservation_related" className="cursor-pointer font-medium text-sm">
                  Informations supplémentaires pour une réservation
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cochez si votre message concerne une demande de réservation en cours.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body">Message <span className="text-destructive">*</span></Label>
              <Textarea
                id="body"
                placeholder="Écrivez votre message ici..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">{body.length}/1000</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Envoi...</> : 'Envoyer'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
