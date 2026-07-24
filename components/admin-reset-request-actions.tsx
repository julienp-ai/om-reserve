'use client'

import { useState } from 'react'
import { adminChangePassword, resolvePasswordResetRequest } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { KeyRound, Loader2, Eye, EyeOff, Check, X } from 'lucide-react'

interface AdminResetRequestActionsProps {
  requestId: string
  profileId: string
  profileName: string
  currentAdminId: string
}

export function AdminResetRequestActions({
  requestId,
  profileId,
  profileName,
  currentAdminId,
}: AdminResetRequestActionsProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    // 1. Changer le mot de passe
    const res = await adminChangePassword(profileId, password)
    if (res.error) {
      setResult({ error: res.error })
      setLoading(false)
      return
    }

    // 2. Marquer la demande comme traitee
    const res2 = await resolvePasswordResetRequest(requestId, currentAdminId)
    setLoading(false)

    if (res2.error) {
      setResult({ error: res2.error })
      return
    }

    setResult({ success: true })
    setPassword('')
    setTimeout(() => {
      setOpen(false)
      setResult(null)
    }, 1500)
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
        className="h-8 text-xs border-[#FF4F00]/30 text-[#FF4F00] hover:bg-[#FF4F00] hover:text-white transition-colors"
      >
        <KeyRound className="w-3 h-3" />
        <span className="ml-1.5">Réinitialiser</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          <div className="relative z-10 bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0D3B5E]">Réinitialiser le mot de passe</h2>
                <p className="text-xs text-gray-500 mt-0.5">{profileName}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500 bg-[#FF4F00]/5 border border-[#FF4F00]/20 rounded-lg px-3 py-2">
              Definissez un nouveau mot de passe temporaire pour cet utilisateur.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor={`reset-pwd-${requestId}`} className="text-xs font-semibold text-[#0D3B5E]">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id={`reset-pwd-${requestId}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#0D3B5E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4F00]/30 focus:border-[#FF4F00] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs text-red-500">Au moins 8 caractères requis</p>
                )}
              </div>

              {result?.error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{result.error}</p>
              )}
              {result?.success && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Mot de passe mis à jour, demande résolue.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="flex-1 h-10 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || password.length < 8}
                  className="flex-1 h-10 rounded-xl bg-[#FF4F00] hover:bg-[#e64400] text-white font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
