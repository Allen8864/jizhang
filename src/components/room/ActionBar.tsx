'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ActionBarProps {
  onNewRound: () => void
  currentRoundNum: number
  countdown: number | null // null means no countdown
  isWarning: boolean // true when countdown <= 30s
  onCancelCountdown: () => void
}

export function ActionBar({
  onNewRound,
  currentRoundNum,
  countdown,
  isWarning,
  onCancelCountdown,
}: ActionBarProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleConfirmNewRound = () => {
    onCancelCountdown() // Cancel countdown when manually starting next round
    onNewRound()
    setShowConfirmModal(false)
  }

  // Handle click on countdown warning area to cancel
  const handleCancelClick = () => {
    onCancelCountdown()
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-4 pb-safe z-20">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Current Round Display / Countdown Warning */}
          {isWarning && countdown !== null ? (
            <button
              onClick={handleCancelClick}
              className="flex-1 min-h-[44px] px-3 text-center rounded-lg bg-amber-50 border border-amber-200 transition-colors hover:bg-amber-100 flex items-center justify-center gap-1"
            >
              <span className="text-amber-700 font-medium text-sm font-num">
                <span className="inline-block w-5 text-right">{countdown}</span>s后下一轮
              </span>
              <span className="text-amber-500 text-xs">
                · 取消
              </span>
            </button>
          ) : (
            <div className="flex-1 min-h-[44px] px-4 text-center text-gray-500 font-medium flex items-center justify-center">
              第{currentRoundNum}轮
            </div>
          )}

          {/* Next Round Button */}
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => setShowConfirmModal(true)}
          >
            下一轮
          </Button>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="确认下一轮"
      >
        <p className="text-gray-600 mb-6">
          确定要开始第 {currentRoundNum + 1} 轮吗？
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setShowConfirmModal(false)}
          >
            取消
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleConfirmNewRound}
          >
            确认
          </Button>
        </div>
      </Modal>
    </>
  )
}
