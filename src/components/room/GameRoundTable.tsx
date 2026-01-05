'use client'

import { useMemo } from 'react'
import type { Profile, Transaction } from '@/types'
import { formatBalance } from '@/lib/settlement'

interface GameRoundTableProps {
  players: Profile[]
  transactions: Transaction[]
  currentRoundNum: number
  currentUserId: string | null
}

interface RoundPlayerAmount {
  [odlUserId: string]: number // Net amount for this user in this round
}

export function GameRoundTable({
  players,
  transactions,
  currentRoundNum,
  currentUserId,
}: GameRoundTableProps) {
  // Calculate net amount for each player in each round
  const roundData = useMemo(() => {
    // Get all unique round numbers from transactions
    const roundNums = new Set(transactions.map(t => t.round_num))

    // If no transactions, show current round (starting from 1)
    if (roundNums.size === 0) {
      const emptyRound: RoundPlayerAmount = {}
      players.forEach(p => {
        emptyRound[p.user_id] = 0
      })
      return [{
        roundNum: currentRoundNum,
        amounts: emptyRound,
      }]
    }

    // Sort round numbers
    const sortedRoundNums = Array.from(roundNums).sort((a, b) => a - b)

    return sortedRoundNums.map(roundNum => {
      const amounts: RoundPlayerAmount = {}

      // Initialize all players with 0
      players.forEach(p => {
        amounts[p.user_id] = 0
      })

      // Calculate net for each player in this round
      // Positive = winning (received money), Negative = losing (paid money)
      transactions
        .filter(t => t.round_num === roundNum)
        .forEach(t => {
          amounts[t.from_user_id] = (amounts[t.from_user_id] || 0) - t.amount
          amounts[t.to_user_id] = (amounts[t.to_user_id] || 0) + t.amount
        })

      return {
        roundNum,
        amounts,
      }
    })
  }, [transactions, players, currentRoundNum])

  if (players.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        暂无玩家
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-6" />
            {players.map(player => (
              <col key={player.user_id} />
            ))}
          </colgroup>
          {/* Header row with player avatars and names */}
          <thead>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-gray-50 px-1 py-2 text-[10px] text-gray-400 font-normal" style={{ writingMode: 'vertical-rl' }}>
                轮次
              </th>
              {players.map(player => (
                <th
                  key={player.user_id}
                  className={`px-1 py-2 text-center ${
                    player.user_id === currentUserId ? 'bg-emerald-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5 overflow-hidden">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: '#f3f4f6' }}
                    >
                      {player.avatar_emoji}
                    </div>
                    <span className="text-[10px] text-gray-600 truncate w-full text-center">
                      {player.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Round rows */}
            {roundData.map((round) => (
              <tr
                key={`round-${round.roundNum}`}
                className="border-b border-gray-50"
              >
                <td className="sticky left-0 z-10 bg-white px-2 py-2 text-xs text-gray-400 text-center">
                  {round.roundNum}
                </td>
                {players.map(player => {
                  const amount = round.amounts[player.user_id] || 0
                  return (
                    <td
                      key={player.user_id}
                      className={`px-2 py-2 text-center text-sm font-medium ${
                        player.user_id === currentUserId ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <span
                        className={
                          amount > 0
                            ? 'text-emerald-600'
                            : amount < 0
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }
                      >
                        {amount === 0 ? '0' : formatBalance(amount)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
