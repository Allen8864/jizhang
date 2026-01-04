'use client'

import { useMemo } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { calculateBalances, formatBalance } from '@/lib/settlement'
import type { Player, Transaction } from '@/types'

interface PlayerListProps {
  players: Player[]
  transactions: Transaction[]
  currentPlayerId: string | null
  onAddFriend?: () => void
  onEditProfile?: () => void
}

export function PlayerList({ players, transactions, currentPlayerId, onAddFriend, onEditProfile }: PlayerListProps) {
  const balances = useMemo(() => {
    return calculateBalances(players, transactions)
  }, [players, transactions])

  // Sort: current player first, then by balance (highest wins first)
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // Current player always first
      if (a.id === currentPlayerId) return -1
      if (b.id === currentPlayerId) return 1

      // Then sort by balance (highest first)
      const balanceA = balances.find(bal => bal.playerId === a.id)?.balance || 0
      const balanceB = balances.find(bal => bal.playerId === b.id)?.balance || 0
      return balanceB - balanceA
    })
  }, [players, balances, currentPlayerId])

  return (
    <div className="overflow-x-auto -mx-4">
      <div className="flex gap-4 px-4 py-2 min-w-min">
          {sortedPlayers.map(player => {
            const balance = balances.find(b => b.playerId === player.id)?.balance || 0
            const isCurrentPlayer = player.id === currentPlayerId

            return (
              <button
                key={player.id}
                onClick={isCurrentPlayer ? onEditProfile : undefined}
                disabled={!isCurrentPlayer}
                className={`flex flex-col items-center flex-shrink-0 min-w-[72px] ${
                  isCurrentPlayer ? 'relative cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className={`relative ${isCurrentPlayer ? 'ring-2 ring-emerald-500 ring-offset-2 rounded-full' : ''}`}>
                  <Avatar
                    name={player.name}
                    color={player.avatar_color}
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
