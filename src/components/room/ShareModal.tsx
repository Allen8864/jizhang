'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Room } from '@/types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room
}

// 检测是否在微信内置浏览器中
function isWeChatBrowser(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

export function ShareModal({ isOpen, onClose, room }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isWeChat, setIsWeChat] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/room/${room.code}`)
      setIsWeChat(isWeChatBrowser())
    }
  }, [room.code])

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
          title: `加入房间`,
          text: `房间号: ${room.code}`,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    }
  }

  // 微信环境下不显示原生分享按钮（会导致闪退）
  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !isWeChat

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="分享房间">
      <div className="space-y-6">
        {/* Room code display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">房间号</p>
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
            {copied ? '已复制' : '复制链接'}
          </Button>

          {canShare && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleShare}
            >
              分享给好友
            </Button>
          )}

          {isWeChat && (
            <p className="text-center text-sm text-gray-500">
              复制链接后发送给好友即可
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
