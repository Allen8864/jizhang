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
    <form className="hero-join-form" onSubmit={handleSubmit}>
      <label className="hero-join-label" htmlFor="hero-room-code">
        {label}
      </label>
      <div className="hero-join-row">
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
          className="hero-join-input"
          aria-describedby={error ? 'hero-room-code-error' : undefined}
        />
        <button type="submit" className="hero-join-button">
          {buttonLabel}
        </button>
      </div>
      {error ? (
        <p id="hero-room-code-error" className="hero-join-error">
          {error}
        </p>
      ) : null}
    </form>
  )
}
