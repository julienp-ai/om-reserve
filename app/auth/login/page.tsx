'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single()

    if (profile?.status === 'pending') {
      router.push('/auth/pending')
    } else if (profile?.status === 'rejected') {
      await supabase.auth.signOut()
      setError("Votre demande d'accès a été refusée. Contactez un administrateur.")
      setLoading(false)
    } else if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* ── Panneau gauche — visible uniquement desktop ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D3B5E] flex-col justify-between p-16 relative overflow-hidden">
        {/* Decoration cercles */}
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
          {/* Entete */}
          <div className="mb-8">
            <div className="w-8 h-1 bg-[#FF4F00] rounded-full mb-4" />
            <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight">Connexion</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Accédez à votre espace de réservation.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
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

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#0D3B5E]">
                  Mot de passe
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#FF4F00] hover:text-[#FF4F00]/80 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 border-gray-200 bg-gray-50 focus:bg-white text-sm rounded-xl pr-11 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              className="w-full h-12 bg-[#FF4F00] hover:bg-[#FF4F00]/90 text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion en cours...</>
                : 'Se connecter'
              }
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-[#0D3B5E] hover:text-[#FF4F00] font-semibold transition-colors">
              Faire une demande
            </Link>
          </p>
        </div>

        {/* Footer mobile */}
        <p className="lg:hidden text-center text-xs text-gray-400 mt-10">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>
    </div>
  )
}
