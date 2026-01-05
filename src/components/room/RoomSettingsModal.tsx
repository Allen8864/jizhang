'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useSupabase } from '@/hooks/useSupabase'
import type { Room, Transaction } from '@/types'

type TimerOption = 'manual' | '30' | '60' | '90'

interface RoomSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room
  transactions: Transaction[]
  onOpenSettlement: () => void
}

export function RoomSettingsModal({
  isOpen,
  onClose,
  room,
  transactions,
  onOpenSettlement,
}: RoomSettingsModalProps) {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const [timerOption, setTimerOption] = useState<TimerOption>('90')
  const [leaving, setLeaving] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const timerOptions: { value: TimerOption; label: string }[] = [
    { value: 'manual', label: '手动' },
    { value: '30', label: '30秒' },
    { value: '60', label: '60秒' },
    { value: '90', label: '90秒' },
  ]

  const handleLeaveRoom = async () => {
    if (!user) return

    setLeaving(true)
    try {
      // Clear current_room_id for this user
      const { error } = await supabase
        .from('profiles')
        .update({ current_room_id: null })
        .eq('user_id', user.id)

      if (error) {
        console.error('Leave room error:', error)
      }

      router.push('/')
    } catch (err) {
      console.error('Leave room error:', err)
    } finally {
      setLeaving(false)
    }
  }

  const handleSettlement = () => {
    onClose()
    onOpenSettlement()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="房间设置">
      <div className="space-y-6">
        {/* Timer Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">自动下一轮</h3>
          <p className="text-xs text-gray-400 mb-3">
            {timerOption === 'manual'
              ? '手动进入下一轮'
              : `产生转账记录后无操作 ${timerOption} 秒进入下一轮`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {timerOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  timerOption === option.value
                    ? 'bg-emerald-50 border-2 border-emerald-400'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="timer"
                  value={option.value}
                  checked={timerOption === option.value}
                  onChange={() => setTimerOption(option.value)}
                  className="sr-only"
                />
                <span className={`font-medium ${
                  timerOption === option.value ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSettlement}
            disabled={transactions.length === 0}
          >
            结算
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full text-red-600 hover:bg-red-50"
            onClick={() => setShowLeaveConfirm(true)}
          >
            退出房间
          </Button>
        </div>
      </div>

      {/* Leave Confirm Modal */}
      <Modal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title="退出房间"
      >
        <p className="text-gray-600 mb-6">确定要退出房间吗？</p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setShowLeaveConfirm(false)}
          >
            取消
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleLeaveRoom}
            loading={leaving}
          >
            确认退出
          </Button>
        </div>
      </Modal>
    </Modal>
  )
}
