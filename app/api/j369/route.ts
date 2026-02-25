import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const openRouterKey = process.env.OPENROUTER_API_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

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

// تابع کمکی برای فراخوانی OpenRouter با مدیریت خطا
async function callOpenRouter(model: string, messages: any[]) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

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

    // خوندن پاسخ به صورت text اول
    const responseText = await response.text()
    
    // اگه خالی بود
    if (!responseText) {
      throw new Error('Empty response from OpenRouter')
    }

    // سعی کن JSON رو parse کنی
    try {
      const data = JSON.parse(responseText)
      return data.choices?.[0]?.message?.content || null
    } catch (parseError) {
      // اگه JSON نبود، خود متن رو برگردون
      console.error('Invalid JSON response:', responseText)
      return null
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`Timeout for model ${model}`)
    } else {
      console.error(`Error calling ${model}:`, error.message)
    }
    return null
  }
}

// لیست مدل‌ها
const MODELS = [
  { name: 'llama-3.3-70b', model: 'meta-llama/llama-3.3-70b-instruct' },
  { name: 'gemini-2.0-flash', model: 'google/gemini-2.0-flash-exp' },
  { name: 'mixtral-8x7b', model: 'mistralai/mixtral-8x7b-instruct' }
]

export async function POST(req: Request) {
  try {
    const { message, sessionId, history } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Session management
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({ created_at: new Date().toISOString() })
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
      currentSessionId = newSession.id
    }

    // Save user message
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    })

    // Get history
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Prepare messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messageHistory || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]

    // Try models
    let reply = null
    let usedModel = null

    for (const m of MODELS) {
      reply = await callOpenRouter(m.model, messages)
      if (reply) {
        usedModel = m.name
        break
      }
    }

    if (!reply) {
      return NextResponse.json(
        { error: 'All AI models are currently unavailable' },
        { status: 503 }
      )
    }

    // Save response
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      response: reply,
      sessionId: currentSessionId,
      model: usedModel
    })

  } catch (error: any) {
    console.error('Critical error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
