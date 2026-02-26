'use client'

import { useState, useEffect, useCallback } from 'react'
import { memorySystem } from '../lib/memory'
import { useAuth } from './useAuth'

export function useMemory() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    const userProfile = await memorySystem.getProfile(user.id)
    setProfile(userProfile)
    setLoading(false)
  }

  const remember = useCallback(async (key: string, value: any, type: 'fact' | 'preference' = 'fact') => {
    if (!user) return
    await memorySystem.remember(user.id, type, key, value)
  }, [user])

  const recall = useCallback(async (key: string) => {
    if (!user) return null
    return await memorySystem.recall(user.id, key)
  }, [user])

  const forget = useCallback(async (key: string) => {
    if (!user) return
    await memorySystem.forget(user.id, key)
  }, [user])

  const search = useCallback(async (query: string, type?: string) => {
    if (!user) return []
    return await memorySystem.search(user.id, query, type as any)
  }, [user])

  const learnFromInteraction = useCallback(async (
    userMessage: string,
    assistantResponse: string,
    feedback?: 'positive' | 'negative'
  ) => {
    if (!user) return
    await memorySystem.learnFromInteraction(user.id, userMessage, assistantResponse, feedback)
  }, [user])

  const updateProfile = useCallback(async (updates: any) => {
    if (!user) return
    await memorySystem.updateProfile(user.id, updates)
    await loadProfile()
  }, [user])

  return {
    profile,
    loading,
    remember,
    recall,
    forget,
    search,
    learnFromInteraction,
    updateProfile
  }
}
