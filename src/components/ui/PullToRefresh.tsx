'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

const PULL_THRESHOLD = 60
const MAX_PULL = 100

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const isPullingRef = useRef(false)
  const pullDistanceRef = useRef(0)

  // Sync pullDistance to ref for use in event handlers
  useEffect(() => {
    pullDistanceRef.current = pullDistance
  }, [pullDistance])

  // Prevent browser's native pull-to-refresh - attach to document.body
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let lastY = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return

      lastY = e.touches[0].clientY
      startYRef.current = lastY

      // Only enable pulling if we're at the top
      if (container.scrollTop <= 0) {
        isPullingRef.current = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      currentYRef.current = currentY

      // Check if we're pulling down from the top
      if (isPullingRef.current && container.scrollTop <= 0) {
        const diff = currentY - startYRef.current

        if (diff > 0) {
          // We're pulling down at the top - prevent native behavior
          e.preventDefault()
          e.stopPropagation()

          // Apply resistance
          const distance = Math.min(diff * 0.5, MAX_PULL)
          setPullDistance(distance)
        }
      }

      lastY = currentY
    }

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return
      isPullingRef.current = false

      const currentPullDistance = pullDistanceRef.current

      if (currentPullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true)
        setPullDistance(PULL_THRESHOLD)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    // Use passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Also add to document body to catch events that bubble up
    const preventBodyPull = (e: TouchEvent) => {
      if (isPullingRef.current && pullDistanceRef.current > 0) {
        e.preventDefault()
      }
    }
    document.body.addEventListener('touchmove', preventBodyPull, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      document.body.removeEventListener('touchmove', preventBodyPull)
    }
  }, [isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)
  const shouldTrigger = pullDistance >= PULL_THRESHOLD

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden"
        style={{
          height: pullDistance,
          top: 0,
          transition: isPullingRef.current ? 'none' : 'height 0.2s ease-out'
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{ opacity: progress }}
        >
          <div
            className={`flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 180}deg)`,
            }}
          >
            {isRefreshing ? (
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg
                className={`w-4 h-4 transition-colors ${shouldTrigger ? 'text-emerald-500' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
          <span className={`text-xs ${shouldTrigger || isRefreshing ? 'text-emerald-500' : 'text-gray-400'}`}>
            {isRefreshing ? '刷新中...' : shouldTrigger ? '松开刷新' : '下拉刷新'}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 && !isRefreshing ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  )
}
