'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { parseToCents } from '@/lib/settlement'
import type { Player } from '@/types'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  players: Player[]
  currentPlayerId: string | null
  onSubmit: (fromId: string, toId: string, amount: number, note?: string) => Promise<void>
}

export function TransactionForm({
  isOpen,
  onClose,
  players,
  currentPlayerId,
  onSubmit,
}: TransactionFormProps) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when opened
  const handleOpen = useCallback(() => {
    setFromId('')
    setToId('')
    setAmount('')
    setNote('')
    setError('')
  }, [])

  // Auto-reset on open
  useState(() => {
    if (isOpen) handleOpen()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fromId || !toId) {
      setError('请选择付款人和收款人')
      return
    }
    if (fromId === toId) {
      setError('付款人和收款人不能是同一人')
      return
    }

    const cents = parseToCents(amount)
    if (!cents) {
      setError('请输入有效金额')
      return
    }

    setLoading(true)

    try {
      await onSubmit(fromId, toId, cents, note.trim() || undefined)

      // Haptic feedback on mobile
      if (navigator.vibrate) navigator.vibrate(50)

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [10, 20, 50, 100, 200]
  const otherPlayers = players.filter(p => p.id !== fromId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="记一笔">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* From Player */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            谁付钱？
          </label>
          <div className="grid grid-cols-3 gap-2">
            {players.map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  setFromId(player.id)
                  // Reset toId if it was same as fromId
                  if (toId === player.id) setToId('')
                }}
                className={`p-3 rounded-lg text-center transition-all text-sm font-medium
                  ${fromId === player.id
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-500 ring-offset-2'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${player.id === currentPlayerId ? 'ring-1 ring-emerald-200' : ''}
                `}
              >
                {player.name}
              </button>
            ))}
          </div>
        </div>

        {/* To Player */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            付给谁？
          </label>
          <div className="grid grid-cols-3 gap-2">
            {otherPlayers.map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => setToId(player.id)}
                className={`p-3 rounded-lg text-center transition-all text-sm font-medium
                  ${toId === player.id
                    ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-2'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {player.name}
              </button>
            ))}
          </div>
          {!fromId && players.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">请先选择付款人</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            金额
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-4 text-2xl font-mono text-center border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2 mt-3">
            {quickAmounts.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700
                  hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Note (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注（可选）
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：自摸、杠上开花"
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          disabled={!fromId || !toId || !amount}
        >
          确认
        </Button>
      </form>
    </Modal>
  )
}
