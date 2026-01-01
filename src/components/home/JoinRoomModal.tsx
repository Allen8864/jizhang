'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSupabase } from '@/hooks/useSupabase'

interface JoinRoomModalProps {
  isOpen: boolean
  onClose: () => void
  nickname: string
  emoji: string
}

export function JoinRoomModal({
  isOpen,
  onClose,
  nickname,
  emoji,
}: JoinRoomModalProps) {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('请稍候，正在初始化...')
      return
    }

    const code = roomCode.toUpperCase().trim()
    if (code.length !== 6) {
      setError('请输入6位房间号')
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

      // Check if user is already a member
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single()

      if (!existingPlayer) {
        // Join room by creating player record
        const { error: playerError } = await supabase
          .from('players')
          .insert({
            room_id: room.id,
            user_id: user.id,
            name: nickname,
            avatar_color: emoji, // Store emoji as avatar_color for now
          })

        if (playerError && playerError.code !== '23505') {
          throw playerError
        }
      }

      onClose()
      router.push(`/room/${code}`)
    } catch (err) {
      console.error('Join room error:', err)
      setError(err instanceof Error ? err.message : '加入房间失败')
    } finally {
      setLoading(false)
    }
  }

  // Format room code as user types
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setRoomCode(value)
    setError('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="加入房间">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="房间号"
          placeholder="输入6位房间号"
          value={roomCode}
          onChange={handleCodeChange}
          className="text-center text-2xl tracking-[0.3em] font-mono"
          maxLength={6}
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          disabled={roomCode.length !== 6}
        >
          加入
        </Button>
      </form>
    </Modal>
  )
}
