'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft } from 'lucide-react'

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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      window.location.origin

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

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Image src="/concept-erp-logo.png" alt="Concept ERP" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-foreground">Concept ERP</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Saisissez votre adresse email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {sent ? (
            <div className="space-y-5">
              <Alert>
                <AlertDescription className="text-sm">
                  Un email de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception et cliquez sur le lien.
                </AlertDescription>
              </Alert>
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@concept-erp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10 bg-white border-border"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-brand-orange text-white hover:bg-brand-orange/90 font-semibold rounded-full"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours...</> : 'Envoyer le lien'}
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
      </div>
    </div>
  )
}
