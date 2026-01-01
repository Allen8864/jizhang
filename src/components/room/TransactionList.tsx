'use client'

import { useMemo } from 'react'
import { formatAmount } from '@/lib/settlement'
import type { Transaction, Player, Round } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  players: Player[]
  rounds: Round[]
  currentUserId: string | null
  onDelete: (id: string) => Promise<void>
}

export function TransactionList({
  transactions,
  players,
  rounds,
  currentUserId,
  onDelete,
}: TransactionListProps) {
  // Create player lookup map
  const playerMap = useMemo(() => {
    return new Map(players.map(p => [p.id, p]))
  }, [players])

  // Group transactions by round
  const groupedTransactions = useMemo(() => {
    const groups: { round: Round | null; transactions: Transaction[] }[] = []

    // Sort transactions by created_at descending
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let currentRoundId: string | null | undefined = undefined

    sorted.forEach(tx => {
      if (tx.round_id !== currentRoundId) {
        currentRoundId = tx.round_id
        const round = tx.round_id ? rounds.find(r => r.id === tx.round_id) || null : null
        groups.push({ round, transactions: [] })
      }
      groups[groups.length - 1].transactions.push(tx)
    })

    return groups
  }, [transactions, rounds])

  // Check if transaction can be deleted (within 5 minutes and created by current user)
  const canDelete = (tx: Transaction) => {
    if (tx.created_by_user_id !== currentUserId) return false
    const createdAt = new Date(tx.created_at)
    const now = new Date()
    const diffMs = now.getTime() - createdAt.getTime()
    return diffMs < 5 * 60 * 1000 // 5 minutes
  }

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)

    if (diffSecs < 60) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`

    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>暂无记录</p>
        <p className="text-sm mt-1">点击下方按钮开始记账</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedTransactions.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Round header */}
          {group.round && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 px-2">
                第 {group.round.index} 轮
              </span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
          )}

          {/* Transactions in this group */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {group.transactions.map(tx => {
              const fromPlayer = playerMap.get(tx.from_player_id)
              const toPlayer = playerMap.get(tx.to_player_id)
              const deletable = canDelete(tx)

              return (
                <div key={tx.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="font-medium"
                        style={{ color: fromPlayer?.avatar_color || '#6366f1' }}
                      >
                        {fromPlayer?.name || '未知'}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span
                        className="font-medium"
                        style={{ color: toPlayer?.avatar_color || '#22c55e' }}
                      >
                        {toPlayer?.name || '未知'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-gray-900">
                        {formatAmount(tx.amount)}
                      </span>

                      {deletable && (
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="撤销"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    {tx.note ? (
                      <span className="text-xs text-gray-500">{tx.note}</span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-gray-400">{formatTime(tx.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
