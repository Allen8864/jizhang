'use client'

interface AvatarProps {
  emoji?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ emoji = '😀', size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center bg-gray-100`}
    >
      <span className={emojiSizes[size]}>{emoji}</span>
    </div>
  )
}
