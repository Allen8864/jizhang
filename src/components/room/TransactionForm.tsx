'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { parseToCents } from '@/lib/settlement'
import type { Player } from '@/types'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  fromPlayer: Player | null
  toPlayer: Player | null
  onSubmit: (fromId: string, toId: string, amount: number) => Promise<void>
}

export function TransactionForm({
  isOpen,
  onClose,
  fromPlayer,
  toPlayer,
  onSubmit,
}: TransactionFormProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fromPlayer || !toPlayer) {
      setError('请选择付款人和收款人')
      return
    }

    const cents = parseToCents(amount)
    if (!cents) {
      setError('请输入有效金额')
      return
    }

    setLoading(true)

    try {
      await onSubmit(fromPlayer.id, toPlayer.id, cents)

      // Haptic feedback on mobile
      if (navigator.vibrate) navigator.vibrate(50)

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="记录支出">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar section: from -> to */}
        <div className="flex items-center justify-center gap-8 py-2">
          {/* From player avatar */}
          <div className="flex flex-col items-center">
            <Avatar
              emoji={fromPlayer?.avatar_emoji}
              size="lg"
            />
            <span className="mt-1 text-sm text-gray-600 truncate max-w-[60px]">
              {fromPlayer?.name || '我'}
            </span>
          </div>

          {/* Arrow */}
          <div className="flex items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          {/* To player avatar */}
          <div className="flex flex-col items-center">
            <Avatar
              emoji={toPlayer?.avatar_emoji}
              size="lg"
            />
            <span className="mt-1 text-sm text-gray-600 truncate max-w-[60px]">
              {toPlayer?.name || '对方'}
            </span>
          </div>
        </div>

        {/* Amount input */}
        <div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="输入金额"
            className="w-full px-4 py-3 text-center border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          disabled={!amount}
        >
          支出
        </Button>
      </form>
    </Modal>
  )
}
