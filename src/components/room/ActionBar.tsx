'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useI18n } from '@/lib/i18n'

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
  const { t } = useI18n()

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
                {t.room.nextRoundCountdown(countdown)}
              </span>
              <span className="text-amber-500 text-xs">
                · {t.common.cancel}
              </span>
            </button>
          ) : (
            <div className="flex-1 min-h-[44px] px-4 text-center text-gray-500 font-medium flex items-center justify-center">
              {t.room.roundLabel(currentRoundNum)}
            </div>
          )}

          {/* Next Round Button */}
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => setShowConfirmModal(true)}
          >
            {t.room.nextRound}
          </Button>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={t.room.confirmNextRoundTitle}
      >
        <p className="text-gray-600 mb-6">
          {t.room.confirmNextRoundBody(currentRoundNum + 1)}
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setShowConfirmModal(false)}
          >
            {t.common.cancel}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleConfirmNewRound}
          >
            {t.common.confirm}
          </Button>
        </div>
      </Modal>
    </>
  )
}
