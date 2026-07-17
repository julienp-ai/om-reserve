'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex bg-background">

      {/* ── Panneau gauche desktop uniquement ── */}
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

        {/* Header mobile uniquement */}
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
          {/* Titre — caché sur mobile car visible dans le header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Accédez à votre espace de réservation.</p>
          </div>

          {/* Titre mobile */}
          <div className="lg:hidden mb-7">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace de réservation.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-om-blue transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion...</>
                : 'Se connecter'
              }
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-7">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-om-blue hover:underline font-medium">
              Faire une demande
            </Link>
          </p>
        </div>

        {/* Footer mobile */}
        <p className="lg:hidden text-center text-xs text-muted-foreground py-6">
          &copy; {new Date().getFullYear()} Concept ERP
        </p>
      </div>
    </div>
  )
}
