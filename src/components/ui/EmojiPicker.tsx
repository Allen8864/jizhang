'use client'

import { useState } from 'react'

// 常用表情符号
const EMOJI_LIST = [
  '😀', '😎', '🤓', '😊', '🥳', '😇', '🤩', '😋',
  '🐶', '🐱', '🐼', '🐨', '🦊', '🦁', '🐯', '🐰',
  '🍀', '🌸', '🌺', '🌻', '🍎', '🍊', '🍋', '🍇',
  '⭐', '🌙', '☀️', '🔥', '💎', '🎮', '🎲', '🃏',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`w-10 h-10 text-2xl rounded-lg flex items-center justify-center transition-all
            ${value === emoji
              ? 'bg-emerald-100 ring-2 ring-emerald-500'
              : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export { EMOJI_LIST }
