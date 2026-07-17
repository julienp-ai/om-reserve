import type { ReservationStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const config: Record<ReservationStatus, { label: string; className: string }> = {
  pending: {
    label: 'En attente',
    className: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20 hover:bg-brand-orange/10',
  },
  approved: {
    label: 'Confirmée',
    className: 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10 dark:text-green-400',
  },
  rejected: {
    label: 'Refusée',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
  },
  cancelled: {
    label: 'Annulée',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
  },
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
