'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ShareModal } from './ShareModal'
import type { Room } from '@/types'

interface RoomHeaderProps {
  room: Room
  isConnected: boolean
}

export function RoomHeader({ room, isConnected }: RoomHeaderProps) {
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-gray-900">房间：{room.code}</h1>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowShare(true)}
          >
            分享
          </Button>
        </div>
      </header>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        room={room}
      />
    </>
  )
}
