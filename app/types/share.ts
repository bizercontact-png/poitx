export type SharePermission = 'view' | 'comment' | 'edit' | 'admin'

export type ShareLink = {
  id: string
  sessionId: string
  createdBy: string
  link: string
  permission: SharePermission
  expiresAt?: Date
  password?: string
  views: number
  createdAt: Date
}

export type Collaborator = {
  userId: string
  email: string
  name: string
  permission: SharePermission
  joinedAt: Date
  lastActive?: Date
}

export type Comment = {
  id: string
  messageId: string
  userId: string
  userName: string
  content: string
  replies?: Comment[]
  createdAt: Date
  updatedAt?: Date
}

export type ShareSettings = {
  allowComments: boolean
  allowCopy: boolean
  allowDownload: boolean
  showSources: boolean
  watermark?: string
}
