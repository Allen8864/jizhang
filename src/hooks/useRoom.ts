'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import type { Room, Profile, Transaction, RoomHistory } from '@/types'

interface RoomState {
  room: Room | null
  players: Profile[]
  transactions: Transaction[]
  currentRoundNum: number // Current round number, starting from 1
  currentPlayer: Profile | null
  loading: boolean
  error: string | null
  isConnected: boolean
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
  })


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

        setState({
          room,
          players: profilesRes.data || [],
          transactions,
          currentRoundNum: room.current_round, // Read from database
          currentPlayer,
          loading: false,
          error: null,
          isConnected: true,
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

    // Subscribe to room changes (for current_round updates)
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const updatedRoom = payload.new as Room
          setState(prev => ({
            ...prev,
            room: updatedRoom,
            currentRoundNum: updatedRoom.current_round,
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

  // Actions
  const addTransaction = useCallback(async (
    fromUserId: string,
    toUserId: string,
    amount: number
  ) => {
    if (!state.room || !user) throw new Error('未加入房间')

    const { error } = await supabase.from('transactions').insert({
      room_id: state.room.id,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
      round_num: state.currentRoundNum,
    })

    if (error) throw error
  }, [state.room, state.currentRoundNum, user, supabase])

  const startNewRound = useCallback(async () => {
    if (!state.room) throw new Error('未加入房间')

    const newRoundNum = state.currentRoundNum + 1

    // Update the round number in the database
    const { error } = await supabase
      .from('rooms')
      .update({ current_round: newRoundNum })
      .eq('id', state.room.id)

    if (error) throw error

    // Optimistically update local state (realtime subscription will also update it)
    setState(prev => ({
      ...prev,
      currentRoundNum: newRoundNum,
    }))
  }, [state.room, state.currentRoundNum, supabase])

  return {
    ...state,
    addTransaction,
    startNewRound,
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
