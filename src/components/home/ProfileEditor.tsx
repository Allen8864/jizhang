'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { useSupabase } from '@/hooks/useSupabase'
import { getRandomNickname } from '@/types'

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
  const [isRolling, setIsRolling] = useState(false)

  const handleRandomNickname = () => {
    if (isRolling) return
    setIsRolling(true)

    // 快速切换几次名字制造滚动效果
    let count = 0
    const interval = setInterval(() => {
      setEditNickname(getRandomNickname())
      count++
      if (count >= 6) {
        clearInterval(interval)
        setIsRolling(false)
      }
    }, 80)
  }

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
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            昵称
          </label>
          <div className="relative">
            <input
              className="w-full px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="输入你的昵称"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleRandomNickname}
              disabled={isRolling}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center
                text-xl rounded-md hover:bg-gray-100 active:scale-90 transition-all"
              title="随机昵称"
            >
              <span className={isRolling ? 'animate-dice-roll' : ''}>
                🎲
              </span>
            </button>
          </div>
        </div>

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
