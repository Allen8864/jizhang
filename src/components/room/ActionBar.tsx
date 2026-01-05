'use client'

import { Button } from '@/components/ui/Button'

interface ActionBarProps {
  onSettlement: () => void
  onNewRound: () => void
  currentRoundNum: number
  transactionCount: number
}

export function ActionBar({
  onSettlement,
  onNewRound,
  currentRoundNum,
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
          第{currentRoundNum}轮
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
