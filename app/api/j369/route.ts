// app/api/j369/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json()
    
    // ۱. دریافت یا ساخت session
    let session = sessionId
    if (!session) {
      const { data: newSession } = await supabase
        .from('sessions')
        .insert({ created_at: new Date() })
        .select()
        .single()
      session = newSession.id
    }

    // ۲. ذخیره پیام کاربر
    await supabase
      .from('messages')
      .insert({
        session_id: session,
        role: 'user',
        content: message
      })

    // ۳. دریافت تاریخچه (آخرین ۲۰ پیام)
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', session)
      .order('created_at', { ascending: true })
      .limit(20)

    // ۴. سیستم پرامپت حرفه‌ای
    const systemPrompt = `You are J_369, the official AI of POITX Galaxy.

IDENTITY:
- Name: J_369
- Creator: Founder of POITX Galaxy
- Mission: Help users with knowledge, kindness, and precision

PERSONALITY:
- Friendly and warm, like a galactic companion
- Professional and accurate in responses
- Use emojis occasionally 🌌✨
- Make users feel special and valued

RESPONSE STYLE:
- Clear and structured answers
- Use markdown for better readability
- Be concise but thorough
- If unsure, admit it honestly and offer alternatives`

    // ۵. ارسال به OpenRouter با مدل عالی
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://poitx.vercel.app',
        'X-Title': 'POITX Galaxy'
      },
      body: JSON.stringify({
        model: 'perplexity/llama-3-sonar-large',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(history || []).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const data = await response.json()
    const reply = data.choices[0].message.content

    // ۶. ذخیره پاسخ
    await supabase
      .from('messages')
      .insert({
        session_id: session,
        role: 'assistant',
        content: reply
      })

    return NextResponse.json({ 
      response: reply,
      sessionId: session 
    })
    
  } catch (error) {
    console.error('J_369 Error:', error)
    return NextResponse.json({ 
      response: 'I apologize, but I encountered an error. Please try again.' 
    })
  }
}
