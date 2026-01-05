'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ActionBarProps {
  onNewRound: () => void
  currentRoundNum: number
}

export function ActionBar({
  onNewRound,
  currentRoundNum,
}: ActionBarProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleConfirmNewRound = () => {
    onNewRound()
    setShowConfirmModal(false)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-4 pb-safe z-20">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Current Round Display (not clickable) */}
          <div className="flex-1 py-2 px-4 text-center text-gray-500 font-medium">
            第{currentRoundNum}轮
          </div>

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
