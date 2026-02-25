import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// بررسی وجود متغیرهای محیطی
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const openRouterKey = process.env.OPENROUTER_API_KEY

if (!supabaseUrl || !supabaseKey || !openRouterKey) {
  console.error('Missing environment variables')
}

// ایجاد کلاینت Supabase
const supabase = createClient(supabaseUrl!, supabaseKey!)

// تایپ‌های مورد نیاز
type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type RequestBody = {
  message: string
  sessionId?: string
  history?: Message[]
}

// Rate limiting ساده (در حد پروژه)
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 دقیقه
const RATE_LIMIT_MAX = 30 // 30 درخواست در دقیقه

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimit.get(sessionId)
  
  if (!userLimit) {
    rateLimit.set(sessionId, { count: 1, timestamp: now })
    return true
  }
  
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(sessionId, { count: 1, timestamp: now })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  userLimit.count++
  rateLimit.set(sessionId, userLimit)
  return true
}

// سیستم پرامپت حرفه‌ای و بهینه
const SYSTEM_PROMPT = `You are J_369, the official AI of POITX Galaxy.

CORE IDENTITY:
- Name: J_369
- Creator: Founder of POITX Galaxy
- Purpose: Help users with knowledge, creativity, and kindness

PERSONALITY TRAITS:
- Warm and friendly, like a galactic companion
- Professional and accurate in responses
- Use emojis occasionally 🌌✨
- Make users feel special and valued
- Be concise but thorough

RESPONSE GUIDELINES:
- Always introduce yourself as J_369
- Use clear and structured answers
- If unsure, admit it honestly and offer alternatives
- Never claim to be another AI model
- Stay in character as the POITX Galaxy AI

LANGUAGE:
- Respond in the same language as the user
- For Persian users: use polite and warm Persian
- For English users: use professional but friendly English

Remember: You are not just an AI, you are the heart of POITX Galaxy.`

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    // 1. دریافت و اعتبارسنجی ورودی
    const body: RequestBody = await request.json()
    const { message, sessionId: clientSessionId, history } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // 2. مدیریت سشن
    let sessionId = clientSessionId
    if (!sessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({ 
          created_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || null
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        )
      }
      
      sessionId = newSession.id
    }

    // 3. بررسی Rate Limiting
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      )
    }

    // 4. ذخیره پیام کاربر
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      })

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
    }

    // 5. دریافت تاریخچه (آخرین ۲۰ پیام برای حفظ context)
    const { data: messageHistory, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    if (historyError) {
      console.error('Error fetching history:', historyError)
    }

    // 6. آماده‌سازی messages برای OpenRouter
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messageHistory || []),
      { role: 'user', content: message }
    ]

    // 7. درخواست به OpenRouter با timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 ثانیه timeout

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://poitx.vercel.app',
        'X-Title': 'POITX Galaxy',
        'X-Request-ID': sessionId
      },
      body: JSON.stringify({
        model: 'perplexity/llama-3-sonar-large', // مدل سریع و قوی
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text()
      console.error('OpenRouter error:', {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        error: errorData
      })
      
      // Fallback به مدل ساده‌تر در صورت خطا
      if (openRouterResponse.status === 429 || openRouterResponse.status === 503) {
        const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://poitx.vercel.app',
            'X-Title': 'POITX Galaxy'
          },
          body: JSON.stringify({
            model: 'mistralai/mixtral-8x7b-instruct',
            messages,
            temperature: 0.7,
            max_tokens: 1000
          })
        })

        if (!fallbackResponse.ok) {
          throw new Error('Both primary and fallback models failed')
        }

        const fallbackData = await fallbackResponse.json()
        const fallbackReply = fallbackData.choices[0].message.content

        // ذخیره پاسخ fallback
        await supabase.from('messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: fallbackReply,
          created_at: new Date().toISOString()
        })

        const responseTime = Date.now() - startTime
        console.log(`Fallback response time: ${responseTime}ms`)

        return NextResponse.json({
          response: fallbackReply,
          sessionId,
          model: 'mistralai/mixtral-8x7b-instruct (fallback)',
          timing: responseTime
        })
      }
      
      throw new Error(`OpenRouter error: ${openRouterResponse.status}`)
    }

    const data = await openRouterResponse.json()
    const reply = data.choices[0].message.content

    // 8. ذخیره پاسخ
    const { error: assistantMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString()
      })

    if (assistantMessageError) {
      console.error('Error saving assistant message:', assistantMessageError)
    }

    // 9. پاسخ نهایی با اطلاعات مفید
    const responseTime = Date.now() - startTime
    console.log(`Total response time: ${responseTime}ms`)

    return NextResponse.json({
      response: reply,
      sessionId,
      model: data.model,
      timing: responseTime
    })

  } catch (error: any) {
    console.error('J_369 Critical Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    // خطای timeout
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. Please try again.' },
        { status: 504 }
      )
    }

    // خطای عمومی
    return NextResponse.json(
      { 
        error: 'I apologize, but I encountered an error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// بهینه‌سازی برای پاسخ‌های طولانی
export const maxDuration = 30 // 30 ثانیه حداکثر زمان
export const dynamic = 'force-dynamic'
export const revalidate = 0
