'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoomCodeJoinFormProps {
  label: string
  placeholder: string
  buttonLabel: string
  errorLabel: string
}

export function RoomCodeJoinForm({
  label,
  placeholder,
  buttonLabel,
  errorLabel,
}: RoomCodeJoinFormProps) {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!/^\d{4}$/.test(roomCode)) {
      setError(errorLabel)
      return
    }

    router.push(`/room/${roomCode}`)
  }

  return (
    <form className="mt-6 w-[min(100%,520px)] max-[620px]:mt-3" onSubmit={handleSubmit}>
      <label
        className="mb-2 block text-[13px] font-extrabold text-[rgba(255,248,234,0.74)]"
        htmlFor="hero-room-code"
      >
        {label}
      </label>
      <div className="flex items-center gap-2 max-[620px]:items-stretch">
        <input
          id="hero-room-code"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]{4}"
          maxLength={4}
          value={roomCode}
          onChange={(event) => {
            setRoomCode(event.target.value.replace(/\D/g, '').slice(0, 4))
            setError('')
          }}
          placeholder={placeholder}
          className="h-12 w-[132px] rounded-lg border border-[rgba(255,248,234,0.26)] bg-[rgba(255,248,234,0.1)] text-center font-mono text-xl font-black leading-none text-[#fffdf6] outline-0 placeholder:text-[rgba(255,248,234,0.34)] focus:border-[#f5b840] max-[620px]:w-28 max-[620px]:basis-28"
          aria-describedby={error ? 'hero-room-code-error' : undefined}
        />
        <button
          type="submit"
          className="min-h-12 rounded-lg border border-[rgba(255,248,234,0.22)] bg-[#fff8ea] px-4 font-black text-[#173b30] motion-safe:transition-transform motion-safe:hover:-translate-y-px max-[620px]:min-w-0 max-[620px]:flex-auto"
        >
          {buttonLabel}
        </button>
      </div>
      {error ? (
        <p id="hero-room-code-error" className="mt-2 text-[13px] font-bold text-red-200">
          {error}
        </p>
      ) : null}
    </form>
  )
}
