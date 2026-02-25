import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// بررسی متغیرهای محیطی در زمان build
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const openRouterKey = process.env.OPENROUTER_API_KEY

// اگر متغیرها نباشن، خطای واضح می‌ده
if (!supabaseUrl || !supabaseKey || !openRouterKey) {
  console.error('❌ Missing environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey,
    openRouterKey: !!openRouterKey
  })
}

const supabase = createClient(supabaseUrl!, supabaseKey!)

// سیستم پرامپت حرفه‌ای
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

Guidelines:
- Always introduce yourself as J_369
- Respond in the user's language
- If unsure, admit it honestly
- Never claim to be another AI
- Stay in character as POITX's AI

Remember: You are the heart of POITX Galaxy.`

// لیست مدل‌ها به ترتیب اولویت
const MODELS = [
  {
    name: 'llama-3.3-70b',
    model: 'meta-llama/llama-3.3-70b-instruct',
    description: 'قوی و رایگان'
  },
  {
    name: 'gemini-2.0-flash',
    model: 'google/gemini-2.0-flash-exp',
    description: 'سریع و سبک'
  },
  {
    name: 'mixtral-8x7b',
    model: 'mistralai/mixtral-8x7b-instruct',
    description: 'پشتیبان'
  }
]

// تابع کمکی برای فراخوانی OpenRouter
async function callOpenRouter(model: string, messages: any[]) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 ثانیه تایم‌اوت

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

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ OpenRouter error (${model}):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return null
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.error(`⏰ Timeout for model ${model}`)
    } else {
      console.error(`❌ Fetch error for model ${model}:`, error.message)
    }
    return null
  }
}

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    // 1. دریافت و اعتبارسنجی ورودی
    const body = await req.json()
    const { message, sessionId, history } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('📥 Received message:', { 
      message: message.slice(0, 50), 
      sessionId,
      historyLength: history?.length 
    })

    // 2. مدیریت سشن
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({ created_at: new Date().toISOString() })
        .select('id')
        .single()

      if (error) {
        console.error('❌ Session creation error:', error)
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }
      
      currentSessionId = newSession.id
      console.log('✅ New session created:', currentSessionId)
    }

    // 3. ذخیره پیام کاربر
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      })

    if (userMessageError) {
      console.error('❌ Error saving user message:', userMessageError)
    }

    // 4. دریافت تاریخچه
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    // 5. آماده‌سازی messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messageHistory || []).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    // 6. امتحان مدل‌ها به ترتیب
    let reply = null
    let usedModel = null

    for (const modelInfo of MODELS) {
      console.log(`⏳ Trying model: ${modelInfo.name}`)
      reply = await callOpenRouter(modelInfo.model, messages)
      
      if (reply) {
        usedModel = modelInfo.name
        console.log(`✅ Success with model: ${modelInfo.name}`)
        break
      }
    }

    // 7. اگه هیچ مدلی جواب نداد
    if (!reply) {
      console.error('❌ All models failed')
      return NextResponse.json(
        { error: 'All AI models are currently unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // 8. ذخیره پاسخ
    const { error: assistantMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString()
      })

    if (assistantMessageError) {
      console.error('❌ Error saving assistant message:', assistantMessageError)
    }

    const responseTime = Date.now() - startTime
    console.log(`✅ Response sent in ${responseTime}ms using ${usedModel}`)

    // 9. پاسخ نهایی
    return NextResponse.json({
      response: reply,
      sessionId: currentSessionId,
      model: usedModel,
      timing: responseTime
    })

  } catch (error: any) {
    console.error('💥 Critical error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
