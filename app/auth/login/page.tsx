'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'

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
    <AuthShell>
      {/* Titre */}
      <div className="mb-8">
        <div className="w-10 h-[3px] bg-[#FF4F00] rounded-full mb-5" />
        <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight leading-tight">
          Connexion
        </h1>
        <p className="text-gray-500 mt-2 text-base leading-relaxed">
          Accédez à votre espace de réservation.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
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
            className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl transition-colors px-4"
          />
        </div>

        {/* Mot de passe */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-[#0D3B5E]">
              Mot de passe
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-[#FF4F00] hover:text-[#FF4F00]/80 transition-colors"
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
            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Connexion...</>
            : 'Se connecter'
          }
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth/signup" className="text-[#0D3B5E] hover:text-[#FF4F00] font-semibold transition-colors">
            Faire une demande
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
