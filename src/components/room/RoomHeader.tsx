'use client'

import type { Room } from '@/types'

interface RoomHeaderProps {
  room: Room
  isConnected: boolean
  playerCount: number
  onOpenSettings: () => void
}

export function RoomHeader({ room, isConnected, playerCount, onOpenSettings }: RoomHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-gray-900">房间：{room.code}</h1>
          <span className="text-sm text-gray-500">({playerCount}人)</span>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
