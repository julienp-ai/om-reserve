'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// ============================================================
// RESERVATION ACTIONS
// ============================================================

export async function createReservation({
  matchId,
  userId,
  seatsRequested,
  autoApprove = false,
}: {
  matchId: string
  userId: string
  seatsRequested: number
  autoApprove?: boolean
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Verify match availability
  const { data: match } = await supabase
    .from('matches')
    .select('total_seats, seats_reserved, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match introuvable.' }
  if (match.status === 'full' || match.status === 'past' || match.status === 'cancelled') {
    return { error: 'Ce match n\'est plus disponible pour les réservations.' }
  }

  const available = match.total_seats - match.seats_reserved
  if (seatsRequested > available) {
    return { error: `Seulement ${available} place(s) disponible(s) pour ce match.` }
  }

  const status = autoApprove ? 'approved' : 'pending'

  const { error } = await supabase.from('reservations').insert({
    user_id: userId,
    match_id: matchId,
    seats_requested: seatsRequested,
    status,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Vous avez déjà une réservation pour ce match.' }
    }
    return { error: 'Erreur lors de la création de la réservation.' }
  }

  revalidatePath('/admin/matches')

  // Notify all admins only for pending reservations
  if (autoApprove) {
    revalidatePath('/dashboard/matches')
    revalidatePath('/dashboard/reservations')
    revalidatePath('/admin/reservations')
    return {}
  }

  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const { data: matchData } = await supabase
      .from('matches')
      .select('away_team')
      .eq('id', matchId)
      .single()

    await supabase.from('notifications').insert(
      admins.map((admin) => ({
        user_id: admin.id,
        title: 'Nouvelle demande de réservation',
        message: `${profile?.full_name ?? 'Un collaborateur'} demande ${seatsRequested} place(s) pour OM vs ${matchData?.away_team ?? 'ce match'}.`,
        type: 'new_request',
        related_id: matchId,
      })),
    )
  }

  revalidatePath('/dashboard/matches')
  revalidatePath('/dashboard/reservations')
  revalidatePath('/admin/reservations')
  return {}
}

export async function cancelReservation(reservationId: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (error) return { error: 'Impossible d\'annuler la réservation.' }

  revalidatePath('/dashboard/reservations')
  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return {}
}

// ============================================================
// ADMIN — RESERVATION ACTIONS
// ============================================================

export async function approveReservation({
  reservationId,
  userId,
  matchName,
  seatsRequested,
  clientName,
}: {
  reservationId: string
  userId: string
  matchName: string
  seatsRequested: number
  clientName?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
      client_name: clientName?.trim() || null,
    })
    .eq('id', reservationId)

  if (error) return { error: 'Erreur lors de l\'approbation.' }

  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Réservation confirmée !',
    message: `Votre demande de ${seatsRequested} place(s) pour ${matchName} a été confirmée.`,
    type: 'reservation_approved',
    related_id: reservationId,
  })

  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return {}
}

export async function deleteReservation(reservationId: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId)

  if (error) return { error: 'Erreur lors de la suppression.' }

  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return {}
}

export async function rejectReservation({
  reservationId,
  userId,
  matchName,
  note,
}: {
  reservationId: string
  userId: string
  matchName: string
  note?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'rejected',
      admin_note: note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)

  if (error) return { error: 'Erreur lors du refus.' }

  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Demande de réservation refusée',
    message: `Votre demande pour ${matchName} n'a pas pu être accordée.${note ? ` Motif : ${note}` : ''}`,
    type: 'reservation_rejected',
    related_id: reservationId,
  })

  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return {}
}

// ============================================================
// ADMIN — ACCOUNT ACTIONS
// ============================================================

export async function approveAccount(profileId: string, profileName: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  // 1. Activer le profil
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', profileId)

  if (error) return { error: "Erreur lors de l'activation du compte." }

  // 2. Confirmer l'email via le Supabase Admin client (service role)
  //    sans ça l'utilisateur ne peut pas se connecter si l'email n'est pas confirmé
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  await adminClient.auth.admin.updateUserById(profileId, { email_confirm: true })

  // 3. Notifier l'utilisateur
  await supabase.from('notifications').insert({
    user_id: profileId,
    title: 'Compte activé !',
    message: "Votre compte a été validé. Vous pouvez maintenant réserver vos places pour les matchs de l'OM.",
    type: 'account_approved',
  })

  revalidatePath('/admin/accounts')
  revalidatePath('/admin')
  return {}
}

export async function adminChangePassword(profileId: string, newPassword: string): Promise<{ error?: string }> {
  if (newPassword.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' }

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await adminClient.auth.admin.updateUserById(profileId, {
    password: newPassword,
  })

  if (error) return { error: 'Erreur lors du changement de mot de passe.' }
  return {}
}

export async function rejectAccount(profileId: string, profileName: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', profileId)

  if (error) return { error: 'Erreur lors du refus du compte.' }

  await supabase.from('notifications').insert({
    user_id: profileId,
    title: 'Demande d\'accès refusée',
    message: 'Votre demande d\'accès à la plateforme n\'a pas été accordée. Contactez un administrateur pour plus d\'informations.',
    type: 'account_rejected',
  })

  revalidatePath('/admin/accounts')
  revalidatePath('/admin')
  return {}
}

// ============================================================
// MESSAGING ACTIONS
// ============================================================

export async function sendMessage({
  senderId,
  receiverId,
  subject,
  body,
  reservationRelated,
}: {
  senderId: string
  receiverId: string
  subject: string
  body: string
  reservationRelated: boolean
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('messages').insert({
    sender_id: senderId,
    receiver_id: receiverId,
    subject,
    body,
    reservation_related: reservationRelated,
  })

  if (error) return { error: 'Erreur lors de l\'envoi du message.' }

  // Notify receiver
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', senderId)
    .single()

  await supabase.from('notifications').insert({
    user_id: receiverId,
    title: `Nouveau message de ${sender?.full_name ?? 'un collaborateur'}`,
    message: subject,
    type: 'new_request',
  })

  revalidatePath('/dashboard/messages')
  revalidatePath('/admin/messages')
  return {}
}

export async function markMessageRead(messageId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('messages').update({ read: true }).eq('id', messageId)
  revalidatePath('/dashboard/messages')
  revalidatePath('/admin/messages')
}

// ============================================================
// ADMIN — MATCH ACTIONS
// ============================================================

export async function createMatch(data: {
  awayTeam: string
  matchDate: string
  competition: string
  venue: string
  totalSeats: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('matches').insert({
    away_team: data.awayTeam,
    match_date: data.matchDate,
    competition: data.competition,
    venue: data.venue,
    total_seats: data.totalSeats,
    status: 'upcoming',
  })

  if (error) return { error: 'Erreur lors de la création du match.' }

  revalidatePath('/admin/matches')
  revalidatePath('/dashboard/matches')
  return {}
}

export async function updateMatchSeats(matchId: string, totalSeats: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('matches')
    .update({ total_seats: totalSeats, updated_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }

  revalidatePath('/admin/matches')
  revalidatePath('/dashboard/matches')
  return {}
}

export async function deleteMatch(matchId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('matches').delete().eq('id', matchId)

  if (error) return { error: 'Erreur lors de la suppression du match.' }

  revalidatePath('/admin/matches')
  revalidatePath('/dashboard/matches')
  return {}
}
