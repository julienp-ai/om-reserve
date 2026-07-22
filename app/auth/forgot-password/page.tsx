'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'

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

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center py-6 space-y-6">
          {/* Icone */}
          <div className="w-20 h-20 rounded-full bg-[#FF4F00]/10 flex items-center justify-center">
            <MailCheck className="w-10 h-10 text-[#FF4F00]" />
          </div>

          {/* Texte */}
          <div className="space-y-3">
            <h1 className="text-[#0D3B5E] text-2xl font-bold tracking-tight">Email envoyé !</h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Un lien de réinitialisation a été envoyé à{' '}
              <span className="font-semibold text-[#0D3B5E]">{email}</span>.
            </p>
            <p className="text-sm text-gray-400">
              Pensez à vérifier vos spams si vous ne le recevez pas sous quelques minutes.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-[#0D3B5E] hover:text-[#FF4F00] font-semibold transition-colors mt-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      {/* Retour */}
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0D3B5E] transition-colors mb-7"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>

      {/* Titre */}
      <div className="mb-8">
        <div className="w-10 h-[3px] bg-[#FF4F00] rounded-full mb-5" />
        <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight leading-tight">
          Mot de passe oublié
        </h1>
        <p className="text-gray-500 mt-2 text-base leading-relaxed">
          Saisissez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-[#0D3B5E]">
            Adresse email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="prenom.nom@concept-erp.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl px-4 transition-colors"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full h-13 bg-[#FF4F00] hover:bg-[#e64400] text-white font-bold rounded-xl text-base tracking-wide transition-all shadow-sm mt-2"
          disabled={loading}
        >
          {loading
            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Envoi en cours...</>
            : 'Envoyer le lien'
          }
        </Button>
      </form>
    </AuthShell>
  )
}
