import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const openRouterKey = process.env.OPENROUTER_API_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const SYSTEM_PROMPT = `You are J_369, the official AI of POITX Galaxy. Be friendly, helpful, and concise.`

// مدل‌های سریع (با priority)
const FAST_MODELS = [
  { name: 'gemini-2.0-flash-exp', model: 'google/gemini-2.0-flash-exp' }, // سریع‌ترین
  { name: 'llama-3.1-8b', model: 'meta-llama/llama-3.1-8b-instruct' },    // سبک
  { name: 'mixtral-8x7b', model: 'mistralai/mixtral-8x7b-instruct' }      // پشتیبان
]

async function callFastModel(model: string, messages: any[]) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // ۵ ثانیه تایم‌اوت

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
        max_tokens: 800, // کمتر برای سرعت بیشتر
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    clearTimeout(timeoutId)
    return null
  }
}

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const { message, sessionId } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // اجرای موازی: ذخیره پیام + دریافت پاسخ
    const [reply] = await Promise.all([
      (async () => {
        for (const m of FAST_MODELS) {
          const result = await callFastModel(m.model, [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message }
          ])
          if (result) return result
        }
        return null
      })(),
      
      // ذخیره پیام در پس‌زمینه (بدون await)
      supabase.from('messages').insert({
        session_id: sessionId || 'temp',
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      }).then(() => {})
    ])

    if (!reply) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // ذخیره پاسخ در پس‌زمینه
    supabase.from('messages').insert({
      session_id: sessionId || 'temp',
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString()
    }).then(() => {})

    const responseTime = Date.now() - startTime
    console.log(`✅ Response in ${responseTime}ms`)

    return NextResponse.json({ 
      response: reply,
      sessionId,
      timing: responseTime 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'خطایی رخ داد' },
      { status: 500 }
    )
  }
}

export const maxDuration = 10 // حداکثر ۱۰ ثانیه
export const dynamic = 'force-dynamic'
