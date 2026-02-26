import { supabase } from './supabase'
import { ShareLink, Collaborator, Comment, ShareSettings, SharePermission } from '../types/share'

class ShareSystem {
  // ========== ایجاد لینک اشتراک ==========
  async createShareLink(
    sessionId: string,
    userId: string,
    permission: SharePermission = 'view',
    options?: {
      expiresIn?: number // ساعت
      password?: string
      settings?: ShareSettings
    }
  ): Promise<ShareLink> {
    const linkId = this.generateLinkId()
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/share/${linkId}`

    const { data, error } = await supabase
      .from('share_links')
      .insert({
        id: linkId,
        session_id: sessionId,
        created_by: userId,
        link,
        permission,
        password: options?.password,
        expires_at: options?.expiresIn 
          ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000) 
          : null,
        settings: options?.settings || {
          allowComments: true,
          allowCopy: true,
          allowDownload: false,
          showSources: true
        },
        views: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating share link:', error)
      throw error
    }

    return data
  }

  // ========== دریافت اطلاعات لینک ==========
  async getShareLink(linkId: string): Promise<ShareLink | null> {
    const { data, error } = await supabase
      .from('share_links')
      .select('*')
      .eq('id', linkId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error getting share link:', error)
      throw error
    }

    // افزایش تعداد بازدید
    await supabase
      .from('share_links')
      .update({ views: data.views + 1 })
      .eq('id', linkId)

    return data
  }

  // ========== بررسی اعتبار لینک ==========
  async validateShareLink(linkId: string, password?: string): Promise<{
    valid: boolean
    sessionId?: string
    permission?: SharePermission
    settings?: ShareSettings
    error?: string
  }> {
    const link = await this.getShareLink(linkId)

    if (!link) {
      return { valid: false, error: 'لینک یافت نشد' }
    }

    // بررسی انقضا
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { valid: false, error: 'لینک منقضی شده است' }
    }

    // بررسی رمز عبور
    if (link.password && link.password !== password) {
      return { valid: false, error: 'رمز عبور اشتباه است' }
    }

    return {
      valid: true,
      sessionId: link.sessionId,
      permission: link.permission,
      settings: link.settings as ShareSettings
    }
  }

  // ========== مدیریت همکاران ==========
  async addCollaborator(
    sessionId: string,
    email: string,
    permission: SharePermission = 'view'
  ): Promise<Collaborator> {
    // دریافت اطلاعات کاربر از طریق ایمیل
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (!user) {
      throw new Error('کاربری با این ایمیل یافت نشد')
    }

    const { data, error } = await supabase
      .from('collaborators')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        email: user.email,
        name: user.full_name,
        permission,
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding collaborator:', error)
      throw error
    }

    return data
  }

  // ========== دریافت لیست همکاران ==========
  async getCollaborators(sessionId: string): Promise<Collaborator[]> {
    const { data, error } = await supabase
      .from('collaborators')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error getting collaborators:', error)
      return []
    }

    return data
  }

  // ========== حذف همکار ==========
  async removeCollaborator(sessionId: string, userId: string) {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing collaborator:', error)
      throw error
    }
  }

  // ========== به‌روزرسانی دسترسی ==========
  async updatePermission(sessionId: string, userId: string, permission: SharePermission) {
    const { error } = await supabase
      .from('collaborators')
      .update({ permission })
      .eq('session_id', sessionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating permission:', error)
      throw error
    }
  }

  // ========== مدیریت نظرات ==========
  async addComment(
    messageId: string,
    userId: string,
    userName: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        message_id: messageId,
        user_id: userId,
        user_name: userName,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding comment:', error)
      throw error
    }

    return data
  }

  // ========== دریافت نظرات یک پیام ==========
  async getComments(messageId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('message_id', messageId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error getting comments:', error)
      return []
    }

    // دریافت پاسخ‌ها برای هر نظر
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const replies = await this.getReplies(comment.id)
        return { ...comment, replies }
      })
    )

    return commentsWithReplies
  }

  // ========== دریافت پاسخ‌های یک نظر ==========
  async getReplies(commentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error getting replies:', error)
      return []
    }

    return data
  }

  // ========== حذف نظر ==========
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // ========== ویرایش نظر ==========
  async updateComment(commentId: string, content: string) {
    const { error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)

    if (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  // ========== تولید شناسه یکتا ==========
  private generateLinkId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // ========== آپدیت آخرین فعالیت همکار ==========
  async updateLastActive(sessionId: string, userId: string) {
    await supabase
      .from('collaborators')
      .update({ last_active: new Date().toISOString() })
      .eq('session_id', sessionId)
      .eq('user_id', userId)
  }
}

export const shareSystem = new ShareSystem()
