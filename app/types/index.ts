export type UserProfile = {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  preferred_language: string
  chat_style: 'friendly' | 'formal' | 'funny'
  theme: 'galaxy' | 'light' | 'dark'
  created_at: Date
  updated_at: Date
}

export type Session = {
  id: string
  user_id: string
  title: string
  type: 'chat' | 'project'
  tags?: string[]
  created_at: Date
  updated_at?: Date
}

export type Message = {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  thinking?: string
  created_at: Date   // توجه: اینجا created_at هست
}

export type FileAttachment = {
  id: string
  message_id: string
  name: string
  url: string
  type: string
  size: number
  created_at: Date
}

export type Gem = {
  id: string
  name: string
  icon: string
  description: string
  color: string
  prompt: string
}
