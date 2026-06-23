'use client'

import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n'
import type { Room } from '@/types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room
}

function isWeChatBrowser(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

export function ShareModal({ isOpen, onClose, room }: ShareModalProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/room/${room.code}`
    }
    return ''
  }, [room.code])
  const isWeChat = isWeChatBrowser()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.share.nativeTitle,
          text: t.share.nativeText(room.code),
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    }
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !isWeChat

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.share.title}>
      <div className="space-y-6">
        {/* Room code display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">{t.share.roomCode}</p>
          <div className="text-4xl font-num font-bold text-gray-900 tracking-widest">
            {room.code}
          </div>
        </div>

        {/* QR Code */}
        {shareUrl && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <QRCodeSVG value={shareUrl} size={180} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleCopy}
          >
            {copied ? t.share.copied : t.share.copyLink}
          </Button>

          {canShare && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleShare}
            >
              {t.share.shareFriend}
            </Button>
          )}

          {isWeChat && (
            <p className="text-center text-sm text-gray-500">
              {t.share.wechatHint}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
