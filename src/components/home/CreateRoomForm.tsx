'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSupabase } from '@/hooks/useSupabase'
import { generateRoomCode } from '@/lib/settlement'
import { getRandomEmoji } from '@/types'

export function CreateRoomForm() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('请稍候，正在初始化...')
      return
    }

    if (!nickname.trim()) {
      setError('请输入你的昵称')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Generate unique room code
      let code = generateRoomCode()
      let attempts = 0

      // Check if code exists and regenerate if needed
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', code)
          .single()

        if (!existing) break
        code = generateRoomCode()
        attempts++
      }

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          created_by_user_id: user.id,
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Upsert profile with current_room_id
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: nickname.trim(),
          avatar_emoji: getRandomEmoji(),
          current_room_id: room.id,
          joined_room_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (profileError) throw profileError

      // Save nickname preference
      try {
        localStorage.setItem('jizhang_nickname', nickname.trim())
      } catch (e) {
        // Ignore localStorage errors
      }

      // Navigate to room
      router.push(`/room/${code}`)
    } catch (err) {
      console.error('Create room error:', err)
      setError(err instanceof Error ? err.message : '创建房间失败')
    } finally {
      setLoading(false)
    }
  }

  // Try to load saved nickname
  useState(() => {
    try {
      const saved = localStorage.getItem('jizhang_nickname')
      if (saved) setNickname(saved)
    } catch (e) {
      // Ignore
    }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="你的昵称"
        placeholder="输入你的昵称"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={20}
        required
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading || authLoading}
        disabled={!nickname.trim()}
      >
        创建房间
      </Button>
    </form>
  )
}

