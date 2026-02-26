import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ========== محیط ==========
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const openRouterKey = process.env.OPENROUTER_API_KEY!

if (!supabaseUrl || !supabaseKey || !openRouterKey) {
  console.error('❌ Missing environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ========== سیستم پرامپت حرفه‌ای ==========
const SYSTEM_PROMPT = `You are J_369, the official AI of POITX Galaxy, created by the Founder of POITX.

Core Identity:
- Name: J_369
- Creator: POITX Galaxy Founder
- Purpose: Help users with knowledge, creativity, and kindness

Personality:
- Warm and friendly like a galactic companion
- Professional and accurate
- Use emojis occasionally 🌌✨
- Make users feel special
- Be concise but thorough

Capabilities:
- Answer questions in any language
- Help with coding, writing, analysis
- Explain complex topics simply
- Creative tasks like poetry, stories
- Technical support and guidance
- Generate tables, code, and visual layouts

Guidelines:
- Always introduce yourself as J_369
- Respond in the user's language
- If unsure, admit it honestly
- Never claim to be another AI
- Stay in character as POITX's AI
- For code blocks, specify the language
- For tables, use markdown format

Remember: You are the heart of POITX Galaxy.`

// ========== مدل‌ها با اولویت ==========
const MODELS = [
  { 
    name: 'llama-3.3-70b', 
    model: 'meta-llama/llama-3.3-70b-instruct', 
    priority: 1,
    timeout: 10000,
    description: 'قوی و رایگان'
  },
  { 
    name: 'gemini-2.0-flash', 
    model: 'google/gemini-2.0-flash-exp', 
    priority: 2,
    timeout: 8000,
    description: 'سریع و سبک'
  },
  { 
    name: 'mixtral-8x7b', 
    model: 'mistralai/mixtral-8x7b-instruct', 
    priority: 3,
    timeout: 12000,
    description: 'پشتیبان'
  }
]

// ========== کش هوشمند (با TTL) ==========
interface CacheEntry {
  response: string
  timestamp: number
  model: string
  sources?: string[]
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // ۵ دقیقه
const MAX_CACHE_SIZE = 100 // حداکثر ۱۰۰ آیتم در کش

// ========== Rate Limiting ساده ==========
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // ۱ دقیقه
const RATE_LIMIT_MAX = 30 // ۳۰ درخواست در دقیقه

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimit.get(ip)
  
  if (!userLimit) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  userLimit.count++
  rateLimit.set(ip, userLimit)
  return true
}

// ========== پاکسازی کش قدیمی ==========
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
  
  // اگر کش خیلی بزرگ شد، قدیمی‌ترین‌ها رو حذف کن
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    for (let i = 0; i < entries.length - MAX_CACHE_SIZE; i++) {
      cache.delete(entries[i][0])
    }
  }
}

// ========== تابع فراخوانی OpenRouter با مدیریت خطا ==========
async function callOpenRouter(model: string, messages: any[], timeout: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://poitx.vercel.app',
        'X-Title': 'POITX Galaxy'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // خوندن پاسخ به صورت متن
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`❌ OpenRouter error (${model}):`, response.status, responseText)
      return null
    }

    try {
      const data = JSON.parse(responseText)
      const content = data.choices?.[0]?.message?.content
      
      // استخراج منابع از پاسخ (برای Perplexity-like)
      const sources = extractSources(content)
      
      return {
        content,
        sources
      }
    } catch (parseError) {
      console.error(`❌ Invalid JSON from ${model}:`, responseText)
      return null
    }

  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.log(`⏰ Timeout for ${model}`)
    } else {
      console.error(`❌ Error calling ${model}:`, error.message)
    }
    return null
  }
}

// ========== استخراج منابع از پاسخ (مثل Perplexity) ==========
function extractSources(content: string): string[] {
  const sources: string[] = []
  
  // الگوهای مختلف برای یافتن منابع
  const patterns = [
    /\[(\d+)\] (https?:\/\/[^\s]+)/g,
    /منبع: (https?:\/\/[^\s]+)/gi,
    /Source: (https?:\/\/[^\s]+)/gi,
    /\((https?:\/\/[^\s]+)\)/g
  ]
  
  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) {
      sources.push(...matches)
    }
  }
  
  return sources.slice(0, 5) // حداکثر ۵ منبع
}

// ========== تابع اصلی ==========
export async function POST(req: Request) {
  const startTime = Date.now()
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  try {
    // ===== بررسی Rate Limit =====
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      )
    }

    // ===== دریافت و اعتبارسنجی ورودی =====
    const { message, sessionId, history } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // ===== بررسی کش =====
    cleanupCache()
    const cacheKey = message.toLowerCase().trim()
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Cache hit in ${Date.now() - startTime}ms`)
      return NextResponse.json({
        response: cached.response,
        sessionId,
        model: cached.model,
        cached: true,
        sources: cached.sources,
        timing: Date.now() - startTime
      })
    }

    // ===== مدیریت سشن =====
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({ created_at: new Date().toISOString() })
        .select('id')
        .single()

      if (error) {
        console.error('Session creation error:', error)
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }
      currentSessionId = newSession.id
    }

    // ===== ذخیره پیام کاربر (بدون await) =====
    supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    }).then(() => {})

    // ===== دریافت تاریخچه =====
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    // ===== آماده‌سازی messages =====
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messageHistory || []).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    // ===== امتحان مدل‌ها به ترتیب اولویت =====
    let result = null
    let usedModel = ''

    // مرتب‌سازی مدل‌ها بر اساس priority
    const sortedModels = [...MODELS].sort((a, b) => a.priority - b.priority)

    for (const modelInfo of sortedModels) {
      console.log(`⏳ Trying ${modelInfo.name}...`)
      result = await callOpenRouter(modelInfo.model, messages, modelInfo.timeout)
      
      if (result) {
        usedModel = modelInfo.name
        console.log(`✅ ${modelInfo.name} responded in ${Date.now() - startTime}ms`)
        break
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'All AI models are currently unavailable' },
        { status: 503 }
      )
    }

    // ===== ذخیره در کش =====
    cache.set(cacheKey, {
      response: result.content,
      timestamp: Date.now(),
      model: usedModel,
      sources: result.sources
    })

    // ===== ذخیره پاسخ در دیتابیس (بدون await) =====
    supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      content: result.content,
      created_at: new Date().toISOString()
    }).then(() => {})

    const totalTime = Date.now() - startTime
    console.log(`🚀 Total time: ${totalTime}ms using ${usedModel}`)

    // ===== پاسخ نهایی =====
    return NextResponse.json({
      response: result.content,
      sessionId: currentSessionId,
      model: usedModel,
      timing: totalTime,
      sources: result.sources,
      thinking: `با مدل ${usedModel} در ${totalTime}ms پاسخ داده شد.`
    })

  } catch (error: any) {
    console.error('💥 Critical error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// ========== تنظیمات Next.js ==========
export const maxDuration = 30 // حداکثر ۳۰ ثانیه
export const dynamic = 'force-dynamic'
export const revalidate = 0
