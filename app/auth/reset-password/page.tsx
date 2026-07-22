'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)

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

    setSuccess(true)
    setLoading(false)
    await supabase.auth.signOut()
    setTimeout(() => router.push('/auth/login'), 2500)
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

          {success ? (
            /* ── Confirmation succes ── */
            <div className="flex flex-col items-center text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <ShieldCheck className="w-9 h-9 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-[#0D3B5E] text-2xl font-bold tracking-tight">Mot de passe mis à jour !</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Vous allez être redirigé vers la page de connexion...
                </p>
              </div>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <div className="mb-8">
                <div className="w-8 h-1 bg-[#FF4F00] rounded-full mb-4" />
                <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight">Nouveau mot de passe</h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </p>
              </div>

              {!ready && (
                <Alert className="mb-5 rounded-xl border-gray-200 bg-gray-50">
                  <AlertDescription className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Validation du lien en cours...
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#0D3B5E]">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-12 border-gray-200 bg-gray-50 focus:bg-white text-sm rounded-xl pr-11 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-sm font-semibold text-[#0D3B5E]">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-12 border-gray-200 bg-gray-50 focus:bg-white text-sm rounded-xl pr-11 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Indicateur force mot de passe */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => {
                        const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < strength
                                ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-yellow-400' : strength <= 3 ? 'bg-blue-400' : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-400">
                      {password.length < 8 ? 'Trop court' : password.length < 10 ? 'Acceptable' : password.length < 12 ? 'Bien' : 'Excellent'}
                    </p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#FF4F00] hover:bg-[#FF4F00]/90 text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-sm hover:shadow-md"
                  disabled={loading || !ready}
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                    : 'Enregistrer le mot de passe'
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
