'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import type { Room, Player, Transaction, Round, RoomHistory } from '@/types'

interface RoomState {
  room: Room | null
  players: Player[]
  transactions: Transaction[]
  rounds: Round[]
  currentPlayer: Player | null
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
    rounds: [],
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
        const [playersRes, transactionsRes, roundsRes] = await Promise.all([
          supabase.from('players').select('*').eq('room_id', room.id).eq('is_active', true),
          supabase.from('transactions').select('*').eq('room_id', room.id).order('created_at', { ascending: false }),
          supabase.from('rounds').select('*').eq('room_id', room.id).order('index', { ascending: true }),
        ])

        const currentPlayer = playersRes.data?.find(p => p.user_id === user.id) || null

        setState({
          room,
          players: playersRes.data || [],
          transactions: transactionsRes.data || [],
          rounds: roundsRes.data || [],
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

    // Subscribe to players changes
    const playersChannel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setState(prev => {
            if (payload.eventType === 'INSERT') {
              // Avoid duplicates
              if (prev.players.some(p => p.id === (payload.new as Player).id)) {
                return prev
              }
              return { ...prev, players: [...prev.players, payload.new as Player] }
            }
            if (payload.eventType === 'UPDATE') {
              return {
                ...prev,
                players: prev.players.map(p =>
                  p.id === (payload.new as Player).id ? payload.new as Player : p
                ),
                currentPlayer: prev.currentPlayer?.id === (payload.new as Player).id
                  ? payload.new as Player
                  : prev.currentPlayer,
              }
            }
            if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                players: prev.players.filter(p => p.id !== (payload.old as { id: string }).id),
              }
            }
            return prev
          })
        }
      )
      .subscribe((status) => {
        setState(prev => ({ ...prev, isConnected: status === 'SUBSCRIBED' }))
      })

    // Subscribe to transactions changes
    const transactionsChannel = supabase
      .channel(`transactions:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setState(prev => {
            if (payload.eventType === 'INSERT') {
              // Avoid duplicates and maintain order
              if (prev.transactions.some(t => t.id === (payload.new as Transaction).id)) {
                return prev
              }
              return {
                ...prev,
                transactions: [payload.new as Transaction, ...prev.transactions],
              }
            }
            if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                transactions: prev.transactions.filter(t => t.id !== (payload.old as { id: string }).id),
              }
            }
            return prev
          })
        }
      )
      .subscribe()

    // Subscribe to rounds changes
    const roundsChannel = supabase
      .channel(`rounds:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setState(prev => {
            if (payload.eventType === 'INSERT') {
              if (prev.rounds.some(r => r.id === (payload.new as Round).id)) {
                return prev
              }
              return { ...prev, rounds: [...prev.rounds, payload.new as Round] }
            }
            if (payload.eventType === 'UPDATE') {
              return {
                ...prev,
                rounds: prev.rounds.map(r =>
                  r.id === (payload.new as Round).id ? payload.new as Round : r
                ),
              }
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(playersChannel)
      supabase.removeChannel(transactionsChannel)
      supabase.removeChannel(roundsChannel)
    }
  }, [state.room, user, supabase])

  // Actions
  const addTransaction = useCallback(async (
    fromPlayerId: string,
    toPlayerId: string,
    amount: number
  ) => {
    if (!state.room || !user) throw new Error('未加入房间')

    const currentRound = state.rounds.find(r => !r.ended_at)

    const { error } = await supabase.from('transactions').insert({
      room_id: state.room.id,
      from_player_id: fromPlayerId,
      to_player_id: toPlayerId,
      amount,
      round_id: currentRound?.id || null,
      created_by_user_id: user.id,
    })

    if (error) throw error
  }, [state.room, state.rounds, user, supabase])

  const deleteTransaction = useCallback(async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) throw error
  }, [supabase])

  const startNewRound = useCallback(async () => {
    if (!state.room) throw new Error('未加入房间')

    const nextIndex = state.rounds.length > 0
      ? Math.max(...state.rounds.map(r => r.index)) + 1
      : 1

    // End current round if exists
    const currentRound = state.rounds.find(r => !r.ended_at)
    if (currentRound) {
      await supabase
        .from('rounds')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', currentRound.id)
    }

    // Create new round
    const { error } = await supabase.from('rounds').insert({
      room_id: state.room.id,
      index: nextIndex,
      started_at: new Date().toISOString(),
    })

    if (error) throw error
  }, [state.room, state.rounds, supabase])

  const endCurrentRound = useCallback(async () => {
    const currentRound = state.rounds.find(r => !r.ended_at)
    if (!currentRound) return

    const { error } = await supabase
      .from('rounds')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', currentRound.id)

    if (error) throw error
  }, [state.rounds, supabase])

  return {
    ...state,
    addTransaction,
    deleteTransaction,
    startNewRound,
    endCurrentRound,
  }
}

// Helper to save room to localStorage
function saveRoomToHistory(room: Room, player: Player) {
  try {
    const historyStr = localStorage.getItem('jizhang_rooms')
    const history: RoomHistory[] = historyStr ? JSON.parse(historyStr) : []
    const existing = history.findIndex((r) => r.id === room.id)

    const entry: RoomHistory = {
      id: room.id,
      code: room.code,
      playerName: player.name,
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
