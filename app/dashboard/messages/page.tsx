import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { markMessageRead } from '@/lib/actions'
import type { Message } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageSquare, Inbox } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
    `)
    .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const received = (messages ?? []).filter((m: Message) => m.receiver_id === user.id)
  const sent = (messages ?? []).filter((m: Message) => m.sender_id === user.id)

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
  }

  function MessageRow({ m, isSent }: { m: Message; isSent: boolean }) {
    const contact = isSent ? m.receiver : m.sender
    return (
      <div className={`flex items-start gap-4 px-5 py-4 ${!m.read && !isSent ? 'bg-om-blue/5' : ''}`}>
        <Avatar className="h-9 w-9 shrink-0">
          {contact?.avatar_url && <AvatarImage src={contact.avatar_url} alt={contact.full_name} />}
          <AvatarFallback className="bg-om-blue text-white text-xs font-semibold">
            {initials(contact?.full_name ?? '?')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{contact?.full_name}</span>
            {!m.read && !isSent && (
              <span className="w-2 h-2 rounded-full bg-om-blue shrink-0" />
            )}
            {m.reservation_related && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-brand-orange border-brand-orange/30">
                Réservation
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto shrink-0">
              {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5">{m.subject}</p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{m.body}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Vos échanges avec vos collègues.</p>
      </div>

      {/* Received */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Inbox className="w-4 h-4" />
          Reçus ({received.length})
        </h2>
        {received.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {received.map((m: Message) => (
              <MessageRow key={m.id} m={m} isSent={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun message reçu.</p>
          </div>
        )}
      </section>

      {/* Sent */}
      {sent.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Envoyés ({sent.length})
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {sent.map((m: Message) => (
              <MessageRow key={m.id} m={m} isSent />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
