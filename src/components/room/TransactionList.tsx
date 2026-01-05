'use client'

import { useMemo } from 'react'
import { formatAmount } from '@/lib/settlement'
import type { Transaction, Profile } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  players: Profile[]
}

export function TransactionList({
  transactions,
  players,
}: TransactionListProps) {
  // Create player lookup map by user_id
  const playerMap = useMemo(() => {
    return new Map(players.map(p => [p.user_id, p]))
  }, [players])

  // Group transactions by round_num
  const groupedTransactions = useMemo(() => {
    const groups: { roundNum: number; transactions: Transaction[] }[] = []

    // Sort transactions by created_at descending
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let currentRoundNum: number | undefined = undefined

    sorted.forEach(tx => {
      if (tx.round_num !== currentRoundNum) {
        currentRoundNum = tx.round_num
        groups.push({ roundNum: tx.round_num, transactions: [] })
      }
      groups[groups.length - 1].transactions.push(tx)
    })

    return groups
  }, [transactions])

  // Format time as HH:MM
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
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
        <p className="text-sm mt-1">点击好友头像开始记账</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedTransactions.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Round header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400 px-2">
              第 {group.roundNum} 轮
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Transactions in this group */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {group.transactions.map(tx => {
              const fromPlayer = playerMap.get(tx.from_user_id)
              const toPlayer = playerMap.get(tx.to_user_id)

              return (
                <div key={tx.id} className="px-4 py-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-10 flex-shrink-0">
                    {formatTime(tx.created_at)}
                  </span>
                  <span className="font-medium text-gray-900 text-sm truncate max-w-[35%]">
                    {fromPlayer?.avatar_emoji} {fromPlayer?.name || '未知'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm truncate max-w-[35%]">
                    {toPlayer?.avatar_emoji} {toPlayer?.name || '未知'}
                  </span>
                  <span className="font-num font-semibold text-gray-900 flex-shrink-0 ml-auto">
                    {formatAmount(tx.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
