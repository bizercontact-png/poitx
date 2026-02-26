import { supabase } from './supabase'
import { Message, Session, UserProfile, FileAttachment } from '../types'

// ========== مدیریت پروفایل کاربر ==========
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// ========== مدیریت سشن‌ها (مکالمات) ==========
export async function createSession(userId: string, title: string, type: 'chat' | 'project' = 'chat'): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      title,
      type,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return null
  }

  return data
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data || []
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export async function saveMessage(message: {
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  thinking?: string
}) {
  const { error } = await supabase
    .from('messages')
    .insert({
      session_id: message.sessionId,
      role: message.role,
      content: message.content,
      sources: message.sources || [],
      thinking: message.thinking || null,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

export async function deleteSession(sessionId: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('Error deleting session:', error)
    throw error
  }
}

export async function updateSessionTitle(sessionId: string, title: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ title })
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session title:', error)
    throw error
  }
}

// ========== مدیریت فایل‌ها ==========
export async function saveFileAttachment(file: {
  messageId: string
  name: string
  url: string
  type: string
  size: number
}) {
  const { error } = await supabase
    .from('files')
    .insert({
      message_id: file.messageId,
      name: file.name,
      url: file.url,
      type: file.type,
      size: file.size,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving file:', error)
    throw error
  }
}

export async function getMessageFiles(messageId: string): Promise<FileAttachment[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching files:', error)
    return []
  }

  return data || []
}
