'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
    })

    if (resetError) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {/* Titre mobile */}
          <div className="lg:hidden mb-7">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <MailCheck className="w-7 h-7 text-brand-orange" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-foreground">Email envoyé !</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vérifiez votre boîte de réception à <strong className="text-foreground">{email}</strong> et cliquez sur le lien.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@concept-erp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours...</>
                  : 'Envoyer le lien'
                }
              </Button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>

        <p className="lg:hidden text-center text-xs text-muted-foreground py-6">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>
    </div>
  )
}
