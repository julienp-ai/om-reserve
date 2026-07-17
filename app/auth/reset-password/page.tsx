'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError("Une erreur est survenue. Le lien a peut-être expiré, veuillez recommencer.")
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/auth/login?reset=success')
  }

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Panneau gauche desktop ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-sidebar flex-col justify-between p-14">
        <div className="flex items-center gap-3">
          <Image src="/concept-erp-logo.png" alt="Concept ERP" width={38} height={38} className="object-contain" />
          <span className="text-white font-semibold text-base tracking-tight">Concept ERP</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-white text-3xl font-bold leading-snug">
            Plateforme de<br />réservation OM
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Accès réservé aux collaborateurs Concept ERP.
          </p>
        </div>
        <p className="text-white/30 text-xs">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col lg:items-center lg:justify-center">

        {/* Header mobile */}
        <div className="lg:hidden bg-sidebar px-6 pt-12 pb-10 flex flex-col items-center gap-4">
          <Image src="/concept-erp-logo.png" alt="Concept ERP" width={52} height={52} className="object-contain" />
          <div className="text-center">
            <p className="text-white font-bold text-lg tracking-tight">Concept ERP</p>
            <p className="text-white/50 text-sm mt-0.5">Plateforme de réservation OM</p>
          </div>
        </div>

        {/* Carte formulaire */}
        <div className="
          w-full lg:max-w-sm
          bg-card
          lg:rounded-2xl lg:shadow-sm lg:border lg:border-border
          px-6 py-8
          lg:px-8 lg:py-10
          flex-1 lg:flex-none
        ">
          {/* Titre desktop */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Nouveau mot de passe</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

          {/* Titre mobile */}
          <div className="lg:hidden mb-7">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Nouveau mot de passe</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

          {!ready && (
            <Alert className="mb-5">
              <AlertDescription className="text-sm text-muted-foreground">
                Validation du lien en cours...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 lg:h-10 bg-background border-border text-base lg:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirmer le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 lg:h-10 bg-background border-border text-base lg:text-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 lg:h-10 bg-brand-orange text-white hover:bg-brand-orange/90 font-semibold rounded-full text-base lg:text-sm mt-1"
              disabled={loading || !ready}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                : 'Enregistrer le mot de passe'
              }
            </Button>
          </form>
        </div>

        <p className="lg:hidden text-center text-xs text-muted-foreground py-6">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>
    </div>
  )
}
