'use client'

interface AvatarProps {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, color = '#6366f1', size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  }

  // Get first character of name
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
