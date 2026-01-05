'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSupabase } from '@/hooks/useSupabase'
import { getRandomEmoji } from '@/types'

export function JoinRoomForm() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved nickname on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jizhang_nickname')
      if (saved) setNickname(saved)
    } catch (e) {
      // Ignore
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('请稍候，正在初始化...')
      return
    }

    const code = roomCode.trim()
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError('请输入4位数字房间号')
      return
    }

    if (!nickname.trim()) {
      setError('请输入你的昵称')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if room exists
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code)
        .single()

      if (roomError || !room) {
        throw new Error('房间不存在，请检查房间号')
      }

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
      console.error('Join room error:', err)
      setError(err instanceof Error ? err.message : '加入房间失败')
    } finally {
      setLoading(false)
    }
  }

  // Format room code as user types (only allow digits)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
    setRoomCode(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="房间号"
        placeholder="输入4位数字房间号"
        value={roomCode}
        onChange={handleCodeChange}
        className="text-center text-xl tracking-widest font-mono"
        maxLength={4}
      />

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
        disabled={roomCode.length !== 4 || !nickname.trim()}
      >
        加入房间
      </Button>
    </form>
  )
}
