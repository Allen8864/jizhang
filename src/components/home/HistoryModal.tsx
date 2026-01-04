'use client'

import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { RoomHistory } from '@/types'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: RoomHistory[]
  onClear: () => void
}

export function HistoryModal({
  isOpen,
  onClose,
  history,
  onClear,
}: HistoryModalProps) {
  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="历史记录">
      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>暂无历史记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.code}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 font-mono">{room.code}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(room.lastVisited)}
                </div>
              </Link>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full text-gray-400"
            onClick={() => {
              onClear()
              onClose()
            }}
          >
            清除历史记录
          </Button>
        </div>
      )}
    </Modal>
  )
}
