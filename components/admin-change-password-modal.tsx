'use client'

import { useState } from 'react'
import { adminChangePassword } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { KeyRound, Loader2, Eye, EyeOff, Check, X } from 'lucide-react'

interface AdminChangePasswordModalProps {
  profileId: string
  profileName: string
}

export function AdminChangePasswordModal({ profileId, profileName }: AdminChangePasswordModalProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await adminChangePassword(profileId, password)
    setLoading(false)
    if (res.error) {
      setResult({ error: res.error })
    } else {
      setResult({ success: true })
      setPassword('')
      setTimeout(() => {
        setOpen(false)
        setResult(null)
      }, 1500)
    }
  }

  function handleClose() {
    setOpen(false)
    setPassword('')
    setResult(null)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 text-xs border-border text-muted-foreground hover:text-foreground"
      >
        <KeyRound className="w-3 h-3" />
        <span className="ml-1.5">Mot de passe</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative z-10 bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Changer le mot de passe</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{profileName}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-new-password" className="text-xs font-medium text-muted-foreground">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="admin-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs text-destructive">Au moins 8 caractères requis</p>
                )}
              </div>

              {result?.error && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{result.error}</p>
              )}
              {result?.success && (
                <p className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 rounded-md px-3 py-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Mot de passe mis à jour
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="flex-1 h-9"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || password.length < 8}
                  className="flex-1 h-9 bg-om-blue text-om-blue-foreground hover:bg-om-blue/90"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
