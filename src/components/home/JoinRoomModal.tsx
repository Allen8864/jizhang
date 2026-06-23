'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSupabase } from '@/hooks/useSupabase'
import { useI18n } from '@/lib/i18n'

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
  const { user, supabase } = useSupabase()
  const { t } = useI18n()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigateToRoom = (code: string) => {
    window.location.assign(`/room/${code}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError(t.errors.initializing)
      return
    }

    const code = roomCode.trim()
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError(t.errors.invalidRoomCode)
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if room exists first, so an existing membership in the same room
      // can recover from a previous navigation that did not complete.
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, code')
        .eq('code', code)
        .single()

      if (roomError || !room) {
        throw new Error(t.errors.roomNotFoundCheckCode)
      }

      // Check if user is already in a room
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('current_room_id')
        .eq('user_id', user.id)
        .single()

      if (currentProfile?.current_room_id) {
        if (currentProfile.current_room_id === room.id) {
          onClose()
          navigateToRoom(room.code)
          return
        }

        // Get the room code of the current room
        const { data: currentRoom } = await supabase
          .from('rooms')
          .select('code')
          .eq('id', currentProfile.current_room_id)
          .single()

        if (currentRoom) {
          throw new Error(t.errors.alreadyInRoom(currentRoom.code))
        }
      }

      // Upsert profile with current_room_id
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: nickname,
          avatar_emoji: emoji,
          current_room_id: room.id,
          joined_room_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (profileError) throw profileError

      onClose()
      navigateToRoom(room.code)
    } catch (err) {
      console.error('Join room error:', err)
      setError(err instanceof Error ? err.message : t.errors.joinRoomFailed)
    } finally {
      setLoading(false)
    }
  }

  // Format room code as user types (only allow digits)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setRoomCode(value)
    setError('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.joinRoom.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder={t.joinRoom.placeholder}
          value={roomCode}
          onChange={handleCodeChange}
          className="text-center text-2xl tracking-[0.3em] font-num"
          maxLength={4}
          inputMode="numeric"
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
          disabled={roomCode.length !== 4}
        >
          {t.joinRoom.submit}
        </Button>
      </form>
    </Modal>
  )
}
