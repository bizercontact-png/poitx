import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    console.log('Sending request to DeepSeek with message:', message)
    
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

    console.log('DeepSeek response status:', response.status)
    
    const data = await response.json()
    console.log('DeepSeek response data:', JSON.stringify(data, null, 2))

    // بررسی ساختار پاسخ
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return NextResponse.json({ response: data.choices[0].message.content })
    } else {
      // اگه ساختار متفاوت بود، خود data رو برگردون
      return NextResponse.json({ response: 'پاسخ غیرمنتظره: ' + JSON.stringify(data) })
    }
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ response: 'خطا: ' + error.message })
  }
}
