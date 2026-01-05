'use client'

import { useMemo } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { calculateBalances, formatBalance } from '@/lib/settlement'
import type { Profile, Transaction } from '@/types'

interface PlayerListProps {
  players: Profile[]
  transactions: Transaction[]
  currentUserId: string | null
  onAddFriend?: () => void
  onEditProfile?: () => void
  onPlayerClick?: (player: Profile) => void
}

export function PlayerList({ players, transactions, currentUserId, onAddFriend, onEditProfile, onPlayerClick }: PlayerListProps) {
  const balances = useMemo(() => {
    return calculateBalances(players, transactions)
  }, [players, transactions])

  // Sort by join time (joined_room_at)
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const timeA = a.joined_room_at ? new Date(a.joined_room_at).getTime() : 0
      const timeB = b.joined_room_at ? new Date(b.joined_room_at).getTime() : 0
      return timeA - timeB
    })
  }, [players])

  return (
    <div className="overflow-x-auto -mx-4">
      <div className="flex gap-4 px-4 py-2 min-w-min">
          {sortedPlayers.map(player => {
            const balance = balances.find(b => b.userId === player.user_id)?.balance || 0
            const isCurrentPlayer = player.user_id === currentUserId

            return (
              <button
                key={player.user_id}
                onClick={isCurrentPlayer ? onEditProfile : () => onPlayerClick?.(player)}
                className={`flex flex-col items-center flex-shrink-0 min-w-[72px] ${
                  isCurrentPlayer ? 'relative' : ''
                } cursor-pointer`}
              >
                <div className={`relative ${isCurrentPlayer ? 'ring-2 ring-emerald-500 ring-offset-2 rounded-full' : ''}`}>
                  <Avatar
                    emoji={player.avatar_emoji}
                    size="lg"
                  />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[72px]">
                    {player.name}
                  </div>
                  <div className={`text-sm font-mono font-semibold mt-0.5 ${
                    balance > 0
                      ? 'text-green-600'
                      : balance < 0
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {formatBalance(balance)}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Add friend button */}
          <button
            onClick={onAddFriend}
            className="flex flex-col items-center flex-shrink-0 min-w-[72px] group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-colors">
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium text-gray-500 group-hover:text-emerald-600 transition-colors">
                添加好友
              </div>
            </div>
          </button>
        </div>
      </div>
  )
}
