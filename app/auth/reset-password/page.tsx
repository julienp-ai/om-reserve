'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import Link from 'next/link'

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
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const strength =
    password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 10 ? 2
    : password.length < 12 ? 3
    : 4

  const strengthLabel = ['', 'Trop court', 'Acceptable', 'Bien', 'Excellent']
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']

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

  if (success) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center py-6 space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-[#0D3B5E] text-2xl font-bold tracking-tight">Mot de passe mis à jour !</h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      {/* Titre */}
      <div className="mb-8">
        <div className="w-10 h-[3px] bg-[#FF4F00] rounded-full mb-5" />
        <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight leading-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-gray-500 mt-2 text-base leading-relaxed">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      {!ready && (
        <Alert className="mb-6 rounded-xl border-gray-200 bg-gray-50">
          <AlertDescription className="text-sm text-gray-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validation du lien en cours...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nouveau mot de passe */}
        <div className="space-y-2">
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
              className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl pr-12 px-4 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Indicateur de force */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">{strengthLabel[strength]}</p>
            </div>
          )}
        </div>

        {/* Confirmer */}
        <div className="space-y-2">
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
              className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl pr-12 px-4 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? 'Masquer' : 'Afficher'}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full h-13 bg-[#FF4F00] hover:bg-[#e64400] text-white font-bold rounded-xl text-base tracking-wide transition-all shadow-sm mt-2"
          disabled={loading || !ready}
        >
          {loading
            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Enregistrement...</>
            : 'Enregistrer le mot de passe'
          }
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <Link href="/auth/login" className="text-sm text-gray-400 hover:text-[#0D3B5E] transition-colors">
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  )
}
