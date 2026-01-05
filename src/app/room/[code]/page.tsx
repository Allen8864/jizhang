'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useSupabase } from '@/hooks/useSupabase'
import { RoomHeader } from '@/components/room/RoomHeader'
import { PlayerList } from '@/components/room/PlayerList'
import { TransactionList } from '@/components/room/TransactionList'
import { GameRoundTable } from '@/components/room/GameRoundTable'
import { TransactionForm } from '@/components/room/TransactionForm'
import { SettlementView } from '@/components/room/SettlementView'
import { ShareModal } from '@/components/room/ShareModal'
import { RoomSettingsModal } from '@/components/room/RoomSettingsModal'
import { ActionBar } from '@/components/room/ActionBar'
import { ProfileEditor } from '@/components/home/ProfileEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getRandomNickname, getRandomEmoji, type Profile } from '@/types'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = (params.code as string).toUpperCase()
  const isNewlyCreated = searchParams.get('created') === '1'

  const { user, supabase, loading: authLoading } = useSupabase()
  const {
    room,
    players,
    transactions,
    currentRoundNum,
    currentPlayer,
    loading,
    error,
    isConnected,
    addTransaction,
    startNewRound,
  } = useRoom(roomCode)

  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [targetPlayer, setTargetPlayer] = useState<Profile | null>(null)
  const [showSettlement, setShowSettlement] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [nickname, setNickname] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [activeTab, setActiveTab] = useState<'game' | 'history'>('game')

  // Load saved nickname or generate random one
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jizhang_nickname')
      if (saved) {
        setNickname(saved)
      } else {
        setNickname(getRandomNickname())
      }
    } catch (e) {
      setNickname(getRandomNickname())
    }
  }, [])

  // Show join form if room exists but user is not a member
  useEffect(() => {
    if (!loading && room && !currentPlayer && user) {
      setShowJoinForm(true)
    }
  }, [loading, room, currentPlayer, user])

  // Show share modal if room was just created
  useEffect(() => {
    if (isNewlyCreated && room && !loading) {
      setShowShareModal(true)
      // Remove the query param from URL without refresh
      router.replace(`/room/${roomCode}`, { scroll: false })
    }
  }, [isNewlyCreated, room, loading, router, roomCode])

  // Handle join room - upsert profile with current_room_id
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room || !user) return

    if (!nickname.trim()) {
      setJoinError('请输入你的昵称')
      return
    }

    setJoining(true)
    setJoinError('')

    try {
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

      if (profileError) {
        throw profileError
      }

      // Save nickname preference
      try {
        localStorage.setItem('jizhang_nickname', nickname.trim())
      } catch (e) {
        // Ignore
      }

      setShowJoinForm(false)
      // Refresh to load updated data
      window.location.reload()
    } catch (err) {
      console.error('Join error:', err)
      setJoinError(err instanceof Error ? err.message : '加入失败')
    } finally {
      setJoining(false)
    }
  }

  // Handle add transaction
  const handleAddTransaction = useCallback(async (
    fromUserId: string,
    toUserId: string,
    amount: number
  ) => {
    await addTransaction(fromUserId, toUserId, amount)
  }, [addTransaction])

  // Handle new round
  const handleNewRound = useCallback(async () => {
    try {
      await startNewRound()
    } catch (err) {
      console.error('New round error:', err)
    }
  }, [startNewRound])

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">出错了</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  // Join form for new members
  if (showJoinForm && room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">加入房间</h2>
          <p className="text-gray-500 mb-6">房间号: {room.code}</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              label="你的昵称"
              placeholder="输入你的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              required
              autoFocus
            />

            {joinError && (
              <p className="text-red-500 text-sm">{joinError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={joining}
              disabled={!nickname.trim()}
            >
              加入房间
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Main room view
  if (!room) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <RoomHeader room={room} isConnected={isConnected} playerCount={players.length} onOpenSettings={() => setShowSettingsModal(true)} />

      <main className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Player list */}
        <PlayerList
          players={players}
          transactions={transactions}
          currentUserId={currentPlayer?.user_id || null}
          onAddFriend={() => setShowShareModal(true)}
          onEditProfile={() => setShowProfileEditor(true)}
          onPlayerClick={(player) => {
            setTargetPlayer(player)
            setShowTransactionForm(true)
          }}
        />

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('game')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'game'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            牌局
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            记录
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'game' ? (
          <GameRoundTable
            players={players}
            transactions={transactions}
            currentRoundNum={currentRoundNum}
            currentUserId={currentPlayer?.user_id || null}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            players={players}
          />
        )}
      </main>

      {/* Action bar */}
      <ActionBar
        onNewRound={handleNewRound}
        currentRoundNum={currentRoundNum}
      />

      {/* Transaction form modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false)
          setTargetPlayer(null)
        }}
        fromPlayer={currentPlayer || null}
        toPlayer={targetPlayer}
        onSubmit={handleAddTransaction}
      />

      {/* Settlement modal */}
      <SettlementView
        isOpen={showSettlement}
        onClose={() => setShowSettlement(false)}
        players={players}
        transactions={transactions}
        room={room}
      />

      {/* Share modal (shown after creating room) */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        room={room}
      />

      {/* Profile editor modal */}
      {currentPlayer && (
        <ProfileEditor
          isOpen={showProfileEditor}
          onClose={() => setShowProfileEditor(false)}
          emoji={currentPlayer.avatar_emoji}
          nickname={currentPlayer.name}
        />
      )}

      {/* Room settings modal */}
      <RoomSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        room={room}
        onOpenSettlement={() => setShowSettlement(true)}
      />
    </div>
  )
}
