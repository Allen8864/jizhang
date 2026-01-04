'use client'

import Link from 'next/link'
import { useRoomHistory } from '@/hooks/useRoom'

export function RecentRooms() {
  const { history, clearHistory } = useRoomHistory()

  if (history.length === 0) {
    return null
  }

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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">最近的房间</h3>
        <button
          onClick={clearHistory}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          清除
        </button>
      </div>

      <div className="space-y-2">
        {history.slice(0, 5).map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.code}`}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900 font-mono">{room.code}</div>
              {room.playerName && (
                <div className="text-sm text-gray-500">{room.playerName}</div>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {formatTime(room.lastVisited)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
