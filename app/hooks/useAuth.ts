'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types'
import { getUserProfile, updateUserProfile } from '../lib/database'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // دریافت کاربر اولیه
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadProfile(user.id)
      } else {
        setLoading(false)
      }
    })

    // شنونده تغییرات وضعیت احراز هویت
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    setLoading(true)
    const userProfile = await getUserProfile(userId)
    setProfile(userProfile)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    await updateUserProfile(user.id, updates)
    await loadProfile(user.id)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    profile,
    loading,
    updateProfile,
    signOut
  }
}
