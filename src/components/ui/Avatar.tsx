'use client'

interface AvatarProps {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

// Check if a string is an emoji (not a hex color)
function isEmoji(str: string): boolean {
  // Hex colors start with # and have 4 or 7 characters
  if (str.startsWith('#') && (str.length === 4 || str.length === 7)) {
    return false
  }
  return true
}

export function Avatar({ name, color = '#6366f1', size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
  }

  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const showEmoji = isEmoji(color)

  if (showEmoji) {
    return (
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center bg-gray-100`}
      >
        <span className={emojiSizes[size]}>{color}</span>
      </div>
    )
  }

  // Get first character of name for color-based avatar
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  )
}
