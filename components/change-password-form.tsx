'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Re-authenticate with current password to verify identity
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('Impossible de récupérer votre compte.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) {
      setError('Mot de passe actuel incorrect.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Current password */}
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Mot de passe actuel</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Votre mot de passe actuel"
          required
          autoComplete="current-password"
        />
      </div>

      {/* New password */}
      <div className="space-y-1.5">
        <Label htmlFor="new-password">Nouveau mot de passe</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
            required
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répéter le nouveau mot de passe"
            required
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Password strength hint */}
      {newPassword.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-destructive'}`} />
          <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-destructive'}>
            {newPassword.length >= 8 ? 'Assez long' : `${8 - newPassword.length} caractères manquants`}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Mot de passe modifié avec succès.
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-om-blue text-om-blue-foreground hover:bg-om-blue/90"
      >
        <KeyRound className="w-4 h-4 mr-2" />
        {loading ? 'Modification...' : 'Changer le mot de passe'}
      </Button>
    </form>
  )
}
