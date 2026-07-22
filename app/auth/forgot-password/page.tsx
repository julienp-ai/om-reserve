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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* ── Panneau gauche desktop ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D3B5E] flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute bottom-32 -left-20 w-64 h-64 rounded-full border border-white/10" />

        <div className="flex items-center gap-3 relative z-10">
          <Image src="/concept-erp-logo.png" alt="Concept ERP" width={36} height={36} className="object-contain" />
          <span className="text-white font-bold text-base tracking-tight">Concept ERP</span>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="w-12 h-1 bg-[#FF4F00] rounded-full" />
          <h2 className="text-white text-4xl font-bold leading-tight">
            Plateforme de<br />réservation OM
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Accès réservé aux collaborateurs Concept ERP.
          </p>
        </div>

        <p className="text-white/30 text-xs relative z-10">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>

      {/* ── Zone formulaire ── */}
      <div className="flex-1 flex flex-col justify-between lg:justify-center px-6 py-10 lg:px-16">

        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <Image src="/concept-erp-logo.png" alt="Concept ERP" width={32} height={32} className="object-contain" />
          <span className="text-[#0D3B5E] font-bold text-base tracking-tight">Concept ERP</span>
        </div>

        <div className="w-full lg:max-w-md lg:mx-auto">

          {sent ? (
            /* ── Confirmation envoi ── */
            <div className="flex flex-col items-center text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#FF4F00]/10 flex items-center justify-center">
                <MailCheck className="w-9 h-9 text-[#FF4F00]" />
              </div>
              <div className="space-y-2">
                <h1 className="text-[#0D3B5E] text-2xl font-bold tracking-tight">Email envoyé !</h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  Vérifiez votre boîte à{' '}
                  <span className="font-semibold text-[#0D3B5E]">{email}</span>{' '}
                  et cliquez sur le lien pour réinitialiser votre mot de passe.
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Pensez à vérifier vos spams si vous ne le recevez pas.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-[#0D3B5E] hover:text-[#FF4F00] font-semibold transition-colors mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <div className="mb-8">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0D3B5E] transition-colors mb-6"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour
                </Link>
                <div className="w-8 h-1 bg-[#FF4F00] rounded-full mb-4" />
                <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Saisissez votre adresse email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
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
                    className="h-12 border-gray-200 bg-gray-50 focus:bg-white text-sm rounded-xl transition-colors"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#FF4F00] hover:bg-[#FF4F00]/90 text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-sm hover:shadow-md"
                  disabled={loading}
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours...</>
                    : 'Envoyer le lien'
                  }
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="lg:hidden text-center text-xs text-gray-400 mt-10">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>
    </div>
  )
}
