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

// ========== سیستم پرامپت ==========
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

Guidelines:
- Always introduce yourself as J_369
- Respond in the user's language
- If unsure, admit it honestly
- Never claim to be another AI
- Stay in character as POITX's AI

If search results are provided, use them to give accurate and up-to-date information.
If no search results are provided, use your general knowledge.`

// ========== مدل‌ها ==========
const MODELS = [
  { name: 'gemini-2.0-flash', model: 'google/gemini-2.0-flash-exp', timeout: 8000 },
  { name: 'llama-3.3-70b', model: 'meta-llama/llama-3.3-70b-instruct', timeout: 10000 },
  { name: 'mixtral-8x7b', model: 'mistralai/mixtral-8x7b-instruct', timeout: 12000 }
]

// ========== کش ==========
const cache = new Map<string, { response: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

// ========== تابع فراخوانی OpenRouter ==========
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
        top_p: 0.95
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`❌ OpenRouter error (${model}):`, response.status, responseText)
      return null
    }

    try {
      const data = JSON.parse(responseText)
      return data.choices?.[0]?.message?.content || null
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

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const { message, sessionId, history, searchResults, needsSearch } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
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

    // ===== ذخیره پیام کاربر =====
    supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    }).then(() => {})

    // ===== بررسی کش =====
    const cacheKey = message.toLowerCase().trim()
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && !needsSearch) {
      return NextResponse.json({
        response: cached.response,
        sessionId: currentSessionId,
        cached: true,
        timing: Date.now() - startTime
      })
    }

    // ===== آماده‌سازی messages =====
    let userMessage = message
    
    // اگه جستجو شده، اطلاعات رو به پیام اضافه کن
    if (searchResults && searchResults.length > 0) {
      const searchContext = searchResults.map((r: any, i: number) => 
        `[منبع ${i+1}] ${r.title}\n${r.snippet}\nلینک: ${r.link}`
      ).join('\n\n')
      
      userMessage = `سوال کاربر: ${message}\n\nنتایج جستجو:\n${searchContext}\n\nبا استفاده از این اطلاعات، به سوال کاربر پاسخ بده.`
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).slice(-5).map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ]

    // ===== امتحان مدل‌ها =====
    let reply = null
    let usedModel = ''

    for (const m of MODELS) {
      reply = await callOpenRouter(m.model, messages, m.timeout)
      if (reply) {
        usedModel = m.name
        break
      }
    }

    if (!reply) {
      return NextResponse.json(
        { error: 'All models failed' },
        { status: 503 }
      )
    }

    // ===== ذخیره در کش =====
    if (!needsSearch) {
      cache.set(cacheKey, { response: reply, timestamp: Date.now() })
    }

    // ===== ذخیره پاسخ =====
    supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString()
    }).then(() => {})

    return NextResponse.json({
      response: reply,
      sessionId: currentSessionId,
      model: usedModel,
      timing: Date.now() - startTime,
      searched: !!searchResults
    })

  } catch (error: any) {
    console.error('💥 Critical error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
