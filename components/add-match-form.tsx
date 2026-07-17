'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMatch } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, ChevronDown } from 'lucide-react'

const COMPETITIONS = ['Ligue 1', 'Champions League', 'Coupe de France', 'Coupe de la Ligue', 'Trophée des Champions', 'Europa League', 'Amical']

export function AddMatchForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    awayTeam: '',
    matchDate: '',
    competition: 'Ligue 1',
    venue: 'Orange Vélodrome, Marseille',
    totalSeats: '10',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await createMatch({
      awayTeam: form.awayTeam,
      matchDate: new Date(form.matchDate as string).toISOString(),
      competition: form.competition,
      venue: form.venue,
      totalSeats: parseInt(form.totalSeats, 10),
    })

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setForm({ awayTeam: '', matchDate: '', competition: 'Ligue 1', venue: 'Orange Vélodrome, Marseille', totalSeats: '10' })
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 1500)
      router.refresh()
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-orange" />
          Ajouter un match manuellement
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-border px-5 py-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="awayTeam">Équipe adverse</Label>
              <Input
                id="awayTeam"
                placeholder="Ex: Paris Saint-Germain"
                value={form.awayTeam}
                onChange={(e) => update('awayTeam', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="matchDate">Date et heure du match</Label>
              <Input
                id="matchDate"
                type="datetime-local"
                value={form.matchDate}
                onChange={(e) => update('matchDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="competition">Compétition</Label>
              <Select value={form.competition} onValueChange={(v) => update('competition', v as string)}>
                <SelectTrigger id="competition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPETITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="totalSeats">Nombre de places disponibles</Label>
              <Input
                id="totalSeats"
                type="number"
                min={1}
                max={100}
                value={form.totalSeats}
                onChange={(e) => update('totalSeats', e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="venue">Stade</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => update('venue', e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="sm:col-span-2">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {success && (
              <div className="sm:col-span-2">
                <Alert className="border-green-500/30 bg-green-500/5">
                  <AlertDescription className="text-green-700 dark:text-green-400">Match ajouté avec succès !</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading} className="bg-om-blue text-om-blue-foreground hover:bg-om-blue/90">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ajout...</> : 'Ajouter le match'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
