'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSupabase } from './useSupabase'
import type { Room, Profile, Transaction, RoomHistory } from '@/types'

// Warning threshold - show countdown warning when remaining time <= this value
const COUNTDOWN_WARNING_THRESHOLD = 30

// Helper function to calculate remaining countdown seconds
function calculateCountdownRemaining(countdownEndAt: string | null): number | null {
  if (!countdownEndAt) return null
  const remaining = Math.ceil((new Date(countdownEndAt).getTime() - Date.now()) / 1000)
  return remaining > 0 ? remaining : null
}

interface RoomState {
  room: Room | null
  players: Profile[]
  transactions: Transaction[]
  currentRoundNum: number // Current round number, starting from 1
  currentPlayer: Profile | null
  loading: boolean
  error: string | null
  isConnected: boolean
  // Countdown state (derived from room.countdown_end_at)
  countdownRemaining: number | null // Remaining seconds, null if no countdown
  isCountdownWarning: boolean // true when remaining <= 30s
}

export function useRoom(roomCode: string) {
  const { user, supabase, loading: authLoading } = useSupabase()
  const [state, setState] = useState<RoomState>({
    room: null,
    players: [],
    transactions: [],
    currentRoundNum: 1,
    currentPlayer: null,
    loading: true,
    error: null,
    isConnected: false,
    countdownRemaining: null,
    isCountdownWarning: false,
  })
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)


  // Initial data fetch
  useEffect(() => {
    if (authLoading) return
    if (!user || !roomCode) {
      setState(prev => ({ ...prev, loading: false, error: '请先登录' }))
      return
    }

    const fetchRoomData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        // Fetch room by code
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode.toUpperCase())
          .single()

        if (roomError) {
          if (roomError.code === 'PGRST116') {
            throw new Error('房间不存在')
          }
          throw roomError
        }
        if (!room) throw new Error('房间不存在')

        // Fetch all related data in parallel
        const [profilesRes, transactionsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('current_room_id', room.id),
          supabase.from('transactions').select('*').eq('room_id', room.id).order('created_at', { ascending: false }),
        ])

        const currentPlayer = profilesRes.data?.find(p => p.user_id === user.id) || null
        const transactions = transactionsRes.data || []

        // Calculate initial countdown remaining
        const countdownRemaining = calculateCountdownRemaining(room.countdown_end_at)

        setState({
          room,
          players: profilesRes.data || [],
          transactions,
          currentRoundNum: room.current_round, // Read from database
          currentPlayer,
          loading: false,
          error: null,
          isConnected: true,
          countdownRemaining,
          isCountdownWarning: countdownRemaining !== null && countdownRemaining <= COUNTDOWN_WARNING_THRESHOLD,
        })

        // Save to localStorage for history restoration
        if (currentPlayer) {
          saveRoomToHistory(room, currentPlayer)
        }

      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : '加载房间失败',
        }))
      }
    }

    fetchRoomData()
  }, [user, roomCode, supabase, authLoading])

  // Realtime subscriptions
  useEffect(() => {
    if (!state.room || !user) return

    const roomId = state.room.id

    // Subscribe to profiles changes (filter by current_room_id)
    const profilesChannel = supabase
      .channel(`profiles:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          setState(prev => {
            const newProfile = payload.new as Profile
            const oldProfile = payload.old as { user_id: string; current_room_id: string | null }

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              // Check if profile joined this room
              if (newProfile.current_room_id === roomId) {
                // Avoid duplicates
                const exists = prev.players.some(p => p.user_id === newProfile.user_id)
                if (exists) {
                  // Update existing
                  return {
                    ...prev,
                    players: prev.players.map(p =>
                      p.user_id === newProfile.user_id ? newProfile : p
                    ),
                    currentPlayer: prev.currentPlayer?.user_id === newProfile.user_id
                      ? newProfile
                      : prev.currentPlayer,
                  }
                } else {
                  // Add new
                  return { ...prev, players: [...prev.players, newProfile] }
                }
              } else if (oldProfile?.current_room_id === roomId) {
                // Profile left this room
                return {
                  ...prev,
                  players: prev.players.filter(p => p.user_id !== oldProfile.user_id),
                }
              }
            }
            if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                players: prev.players.filter(p => p.user_id !== oldProfile.user_id),
              }
            }
            return prev
          })
        }
      )
      .subscribe((status) => {
        setState(prev => ({ ...prev, isConnected: status === 'SUBSCRIBED' }))
      })

    // Subscribe to room changes (for current_round, countdown updates, and deletion)
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const updatedRoom = payload.new as Room
          const countdownRemaining = calculateCountdownRemaining(updatedRoom.countdown_end_at)
          setState(prev => ({
            ...prev,
            room: updatedRoom,
            currentRoundNum: updatedRoom.current_round,
            countdownRemaining,
            isCountdownWarning: countdownRemaining !== null && countdownRemaining <= COUNTDOWN_WARNING_THRESHOLD,
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        () => {
          // Room was deleted (settled), set room to null to trigger redirect
          setState(prev => ({
            ...prev,
            room: null,
            error: 'room_settled',
          }))
        }
      )
      .subscribe()

    // Subscribe to transactions changes
    const transactionsChannel = supabase
      .channel(`transactions:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setState(prev => {
            if (payload.eventType === 'INSERT') {
              const newTx = payload.new as Transaction
              // Avoid duplicates and maintain order
              if (prev.transactions.some(t => t.id === newTx.id)) {
                return prev
              }
              const newTransactions = [newTx, ...prev.transactions]
              return {
                ...prev,
                transactions: newTransactions,
              }
            }
            if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id
              const newTransactions = prev.transactions.filter(t => t.id !== deletedId)
              return {
                ...prev,
                transactions: newTransactions,
              }
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(roomChannel)
      supabase.removeChannel(transactionsChannel)
    }
  }, [state.room, user, supabase])

  // Countdown timer effect - updates local countdown display every second
  useEffect(() => {
    // Clear any existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    // Only start timer if there's an active countdown
    if (!state.room?.countdown_end_at) {
      setState(prev => ({
        ...prev,
        countdownRemaining: null,
        isCountdownWarning: false,
      }))
      return
    }

    // Update countdown every second
    const updateCountdown = () => {
      const remaining = calculateCountdownRemaining(state.room?.countdown_end_at || null)
      setState(prev => ({
        ...prev,
        countdownRemaining: remaining,
        isCountdownWarning: remaining !== null && remaining <= COUNTDOWN_WARNING_THRESHOLD,
      }))

      // If countdown reached 0, trigger next round
      if (remaining === null && state.room?.countdown_end_at) {
        // Countdown finished - the server should handle advancing the round
        // but we can trigger it from here as well for responsiveness
        startNewRoundInternal()
      }
    }

    // Initial update
    updateCountdown()

    // Start interval
    countdownTimerRef.current = setInterval(updateCountdown, 1000)

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }
  }, [state.room?.countdown_end_at])

  // Internal function to start new round (used by countdown timer)
  const startNewRoundInternal = useCallback(async () => {
    if (!state.room) return

    const newRoundNum = state.currentRoundNum + 1

    try {
      // Update round number and clear countdown
      await supabase
        .from('rooms')
        .update({
          current_round: newRoundNum,
          countdown_end_at: null,
        })
        .eq('id', state.room.id)
    } catch (err) {
      console.error('Failed to advance round:', err)
    }
  }, [state.room, state.currentRoundNum, supabase])

  // Actions
  const addTransaction = useCallback(async (
    fromUserId: string,
    toUserId: string,
    amount: number
  ) => {
    if (!state.room || !user) throw new Error('未加入房间')

    // Insert transaction
    const { error: txError } = await supabase.from('transactions').insert({
      room_id: state.room.id,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
      round_num: state.currentRoundNum,
    })

    if (txError) throw txError

    // If countdown is enabled, reset/start the countdown
    if (state.room.countdown_seconds) {
      const newEndAt = new Date(Date.now() + state.room.countdown_seconds * 1000).toISOString()
      await supabase
        .from('rooms')
        .update({ countdown_end_at: newEndAt })
        .eq('id', state.room.id)
    }
  }, [state.room, state.currentRoundNum, user, supabase])

  const startNewRound = useCallback(async () => {
    if (!state.room) throw new Error('未加入房间')

    const newRoundNum = state.currentRoundNum + 1

    // Update the round number and clear countdown
    const { error } = await supabase
      .from('rooms')
      .update({
        current_round: newRoundNum,
        countdown_end_at: null, // Clear countdown when manually advancing
      })
      .eq('id', state.room.id)

    if (error) throw error

    // Optimistically update local state (realtime subscription will also update it)
    setState(prev => ({
      ...prev,
      currentRoundNum: newRoundNum,
      countdownRemaining: null,
      isCountdownWarning: false,
    }))
  }, [state.room, state.currentRoundNum, supabase])

  // Cancel countdown without advancing round
  const cancelCountdown = useCallback(async () => {
    if (!state.room) return

    await supabase
      .from('rooms')
      .update({ countdown_end_at: null })
      .eq('id', state.room.id)

    setState(prev => ({
      ...prev,
      countdownRemaining: null,
      isCountdownWarning: false,
    }))
  }, [state.room, supabase])

  // Update countdown settings
  const setCountdownSeconds = useCallback(async (seconds: number | null) => {
    if (!state.room) return

    await supabase
      .from('rooms')
      .update({
        countdown_seconds: seconds,
        countdown_end_at: null, // Clear any active countdown when changing settings
      })
      .eq('id', state.room.id)
  }, [state.room, supabase])

  return {
    ...state,
    addTransaction,
    startNewRound,
    cancelCountdown,
    setCountdownSeconds,
  }
}

// Helper to save room to localStorage
function saveRoomToHistory(room: Room, profile: Profile) {
  try {
    const historyStr = localStorage.getItem('jizhang_rooms')
    const history: RoomHistory[] = historyStr ? JSON.parse(historyStr) : []
    const existing = history.findIndex((r) => r.id === room.id)

    const entry: RoomHistory = {
      id: room.id,
      code: room.code,
      playerName: profile.name,
      lastVisited: new Date().toISOString(),
    }

    if (existing >= 0) {
      history[existing] = entry
    } else {
      history.unshift(entry)
    }

    // Keep only last 10 rooms
    localStorage.setItem('jizhang_rooms', JSON.stringify(history.slice(0, 10)))
  } catch (e) {
    console.error('Failed to save room history', e)
  }
}

// Hook to get room history from localStorage
export function useRoomHistory() {
  const [history, setHistory] = useState<RoomHistory[]>([])

  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('jizhang_rooms')
      if (historyStr) {
        setHistory(JSON.parse(historyStr))
      }
    } catch (e) {
      console.error('Failed to load room history', e)
    }
  }, [])

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem('jizhang_rooms')
      setHistory([])
    } catch (e) {
      console.error('Failed to clear room history', e)
    }
  }, [])

  return { history, clearHistory }
}
