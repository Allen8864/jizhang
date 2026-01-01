'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { User, SupabaseClient } from '@supabase/supabase-js'

interface UseSupabaseReturn {
  user: User | null
  loading: boolean
  supabase: SupabaseClient
}

export function useSupabase(): UseSupabaseReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Check existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
        } else {
          // Auto sign in anonymously
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('Anonymous sign in failed:', error)
          } else if (data.user) {
            setUser(data.user)
            // Store user ID in localStorage for reference
            try {
              localStorage.setItem('jizhang_user_id', data.user.id)
            } catch (e) {
              // localStorage might not be available
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading, supabase }
}
