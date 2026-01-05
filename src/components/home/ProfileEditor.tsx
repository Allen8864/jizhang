'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { useSupabase } from '@/hooks/useSupabase'

interface ProfileEditorProps {
  isOpen: boolean
  onClose: () => void
  emoji: string
  nickname: string
  onSuccess?: (emoji: string, nickname: string) => void
}

export function ProfileEditor({
  isOpen,
  onClose,
  emoji,
  nickname,
  onSuccess,
}: ProfileEditorProps) {
  const { user, supabase } = useSupabase()
  const [editEmoji, setEditEmoji] = useState(emoji)
  const [editNickname, setEditNickname] = useState(nickname)
  const [saving, setSaving] = useState(false)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditEmoji(emoji)
      setEditNickname(nickname)
    }
  }, [isOpen, emoji, nickname])

  const handleSave = async () => {
    if (!editNickname.trim()) return

    const trimmedNickname = editNickname.trim()
    setSaving(true)

    try {
      // Save to database if user exists
      if (user && supabase) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            name: trimmedNickname,
            avatar_emoji: editEmoji,
          }, {
            onConflict: 'user_id',
          })

        if (error) {
          console.error('Profile save error:', error)
          alert('保存失败，请重试')
          return
        }
      }

      // Save to localStorage
      try {
        localStorage.setItem('jizhang_emoji', editEmoji)
        localStorage.setItem('jizhang_nickname', trimmedNickname)
      } catch (e) {
        // Ignore localStorage errors
      }

      // Notify parent of success
      onSuccess?.(editEmoji, trimmedNickname)
      onClose()
    } catch (err) {
      console.error('Profile save error:', err)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
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
          disabled={!editNickname.trim() || saving}
          loading={saving}
        >
          保存
        </Button>
      </div>
    </Modal>
  )
}
