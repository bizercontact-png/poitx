import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://poitx.vercel.app',
        'X-Title': 'POITX Galaxy'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: message }]
      })
    })

    const data = await response.json()
    return NextResponse.json({ response: data.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ response: 'خطا: ' + error.message })
  }
}
