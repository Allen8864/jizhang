'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/hooks/useSupabase'
import { formatAmount } from '@/lib/settlement'
import type { SettlementHistory } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [history, setHistory] = useState<SettlementHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Calculate stats from history
  const stats = useMemo(() => {
    if (!user || history.length === 0) {
      return { wins: 0, losses: 0, winRate: 0, totalProfit: 0 }
    }

    let wins = 0
    let losses = 0
    let totalProfit = 0

    history.forEach(record => {
      // Find current user's result in this game
      const myResult = record.player_results.find(p => p.user_id === user.id)
      if (myResult) {
        totalProfit += myResult.balance
        if (myResult.balance > 0) {
          wins++
        } else if (myResult.balance < 0) {
          losses++
        }
        // balance === 0 is neither win nor loss
      }
    })

    const totalGames = wins + losses
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

    return { wins, losses, winRate, totalProfit }
  }, [history, user])

  // Fetch settlement history
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('settlement_history')
          .select('*')
          .eq('user_id', user.id)
          .order('settled_at', { ascending: false })

        if (error) throw error
        setHistory(data || [])
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, supabase, authLoading])

  // Format datetime as YYYY-MM-DD HH:mm
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // Get current user's result from a record
  const getMyResult = (record: SettlementHistory) => {
    if (!user) return null
    return record.player_results.find(p => p.user_id === user.id) || null
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">历史记录</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-4">
        {/* Stats Panel */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                <div className="text-xs text-gray-500">赢</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                <div className="text-xs text-gray-500">输</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.winRate}%</div>
                <div className="text-xs text-gray-500">胜率</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  stats.totalProfit > 0
                    ? 'text-green-600'
                    : stats.totalProfit < 0
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}>
                  {stats.totalProfit > 0 ? '+' : ''}{formatAmount(stats.totalProfit)}
                </div>
                <div className="text-xs text-gray-500">总盈亏</div>
              </div>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">暂无历史记录</p>
            <p className="text-sm mt-1">结算房间后会在这里显示</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => {
              const isExpanded = expandedId === record.id
              // Sort by balance descending
              const sortedResults = [...record.player_results].sort((a, b) => b.balance - a.balance)
              const myResult = getMyResult(record)
              const isWin = myResult && myResult.balance > 0
              const isLoss = myResult && myResult.balance < 0

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  {/* Header - clickable */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(record.settled_at)}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">房：{record.room_code}</span>
                      {myResult && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${
                          isWin
                            ? 'bg-green-100 text-green-700'
                            : isLoss
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isWin ? '赢' : isLoss ? '输' : '平'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {myResult && (
                        <span className={`font-num font-semibold ${
                          isWin
                            ? 'text-green-600'
                            : isLoss
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {myResult.balance > 0 ? '+' : ''}{formatAmount(myResult.balance)}
                        </span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="pt-3 space-y-2">
                        {sortedResults.map((player, idx) => {
                          const isMe = user && player.user_id === user.id
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                isMe
                                  ? 'bg-emerald-50 ring-1 ring-emerald-200'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{player.emoji}</span>
                                <span className={`font-medium ${isMe ? 'text-emerald-900' : 'text-gray-900'}`}>
                                  {player.name}
                                  {isMe && <span className="ml-1 text-xs text-emerald-600">(我)</span>}
                                </span>
                              </div>
                              <span className={`font-num font-semibold ${
                                player.balance > 0
                                  ? 'text-green-600'
                                  : player.balance < 0
                                  ? 'text-red-600'
                                  : 'text-gray-400'
                              }`}>
                                {player.balance > 0 ? '+' : ''}{formatAmount(player.balance)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
