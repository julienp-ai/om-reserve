export type Role = 'collaborator' | 'admin'
export type AccountStatus = 'pending' | 'active' | 'rejected'
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type MatchStatus = 'upcoming' | 'full' | 'past' | 'cancelled'
export type NotificationType =
  | 'account_approved'
  | 'account_rejected'
  | 'reservation_approved'
  | 'reservation_rejected'
  | 'new_request'
  | 'new_account'

export interface Profile {
  id: string
  full_name: string
  email: string
  department: string
  role: Role
  status: AccountStatus
  avatar_url: string | null
  created_at: string
}

export interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
  competition: string
  venue: string
  total_seats: number
  seats_reserved: number
  status: MatchStatus
  external_id: string | null
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  user_id: string
  match_id: string
  seats_requested: number
  status: ReservationStatus
  admin_note: string | null
  created_at: string
  updated_at: string
  // Joined
  match?: Match
  profile?: Profile
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  body: string
  reservation_related: boolean
  read: boolean
  created_at: string
  sender?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  receiver?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  related_id: string | null
  created_at: string
}
