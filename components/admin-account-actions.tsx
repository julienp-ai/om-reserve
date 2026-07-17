'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AccountStatus } from '@/lib/types'
import { approveAccount, rejectAccount } from '@/lib/actions'
import { AdminChangePasswordModal } from '@/components/admin-change-password-modal'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface AdminAccountActionsProps {
  profileId: string
  profileName: string
  currentStatus: AccountStatus
}

export function AdminAccountActions({ profileId, profileName, currentStatus }: AdminAccountActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handleApprove() {
    setLoading('approve')
    await approveAccount(profileId, profileName)
    setLoading(null)
    router.refresh()
  }

  async function handleReject() {
    setLoading('reject')
    await rejectAccount(profileId, profileName)
    setLoading(null)
    router.refresh()
  }

  if (currentStatus === 'active') {
    return (
      <div className="flex items-center gap-2">
        <AdminChangePasswordModal profileId={profileId} profileName={profileName} />
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={loading === 'reject'}
          className="border-destructive/30 text-destructive hover:bg-destructive/5 h-8 text-xs"
        >
          {loading === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
          <span className="ml-1.5">Révoquer</span>
        </Button>
      </div>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleApprove}
        disabled={loading === 'approve'}
        className="border-green-500/30 text-green-600 hover:bg-green-500/5 dark:text-green-400 h-8 text-xs"
      >
        {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        <span className="ml-1.5">Activer</span>
      </Button>
    )
  }

  // pending
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleApprove}
        disabled={!!loading}
        className="border-green-500/30 text-green-600 hover:bg-green-500/5 dark:text-green-400 h-8 text-xs"
      >
        {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        <span className="ml-1.5">Valider</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        disabled={!!loading}
        className="border-destructive/30 text-destructive hover:bg-destructive/5 h-8 text-xs"
      >
        {loading === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
        <span className="ml-1.5">Refuser</span>
      </Button>
    </div>
  )
}
