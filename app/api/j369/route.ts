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

export async function POST(req: Request) {
  try {
    const { message, sessionId, history } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get or create session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({ created_at: new Date().toISOString() })
        .select('id')
        .single()

      if (error) throw error
      currentSessionId = newSession.id
    }

    // Save user message
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    })

    // Get last 20 messages for context
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messageHistory || []).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    // Call OpenRouter with timeout
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
        model: 'perplexity/llama-3-sonar-large',
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
      // Try fallback model
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
          max_tokens: 1500
        })
      })

      if (!fallbackResponse.ok) {
        throw new Error('Both models failed')
      }

      const fallbackData = await fallbackResponse.json()
      const fallbackReply = fallbackData.choices[0].message.content

      // Save assistant message
      await supabase.from('messages').insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: fallbackReply,
        created_at: new Date().toISOString()
      })

      return NextResponse.json({
        response: fallbackReply,
        sessionId: currentSessionId,
        model: 'mixtral-8x7b (fallback)'
      })
    }

    const data = await response.json()
    const reply = data.choices[0].message.content

    // Save assistant message
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      response: reply,
      sessionId: currentSessionId,
      model: data.model
    })

  } catch (error: any) {
    console.error('J_369 Error:', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
