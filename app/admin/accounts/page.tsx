import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, AccountStatus } from '@/lib/types'
import { AdminAccountActions } from '@/components/admin-account-actions'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'
import { formatShortDate } from '@/lib/format'

const statusConfig: Record<AccountStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' },
  active: { label: 'Actif', className: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' },
  rejected: { label: 'Refusé', className: 'bg-destructive/10 text-destructive border-destructive/20' },
}

export default async function AdminAccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'collaborator')
    .order('created_at', { ascending: false })

  const pending = (profiles ?? []).filter((p) => p.status === 'pending')
  const others = (profiles ?? []).filter((p) => p.status !== 'pending')

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-om-blue" />
          Gestion des comptes
        </h1>
        <p className="text-muted-foreground mt-1">
          Validez ou refusez les demandes d&apos;accès des collaborateurs.
        </p>
      </div>

      {/* Pending accounts */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-brand-orange" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              En attente de validation ({pending.length})
            </h2>
          </div>
          <div className="rounded-xl border border-brand-orange/30 bg-card overflow-hidden">
            {(pending as Profile[]).map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-5 py-4 gap-4 ${idx !== pending.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Inscrit le {formatShortDate(p.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className={statusConfig[p.status as AccountStatus].className}>
                    {statusConfig[p.status as AccountStatus].label}
                  </Badge>
                  <AdminAccountActions profileId={p.id} profileName={p.full_name} currentStatus={p.status as AccountStatus} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All other accounts */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Tous les comptes ({others.length})
        </h2>
        {others.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {(others as Profile[]).map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-5 py-4 gap-4 ${idx !== others.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Inscrit le {formatShortDate(p.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className={statusConfig[p.status as AccountStatus].className}>
                    {statusConfig[p.status as AccountStatus].label}
                  </Badge>
                  <AdminAccountActions profileId={p.id} profileName={p.full_name} currentStatus={p.status as AccountStatus} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucun compte actif pour le moment.</p>
        )}
      </section>
    </div>
  )
}
