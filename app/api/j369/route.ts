import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    // اینجا بعداً API Key واقعی رو می‌ذاری
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }]
      })
    })

    const data = await response.json()
    return NextResponse.json({ response: data.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ response: 'خطا در ارتباط با J_369' })
  }
}
