'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ProfileEditor } from '@/components/home/ProfileEditor'
import { JoinRoomModal } from '@/components/home/JoinRoomModal'
import { useSupabase } from '@/hooks/useSupabase'
import { generateRoomCode } from '@/lib/settlement'
import { useI18n } from '@/lib/i18n'
import { getRandomNickname, getRandomEmoji } from '@/types'

export function HomeApp() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const { language, t } = useI18n()

  const [emoji, setEmoji] = useState('😀')
  const [nickname, setNickname] = useState('')
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [creating, setCreating] = useState(false)

  // Load saved profile from database, fallback to localStorage, then random.
  // Also redirect to room if user is already in a room.
  useEffect(() => {
    const loadProfile = async () => {
      if (user && supabase) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_emoji, current_room_id')
            .eq('user_id', user.id)
            .single()

          if (profile) {
            if (profile.current_room_id) {
              const { data: room } = await supabase
                .from('rooms')
                .select('code')
                .eq('id', profile.current_room_id)
                .single()

              if (room) {
                router.push(`/room/${room.code}`)
                return
              }
            }

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
        } catch {
          // Profile not found in database, continue with localStorage/random.
        }
      }

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
          setNickname(getRandomNickname(language))
        }
      } catch {
        setEmoji(getRandomEmoji())
        setNickname(getRandomNickname(language))
      }
    }

    if (!authLoading) {
      loadProfile()
    }
  }, [user, supabase, authLoading, router, language])

  const handleProfileSuccess = (newEmoji: string, newNickname: string) => {
    setEmoji(newEmoji)
    setNickname(newNickname)
  }

  const handleCreateRoom = async () => {
    if (!user) return

    if (!nickname.trim()) {
      setShowProfileEditor(true)
      return
    }

    setCreating(true)

    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('current_room_id')
        .eq('user_id', user.id)
        .single()

      if (currentProfile?.current_room_id) {
        const { data: currentRoom } = await supabase
          .from('rooms')
          .select('code')
          .eq('id', currentProfile.current_room_id)
          .single()

        if (currentRoom) {
          throw new Error(t.errors.alreadyInRoom(currentRoom.code))
        }
      }

      let code = generateRoomCode()
      let attempts = 0

      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', code)
          .maybeSingle()

        if (!existing) break
        code = generateRoomCode()
        attempts++
      }

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          created_by_user_id: user.id,
          countdown_seconds: 90,
        })
        .select()
        .single()

      if (roomError) throw roomError

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
      const message = err instanceof Error ? err.message : t.errors.createRoomFailed
      alert(message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinRoom = () => {
    if (!nickname.trim()) {
      setShowProfileEditor(true)
      return
    }
    setShowJoinRoom(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="relative pt-12 pb-20 text-center">
        <div className="absolute left-1/2 top-4 w-full max-w-md -translate-x-1/2 px-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t.common.appName}</h1>
      </header>

      <div className="flex-1 flex flex-col items-center px-6">
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-5xl border border-gray-100">
            {emoji}
          </div>

          <div className="relative flex items-center justify-center">
            <span className="text-lg font-medium text-gray-900">
              {nickname || t.home.unsetNickname}
            </span>
            <button
              type="button"
              onClick={() => setShowProfileEditor(true)}
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors p-2 flex-shrink-0"
              aria-label={t.home.editNickname}
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreateRoom}
            loading={creating}
            disabled={authLoading}
          >
            {t.home.createRoom}
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={handleJoinRoom}
            disabled={authLoading}
          >
            {t.home.joinRoom}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            size="lg"
            onClick={() => router.push('/history')}
          >
            {t.home.history}
          </Button>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-gray-400">
        {t.home.footer}
      </footer>

      <ProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        emoji={emoji}
        nickname={nickname}
        onSuccess={handleProfileSuccess}
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
