// Database entity types

export interface Room {
  id: string
  code: string
  name: string
  created_by_user_id: string
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  room_id: string
  user_id: string
  name: string
  avatar_color: string
  is_active: boolean
  created_at: string
}

export interface Round {
  id: string
  room_id: string
  index: number
  started_at: string
  ended_at: string | null
}

export interface Transaction {
  id: string
  room_id: string
  from_player_id: string
  to_player_id: string
  amount: number // in cents
  note: string | null
  round_id: string | null
  created_at: string
  created_by_user_id: string
}

// Computed types

export interface PlayerBalance {
  playerId: string
  playerName: string
  balance: number // positive = winning, negative = losing
}

export interface SettlementTransfer {
  from: { id: string; name: string }
  to: { id: string; name: string }
  amount: number // in cents
}

export interface RoomHistory {
  id: string
  code: string
  name: string
  playerName?: string
  lastVisited: string
}

// Avatar colors for players
export const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

export function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}
