'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmojiPicker } from '@/components/ui/EmojiPicker'

interface ProfileEditorProps {
  isOpen: boolean
  onClose: () => void
  emoji: string
  nickname: string
  onSave: (emoji: string, nickname: string) => void
}

export function ProfileEditor({
  isOpen,
  onClose,
  emoji,
  nickname,
  onSave,
}: ProfileEditorProps) {
  const [editEmoji, setEditEmoji] = useState(emoji)
  const [editNickname, setEditNickname] = useState(nickname)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditEmoji(emoji)
      setEditNickname(nickname)
    }
  }, [isOpen, emoji, nickname])

  const handleSave = () => {
    if (!editNickname.trim()) return
    onSave(editEmoji, editNickname.trim())
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑资料">
      <div className="space-y-4">
        {/* Current avatar preview */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
            {editEmoji}
          </div>
        </div>

        {/* Emoji picker */}
        <EmojiPicker value={editEmoji} onChange={setEditEmoji} />

        {/* Nickname input */}
        <Input
          label="昵称"
          placeholder="输入你的昵称"
          value={editNickname}
          onChange={(e) => setEditNickname(e.target.value)}
          maxLength={20}
        />

        {/* Save button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={!editNickname.trim()}
        >
          保存
        </Button>
      </div>
    </Modal>
  )
}
