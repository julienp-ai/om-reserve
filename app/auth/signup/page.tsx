'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Image src="/concept-erp-logo.png" alt="Concept ERP" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-foreground">Concept ERP</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Créer un compte</h1>
            <p className="text-sm text-muted-foreground mt-1">Demandez un accès à la plateforme.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">Nom complet</Label>
              <Input id="fullName" placeholder="Jean Dupont" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email professionnel</Label>
              <Input id="email" type="email" placeholder="prenom.nom@concept-erp.com" value={form.email} onChange={(e) => update('email', e.target.value)} required className="h-10" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <Input id="password" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={(e) => update('password', e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required className="h-10" />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-10 bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90 font-medium" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : 'Envoyer la demande'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-7">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-om-blue hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
