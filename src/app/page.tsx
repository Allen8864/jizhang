'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ProfileEditor } from '@/components/home/ProfileEditor'
import { JoinRoomModal } from '@/components/home/JoinRoomModal'
import { useSupabase } from '@/hooks/useSupabase'
import { generateRoomCode } from '@/lib/settlement'
import { getRandomNickname, getRandomEmoji } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()

  const [emoji, setEmoji] = useState('😀')
  const [nickname, setNickname] = useState('')
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [creating, setCreating] = useState(false)

  // Load saved profile from database, fallback to localStorage, then random
  useEffect(() => {
    const loadProfile = async () => {
      // First try to load from database if user is available
      if (user && supabase) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_emoji')
            .eq('user_id', user.id)
            .single()

          if (profile) {
            if (profile.avatar_emoji) {
              setEmoji(profile.avatar_emoji)
              localStorage.setItem('jizhang_emoji', profile.avatar_emoji)
            }
            if (profile.name) {
              setNickname(profile.name)
              localStorage.setItem('jizhang_nickname', profile.name)
            }
            return
          }
        } catch (e) {
          // Profile not found in database, continue with localStorage/random
        }
      }

      // Fallback to localStorage or random
      try {
        const savedEmoji = localStorage.getItem('jizhang_emoji')
        const savedNickname = localStorage.getItem('jizhang_nickname')
        if (savedEmoji) {
          setEmoji(savedEmoji)
        } else {
          setEmoji(getRandomEmoji())
        }
        if (savedNickname) {
          setNickname(savedNickname)
        } else {
          setNickname(getRandomNickname())
        }
      } catch (e) {
        setEmoji(getRandomEmoji())
        setNickname(getRandomNickname())
      }
    }

    if (!authLoading) {
      loadProfile()
    }
  }, [user, supabase, authLoading])

  // Save profile
  const handleSaveProfile = (newEmoji: string, newNickname: string) => {
    setEmoji(newEmoji)
    setNickname(newNickname)
    try {
      localStorage.setItem('jizhang_emoji', newEmoji)
      localStorage.setItem('jizhang_nickname', newNickname)
    } catch (e) {
      // Ignore
    }
  }

  // Create room
  const handleCreateRoom = async () => {
    if (!user) return

    // Check if nickname is set
    if (!nickname.trim()) {
      setShowProfileEditor(true)
      return
    }

    setCreating(true)

    try {
      // Generate unique room code
      let code = generateRoomCode()
      let attempts = 0

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
          name: nickname,
          avatar_emoji: emoji,
          current_room_id: room.id,
          joined_room_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (profileError) throw profileError

      router.push(`/room/${code}?created=1`)
    } catch (err) {
      console.error('Create room error:', err)
      const message = err instanceof Error ? err.message : '创建房间失败'
      alert(message)
    } finally {
      setCreating(false)
    }
  }

  // Handle join room click
  const handleJoinRoom = () => {
    if (!nickname.trim()) {
      setShowProfileEditor(true)
      return
    }
    setShowJoinRoom(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900">打牌记账</h1>
      </header>

      {/* Profile section */}
      <div className="flex-1 flex flex-col items-center px-6">
        <div className="flex flex-col items-center gap-3 mb-12">
          {/* Avatar */}
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-5xl border border-gray-100">
            {emoji}
          </div>

          {/* Nickname + Edit button */}
          <div className="relative flex items-center justify-center">
            <span className="text-lg font-medium text-gray-900">
              {nickname || '未设置昵称'}
            </span>
            <button
              type="button"
              onClick={() => setShowProfileEditor(true)}
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors p-2 flex-shrink-0"
              aria-label="编辑昵称"
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-xs space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreateRoom}
            loading={creating}
            disabled={authLoading}
          >
            创建房间
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={handleJoinRoom}
            disabled={authLoading}
          >
            加入房间
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            size="lg"
            onClick={() => router.push('/history')}
          >
            历史记录
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        无需注册，即开即用
      </footer>

      {/* Modals */}
      <ProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        emoji={emoji}
        nickname={nickname}
        onSave={handleSaveProfile}
      />

      <JoinRoomModal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        nickname={nickname}
        emoji={emoji}
      />
    </div>
  )
}
