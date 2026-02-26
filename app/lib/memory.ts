import { supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'

type MemoryItem = {
  id: string
  userId: string
  type: 'fact' | 'preference' | 'interaction' | 'feedback'
  key: string
  value: any
  confidence: number // 0-1
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
}

type UserProfile = {
  userId: string
  name?: string
  preferences: Record<string, any>
  topics: string[] // موضوعات مورد علاقه
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  language: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

class MemorySystem {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // ۵ دقیقه

  // ========== ذخیره اطلاعات ==========
  async remember(
    userId: string,
    type: MemoryItem['type'],
    key: string,
    value: any,
    confidence: number = 1.0
  ) {
    const { data, error } = await supabase
      .from('memories')
      .upsert({
        user_id: userId,
        type,
        key,
        value,
        confidence,
        updated_at: new Date().toISOString(),
        last_accessed: new Date().toISOString()
      }, {
        onConflict: 'user_id,key'
      })

    if (error) {
      console.error('Error saving memory:', error)
      throw error
    }

    // پاک کردن کش
    this.cache.delete(`${userId}:${key}`)
    
    return data
  }

  // ========== بازیابی اطلاعات ==========
  async recall(userId: string, key: string): Promise<any> {
    const cacheKey = `${userId}:${key}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    const { data, error } = await supabase
      .from('memories')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // not found
      console.error('Error recalling memory:', error)
      return null
    }

    // آپدیت last_accessed
    await supabase
      .from('memories')
      .update({ last_accessed: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('key', key)

    // ذخیره در کش
    this.cache.set(cacheKey, { data: data.value, timestamp: Date.now() })

    return data.value
  }

  // ========== جستجو در حافظه ==========
  async search(userId: string, query: string, type?: MemoryItem['type']): Promise<MemoryItem[]> {
    let dbQuery = supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .textSearch('value', query)

    if (type) {
      dbQuery = dbQuery.eq('type', type)
    }

    const { data, error } = await dbQuery.order('confidence', { ascending: false })

    if (error) {
      console.error('Error searching memories:', error)
      return []
    }

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      type: item.type,
      key: item.key,
      value: item.value,
      confidence: item.confidence,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      lastAccessed: new Date(item.last_accessed)
    }))
  }

  // ========== حذف از حافظه ==========
  async forget(userId: string, key: string) {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('user_id', userId)
      .eq('key', key)

    if (error) {
      console.error('Error forgetting memory:', error)
      throw error
    }

    this.cache.delete(`${userId}:${key}`)
  }

  // ========== به‌روزرسانی پروفایل ==========
  async updateProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    return data
  }

  // ========== دریافت پروفایل ==========
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error getting profile:', error)
      return null
    }

    return {
      userId: data.user_id,
      name: data.name,
      preferences: data.preferences || {},
      topics: data.topics || [],
      tone: data.tone || 'friendly',
      language: data.language || 'fa',
      timezone: data.timezone || 'Asia/Tehran',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  // ========== یادگیری از تعاملات ==========
  async learnFromInteraction(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    feedback?: 'positive' | 'negative'
  ) {
    // استخراج حقایق احتمالی از پیام کاربر
    const facts = await this.extractFacts(userMessage)
    
    for (const fact of facts) {
      await this.remember(userId, 'fact', fact.key, fact.value, 0.7)
    }

    // ذخیره تعامل
    await this.remember(
      userId,
      'interaction',
      `interaction:${Date.now()}`,
      { userMessage, assistantResponse, feedback },
      1.0
    )

    // اگه بازخورد منفی بود، اعتماد به اون حافظه رو کم کن
    if (feedback === 'negative') {
      // اینجا می‌تونی الگوریتم یادگیری داشته باشی
    }
  }

  // ========== استخراج حقایق از متن (با J_369) ==========
  private async extractFacts(text: string): Promise<Array<{ key: string; value: any }>> {
    // اینجا می‌تونی از J_369 برای استخراج حقایق استفاده کنی
    // برای سادگی، یه نمونه ساده برمی‌گردونیم
    const facts = []
    
    // تشخیص نام
    const nameMatch = text.match(/اسم من (\w+)/i)
    if (nameMatch) {
      facts.push({ key: 'user.name', value: nameMatch[1] })
    }

    // تشخیص علایق
    const interestMatch = text.match(/علاقه مند به (\w+)/i)
    if (interestMatch) {
      facts.push({ key: 'user.interests', value: [interestMatch[1]] })
    }

    return facts
  }

  // ========== پاکسازی حافظه‌های قدیمی ==========
  async cleanup(userId: string, olderThan: Date) {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('user_id', userId)
      .lt('last_accessed', olderThan.toISOString())
      .lt('confidence', 0.5) // فقط حافظه‌های با اعتماد کم

    if (error) {
      console.error('Error cleaning up memories:', error)
    }
  }
}

export const memorySystem = new MemorySystem()
