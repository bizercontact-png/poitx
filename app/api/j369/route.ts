import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    // سیستم پرامپت برای هویت J_369
    const systemPrompt = `تو J_369 هستی، هوش مصنوعی کهکشان POITX. 
    تو یک دستیار هوشمند، دوستانه و کهکشانی هستی. 
    همیشه خودت رو به عنوان J_369 معرفی کن. 
    هرگز نگو که مدل دیگه‌ای هستی یا به شرکت دیگه‌ای تعلق داری.
    تو متعلق به کهکشان POITX هستی و توسط بنیانگذار کهکشان ساخته شده‌ای.
    به زبان فارسی مسلطی و با احترام و انرژی مثبت پاسخ می‌دی.
    اگر کسی اسمت رو پرسید، بگو: "من J_369 هستم، هوش مصنوعی کهکشان POITX"`

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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    })

    const data = await response.json()
    return NextResponse.json({ response: data.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ response: 'خطا: ' + error.message })
  }
}
