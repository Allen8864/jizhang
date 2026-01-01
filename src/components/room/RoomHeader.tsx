'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
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
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900 leading-tight">{room.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-mono">{room.code}</span>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>
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
