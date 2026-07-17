import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "EEE d MMM yyyy 'à' HH'h'mm", { locale: fr })
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'd MMM yyyy', { locale: fr })
}
