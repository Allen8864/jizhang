'use client'

import { useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { calculateBalances, calculateSettlement, formatAmount } from '@/lib/settlement'
import type { Player, Transaction } from '@/types'

interface SettlementViewProps {
  isOpen: boolean
  onClose: () => void
  players: Player[]
  transactions: Transaction[]
}

export function SettlementView({
  isOpen,
  onClose,
  players,
  transactions,
}: SettlementViewProps) {
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
    return new Map(players.map(p => [p.id, p]))
  }, [players])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="结算">
      <div className="space-y-6">
        {/* Balance summary */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">当前战绩</h3>
          <div className="space-y-2">
            {sortedBalances.map(bal => {
              const player = playerMap.get(bal.playerId)
              return (
                <div
                  key={bal.playerId}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: player?.avatar_color || '#6366f1' }}
                    />
                    <span className="font-medium text-gray-900">{bal.playerName}</span>
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
                      <span
                        className="font-medium"
                        style={{ color: fromPlayer?.avatar_color || '#ef4444' }}
                      >
                        {transfer.from.name}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span
                        className="font-medium"
                        style={{ color: toPlayer?.avatar_color || '#22c55e' }}
                      >
                        {transfer.to.name}
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
      </div>
    </Modal>
  )
}
