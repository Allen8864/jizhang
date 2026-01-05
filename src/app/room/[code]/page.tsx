'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { Modal } from '@/components/ui/Modal'
import { ActionBar } from '@/components/room/ActionBar'
import { ProfileEditor } from '@/components/home/ProfileEditor'
import { Button } from '@/components/ui/Button'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { getRandomNickname, getRandomEmoji, type Profile } from '@/types'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = (params.code as string).toUpperCase()
  const isNewlyCreated = searchParams.get('created') === '1'
  const isNewUser = searchParams.get('new') === '1'

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
    cancelCountdown,
    setCountdownSeconds,
    countdownRemaining,
    isCountdownWarning,
    refetch,
  } = useRoom(roomCode)

  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [targetPlayer, setTargetPlayer] = useState<Profile | null>(null)
  const [showSettlement, setShowSettlement] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'game' | 'history'>('game')
  const [autoJoining, setAutoJoining] = useState(false)
  const hasAutoJoined = useRef(false)

  // Auto-join room if user is not a member
  useEffect(() => {
    if (hasAutoJoined.current) return
    if (loading || authLoading || !room || !user || currentPlayer || autoJoining) return

    hasAutoJoined.current = true
    setAutoJoining(true)

    const autoJoin = async () => {
      try {
        // Check if user already has a profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('name, avatar_emoji, current_room_id')
          .eq('user_id', user.id)
          .single()

        // If user is already in a different room, redirect to that room
        if (existingProfile?.current_room_id && existingProfile.current_room_id !== room.id) {
          const { data: currentRoom } = await supabase
            .from('rooms')
            .select('code')
            .eq('id', existingProfile.current_room_id)
            .single()

          if (currentRoom) {
            alert(`你已在房间 ${currentRoom.code} 中，正在跳转...`)
            router.push(`/room/${currentRoom.code}`)
            return
          }
        }

        const isFirstTimeUser = !existingProfile

        // Use existing profile data or generate new
        let nickname = existingProfile?.name || getRandomNickname()
        let emoji = existingProfile?.avatar_emoji || getRandomEmoji()

        // For new users, also check localStorage
        if (isFirstTimeUser) {
          try {
            const savedNickname = localStorage.getItem('jizhang_nickname')
            const savedEmoji = localStorage.getItem('jizhang_emoji')
            if (savedNickname) nickname = savedNickname
            if (savedEmoji) emoji = savedEmoji
          } catch {
            // Ignore localStorage errors
          }
        }

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

        if (profileError) {
          console.error('Auto-join error:', profileError)
          return
        }

        // Reload with new param if first time user to show profile editor
        if (isFirstTimeUser) {
          window.location.href = `/room/${roomCode}?new=1`
        } else {
          window.location.reload()
        }
      } catch (err) {
        console.error('Auto-join error:', err)
      } finally {
        setAutoJoining(false)
      }
    }

    autoJoin()
  }, [loading, authLoading, room, user, currentPlayer, autoJoining, supabase, roomCode, router])

  // Show share modal if room was just created
  useEffect(() => {
    if (isNewlyCreated && room && !loading) {
      setShowShareModal(true)
      // Remove the query param from URL without refresh
      router.replace(`/room/${roomCode}`, { scroll: false })
    }
  }, [isNewlyCreated, room, loading, router, roomCode])

  // Show profile editor for new user
  useEffect(() => {
    if (!room || loading || !currentPlayer) return
    if (isNewUser) {
      setShowProfileEditor(true)
      router.replace(`/room/${roomCode}`, { scroll: false })
    }
  }, [room, loading, currentPlayer, isNewUser, router, roomCode])

  // Handle room errors - redirect to home
  useEffect(() => {
    if (error === 'room_settled' || error === '房间不存在') {
      router.push('/')
    }
  }, [error, router])

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
  if (loading || authLoading || autoJoining) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{autoJoining ? '正在加入房间...' : '加载中...'}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    // Don't show error UI for redirecting errors
    if (error === 'room_settled' || error === '房间不存在') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">
              {error === 'room_settled' ? '房间已结算，正在返回首页...' : '房间不存在，正在返回首页...'}
            </p>
          </div>
        </div>
      )
    }

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

  // Main room view
  if (!room) return null

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <RoomHeader room={room} isConnected={isConnected} playerCount={players.length} onOpenSettings={() => setShowSettingsModal(true)} onOpenHelp={() => setShowHelpModal(true)} />

      {/* Fixed player list */}
      <div className="flex-shrink-0 px-4 pt-4 max-w-md mx-auto w-full">
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
      </div>

      {/* Fixed Tabs */}
      <div className="flex-shrink-0 px-4 pt-4 max-w-md mx-auto w-full">
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
      </div>

      {/* Scrollable content area with pull-to-refresh */}
      <PullToRefresh onRefresh={refetch} className="flex-1 overflow-hidden">
        <main className="px-4 py-4 pb-24 max-w-md mx-auto w-full">
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
      </PullToRefresh>

      {/* Action bar */}
      <ActionBar
        onNewRound={handleNewRound}
        currentRoundNum={currentRoundNum}
        countdown={countdownRemaining}
        isWarning={isCountdownWarning}
        onCancelCountdown={cancelCountdown}
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
        transactions={transactions}
        onOpenSettlement={() => setShowSettlement(true)}
        onSetCountdownSeconds={setCountdownSeconds}
      />

      {/* Help modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="使用说明"
      >
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">邀请好友</h3>
            <p>点击玩家列表右侧的「+」按钮，分享房间链接或二维码邀请好友加入。</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">头像操作</h3>
            <p>点击自己的头像可以修改昵称和头像；点击其他玩家头像记录支出。</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">自动下一轮</h3>
            <p>每次记录交易后会自动开始倒计时，倒计时结束自动进入下一轮；也可以手动点击「下一轮」。可在右上角设置中调整倒计时时长或关闭此功能。</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">结算</h3>
            <p>牌局结束后，点击右上角设置按钮进入结算页面，系统会自动计算最优转账方案。</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
