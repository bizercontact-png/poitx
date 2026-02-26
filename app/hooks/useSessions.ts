'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Session, Message } from '../types'
import { getUserSessions, getSessionMessages, createSession, deleteSession, updateSessionTitle, saveMessage } from '../lib/database'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // دریافت کاربر فعلی
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  // لود سشن‌های کاربر
  useEffect(() => {
    if (!user) return

    const loadSessions = async () => {
      setLoading(true)
      const userSessions = await getUserSessions(user.id)
      setSessions(userSessions)
      setLoading(false)
    }

    loadSessions()
  }, [user])

  // لود پیام‌های سشن جاری
  useEffect(() => {
    if (!currentSessionId) return

    const loadMessages = async () => {
      setLoading(true)
      const sessionMessages = await getSessionMessages(currentSessionId)
      setMessages(sessionMessages)
      setLoading(false)
    }

    loadMessages()
  }, [currentSessionId])

  const createNewSession = useCallback(async (type: 'chat' | 'project' = 'chat') => {
    if (!user) return null

    const title = `${type === 'project' ? '🚀' : '💬'} ${new Date().toLocaleString('fa-IR')}`
    const newSession = await createSession(user.id, title, type)
    
    if (newSession) {
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
      setMessages([])
    }

    return newSession
  }, [user])

  const loadSession = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])

  const deleteCurrentSession = useCallback(async (sessionId: string) => {
    await deleteSession(sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
      setMessages([])
    }
  }, [currentSessionId])

  const addMessage = useCallback(async (message: Omit<Message, 'id' | 'created_at'>) => {
    if (!currentSessionId) return

    await saveMessage(message)
    
    // آپدیت عنوان سشن با اولین پیام کاربر
    if (message.role === 'user' && messages.length === 0) {
      const title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
      await updateSessionTitle(currentSessionId, title)
      
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, title } : s
      ))
    }

    // آپدیت لیست پیام‌ها
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      created_at: new Date()
    } as Message

    setMessages(prev => [...prev, newMessage])
  }, [currentSessionId, messages.length])

  return {
    sessions,
    currentSessionId,
    messages,
    loading,
    createNewSession,
    loadSession,
    deleteSession: deleteCurrentSession,
    addMessage,
    user
  }
}
