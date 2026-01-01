'use client'

import { useMemo } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { calculateBalances, formatBalance } from '@/lib/settlement'
import type { Player, Transaction } from '@/types'

interface PlayerListProps {
  players: Player[]
  transactions: Transaction[]
  currentPlayerId: string | null
}

export function PlayerList({ players, transactions, currentPlayerId }: PlayerListProps) {
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-medium text-gray-900">
          玩家 <span className="text-gray-400 font-normal">({players.length}人)</span>
        </h2>
      </div>

      <div className="divide-y divide-gray-50">
        {sortedPlayers.map(player => {
          const balance = balances.find(b => b.playerId === player.id)?.balance || 0
          const isCurrentPlayer = player.id === currentPlayerId

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between px-4 py-3 ${
                isCurrentPlayer ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  name={player.name}
                  color={player.avatar_color}
                  size="md"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {player.name}
                    {isCurrentPlayer && (
                      <span className="ml-1.5 text-xs text-emerald-600 font-normal">(你)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={`font-mono text-lg font-semibold ${
                balance > 0
                  ? 'text-green-600'
                  : balance < 0
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`}>
                {formatBalance(balance)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
