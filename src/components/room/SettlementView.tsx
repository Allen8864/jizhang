'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { calculateBalances, calculateSettlement, formatAmount } from '@/lib/settlement'
import { useSupabase } from '@/hooks/useSupabase'
import type { Profile, Transaction, Room, PlayerResult } from '@/types'

interface SettlementViewProps {
  isOpen: boolean
  onClose: () => void
  players: Profile[]
  transactions: Transaction[]
  room: Room | null
}

export function SettlementView({
  isOpen,
  onClose,
  players,
  transactions,
  room,
}: SettlementViewProps) {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const [settling, setSettling] = useState(false)
  const [error, setError] = useState('')

  const balances = useMemo(() => {
    return calculateBalances(players, transactions)
  }, [players, transactions])

  const settlements = useMemo(() => {
    return calculateSettlement(balances)
  }, [balances])

  // Sort balances by amount (winners first)
  const sortedBalances = useMemo(() => {
    return [...balances].sort((a, b) => b.balance - a.balance)
  }, [balances])

  const playerMap = useMemo(() => {
    return new Map(players.map(p => [p.user_id, p]))
  }, [players])

  // Handle final settlement - save history and delete room
  const handleSettle = async () => {
    if (!room || !user) return

    setSettling(true)
    setError('')

    try {
      // Create player results snapshot
      const playerResults: PlayerResult[] = players.map(p => {
        const balance = balances.find(b => b.userId === p.user_id)?.balance || 0
        return {
          user_id: p.user_id,
          name: p.name,
          emoji: p.avatar_emoji,
          balance,
        }
      })

      // Create history record for current user
      const { error: historyError } = await supabase
        .from('settlement_history')
        .insert({
          user_id: user.id,
          room_id: room.id,
          room_code: room.code,
          player_results: playerResults,
        })

      if (historyError) {
        throw historyError
      }

      // Clear current_room_id for all players in this room
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_room_id: null })
        .eq('current_room_id', room.id)

      if (updateError) {
        console.error('Failed to clear players from room:', updateError)
      }

      // Delete the room (releases the room code)
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', room.id)

      if (deleteError) {
        console.error('Failed to delete room:', deleteError)
      }

      // Navigate to home
      router.push('/')
    } catch (err) {
      console.error('Settlement error:', err)
      setError(err instanceof Error ? err.message : '结算失败')
    } finally {
      setSettling(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="结算">
      <div className="space-y-6">
        {/* Balance summary */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">当前战绩</h3>
          <div className="space-y-2">
            {sortedBalances.map(bal => {
              const player = playerMap.get(bal.userId)
              return (
                <div
                  key={bal.userId}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span>{player?.avatar_emoji}</span>
                    <span className="font-medium text-gray-900">{bal.userName}</span>
                  </div>
                  <span className={`font-mono font-semibold ${
                    bal.balance > 0
                      ? 'text-green-600'
                      : bal.balance < 0
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {bal.balance > 0 ? '+' : ''}{formatAmount(bal.balance)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Settlement transfers */}
        {settlements.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              结算方案 <span className="font-normal">({settlements.length}笔转账)</span>
            </h3>
            <div className="space-y-2">
              {settlements.map((transfer, index) => {
                const fromPlayer = playerMap.get(transfer.from.id)
                const toPlayer = playerMap.get(transfer.to.id)

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">
                        {fromPlayer?.avatar_emoji} {transfer.from.name}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="font-medium text-gray-900">
                        {toPlayer?.avatar_emoji} {transfer.to.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-lg text-gray-900">
                      {formatAmount(transfer.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {transactions.length === 0 ? (
              <p>暂无记录</p>
            ) : (
              <p>已经结清了！</p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          以上为最少转账次数的结算方案
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Settle button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSettle}
          loading={settling}
        >
          确认结算并关闭房间
        </Button>

        <p className="text-xs text-gray-400 text-center">
          结算后房间将关闭，记录会保存到历史
        </p>
      </div>
    </Modal>
  )
}
