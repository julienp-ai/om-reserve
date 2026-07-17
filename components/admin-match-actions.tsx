'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Match } from '@/lib/types'
import { updateMatchSeats, deleteMatch } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Pencil, Trash2, Check, X } from 'lucide-react'

export function AdminMatchActions({ match }: { match: Match }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [seats, setSeats] = useState(String(match.total_seats))
  const [loading, setLoading] = useState<'save' | 'delete' | null>(null)

  async function handleSave() {
    const n = parseInt(seats, 10)
    if (isNaN(n) || n < 1) return
    setLoading('save')
    await updateMatchSeats(match.id, n)
    setLoading(null)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Supprimer le match OM vs ${match.away_team} ? Cette action est irréversible.`)) return
    setLoading('delete')
    await deleteMatch(match.id)
    setLoading(null)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Input
          type="number"
          min={1}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="h-8 w-20 text-xs"
          placeholder="Places"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-green-500/30 text-green-600 hover:bg-green-500/5"
          onClick={handleSave}
          disabled={!!loading}
        >
          {loading === 'save' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          <span className="sr-only">Enregistrer</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setEditing(false)}
          disabled={!!loading}
        >
          <X className="w-3 h-3" />
          <span className="sr-only">Annuler</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => setEditing(true)}
        title="Modifier le nombre de places"
      >
        <Pencil className="w-3 h-3" />
        <span className="sr-only">Modifier</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/5"
        onClick={handleDelete}
        disabled={loading === 'delete'}
        title="Supprimer ce match"
      >
        {loading === 'delete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        <span className="sr-only">Supprimer</span>
      </Button>
    </div>
  )
}
