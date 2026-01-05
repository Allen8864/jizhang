'use client'

import { useState, useEffect } from 'react'
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

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
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
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-gray-900">{record.room_code}</span>
                      <span className="text-xs text-gray-400">{formatTime(record.settled_at)}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="pt-3 space-y-2">
                        {sortedResults.map((player, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span>{player.emoji}</span>
                              <span className="font-medium text-gray-900">{player.name}</span>
                            </div>
                            <span className={`font-mono font-semibold ${
                              player.balance > 0
                                ? 'text-green-600'
                                : player.balance < 0
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }`}>
                              {player.balance > 0 ? '+' : ''}{formatAmount(player.balance)}
                            </span>
                          </div>
                        ))}
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
