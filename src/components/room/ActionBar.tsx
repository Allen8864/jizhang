'use client'

import { Button } from '@/components/ui/Button'
import type { Round } from '@/types'

interface ActionBarProps {
  onAddTransaction: () => void
  onSettlement: () => void
  onNewRound: () => void
  currentRound: Round | null
  transactionCount: number
}

export function ActionBar({
  onAddTransaction,
  onSettlement,
  onNewRound,
  currentRound,
  transactionCount,
}: ActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-safe z-20">
      <div className="max-w-md mx-auto flex items-center gap-3">
        {/* New Round Button */}
        <Button
          variant="ghost"
          size="md"
          onClick={onNewRound}
          className="text-gray-500"
        >
          {currentRound ? `第${currentRound.index}轮` : '新一轮'}
        </Button>

        {/* Add Transaction - Primary Action */}
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onAddTransaction}
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          记一笔
        </Button>

        {/* Settlement Button */}
        <Button
          variant="secondary"
          size="md"
          onClick={onSettlement}
          disabled={transactionCount === 0}
        >
          结算
        </Button>
      </div>
    </div>
  )
}
