'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'

const ALLOWED_DOMAIN = '@concept-erp.com'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.email.endsWith(ALLOWED_DOMAIN)) {
      setError(`Seules les adresses ${ALLOWED_DOMAIN} sont autorisées.`)
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      const msg: string = data.error ?? 'Une erreur est survenue.'
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('already exists')) {
        setError('Cette adresse email est déjà utilisée.')
      } else {
        setError(msg)
      }
      return
    }

    router.push('/auth/pending?new=1')
  }

  return (
    <AuthShell>
      {/* Titre */}
      <div className="mb-8">
        <div className="w-10 h-[3px] bg-[#FF4F00] rounded-full mb-5" />
        <h1 className="text-[#0D3B5E] text-3xl font-bold tracking-tight leading-tight">
          Créer un compte
        </h1>
        <p className="text-gray-500 mt-2 text-base leading-relaxed">
          Demandez un accès à la plateforme de réservation.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-semibold text-[#0D3B5E]">
            Nom complet
          </Label>
          <Input
            id="fullName"
            placeholder="Jean Dupont"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
            autoComplete="name"
            className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl px-4 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-[#0D3B5E]">
            Email professionnel
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="prenom.nom@concept-erp.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            autoComplete="email"
            className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl px-4 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-[#0D3B5E]">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 caractères"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            autoComplete="new-password"
            className="h-13 border-gray-200 bg-gray-50 focus:bg-white text-base rounded-xl px-4 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#0D3B5E]">
            Confirmer le mot de passe
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
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
            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Création...</>
            : 'Envoyer la demande'
          }
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-[#0D3B5E] hover:text-[#FF4F00] font-semibold transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
