'use client'

import { Button } from '@/components/ui/Button'
import type { Round } from '@/types'

interface ActionBarProps {
  onSettlement: () => void
  onNewRound: () => void
  currentRound: Round | null
  transactionCount: number
}

export function ActionBar({
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
          className="flex-1 text-gray-500"
        >
          {currentRound ? `第${currentRound.index}轮` : '新一轮'}
        </Button>

        {/* Settlement Button */}
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onSettlement}
          disabled={transactionCount === 0}
        >
          结算
        </Button>
      </div>
    </div>
  )
}
