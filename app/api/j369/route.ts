import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ========== تنظیمات اولیه ==========
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const openRouterKey = process.env.OPENROUTER_API_KEY!

if (!supabaseUrl || !supabaseKey || !openRouterKey) {
  console.error('❌ Missing environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ========== سیستم پرامپت بهینه ==========
const SYSTEM_PROMPT = `You are J_369, the AI of POITX Galaxy. 
Be friendly, helpful, and concise. Respond in the user's language.
Always introduce yourself as J_369.`

// ========== مدل‌های سریع (به ترتیب اولویت) ==========
const MODELS = [
  { name: 'gemini-2.0-flash', model: 'google/gemini-2.0-flash-exp', timeout: 4000 },
  { name: 'llama-3.1-8b', model: 'meta-llama/llama-3.1-8b-instruct', timeout: 5000 },
  { name: 'mixtral-8x7b', model: 'mistralai/mixtral-8x7b-instruct', timeout: 6000 }
]

// ========== کش ساده در حافظه (برای سرعت بیشتر) ==========
const cache = new Map<string, { response: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // ۵ دقیقه

// ========== تابع کمکی برای فراخوانی OpenRouter ==========
async function callModel(model: string, messages: any[], timeout: number) {
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
        max_tokens: 500,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`❌ Model ${model} failed:`, response.status)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null

  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.log(`⏰ Timeout for ${model}`)
    }
    return null
  }
}

// ========== API اصلی ==========
export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const { message, sessionId } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // ========== چک کردن کش ==========
    const cacheKey = message.toLowerCase().trim()
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Cache hit in ${Date.now() - startTime}ms`)
      return NextResponse.json({
        response: cached.response,
        sessionId,
        cached: true
      })
    }

    // ========== امتحان مدل‌ها به صورت موازی ==========
    let reply = null
    let usedModel = ''

    for (const m of MODELS) {
      console.log(`⏳ Trying ${m.name}...`)
      reply = await callModel(m.model, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ], m.timeout)

      if (reply) {
        usedModel = m.name
        console.log(`✅ ${m.name} responded in ${Date.now() - startTime}ms`)
        break
      }
    }

    if (!reply) {
      return NextResponse.json(
        { error: 'All models failed' },
        { status: 503 }
      )
    }

    // ========== ذخیره در کش ==========
    cache.set(cacheKey, { response: reply, timestamp: Date.now() })

    // ========== ذخیره در دیتابیس (در پس‌زمینه) ==========
    if (sessionId) {
      Promise.all([
        supabase.from('messages').insert({
          session_id: sessionId,
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        }),
        supabase.from('messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: reply,
          created_at: new Date().toISOString()
        })
      ]).catch(err => console.error('DB error:', err))
    }

    const totalTime = Date.now() - startTime
    console.log(`🚀 Total time: ${totalTime}ms`)

    return NextResponse.json({
      response: reply,
      sessionId,
      model: usedModel,
      time: totalTime
    })

  } catch (error: any) {
    console.error('💥 Critical error:', error)
    return NextResponse.json(
      { error: 'خطایی رخ داد' },
      { status: 500 }
    )
  }
}

// ========== تنظیمات Next.js ==========
export const maxDuration = 10
export const dynamic = 'force-dynamic'
