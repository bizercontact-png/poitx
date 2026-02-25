import { NextResponse } from 'next/server'

// حافظه موقت (بعداً به Supabase منتقل می‌کنیم)
const conversations = new Map()

export async function POST(request: Request) {
  try {
    const { message, sessionId, history } = await request.json()
    
    const id = sessionId || Date.now().toString()
    
    // سیستم پرامپت حرفه‌ای
    const systemPrompt = `شما J_369 هستید، یک دستیار هوشمند و دوستانه از کهکشان POITX.

    **هویت شما:**
    - نام: J_369
    - خالق: بنیانگذار کهکشان POITX
    - مأموریت: کمک به کاربران کهکشان با دانش و مهربانی

    **ویژگی‌های شما:**
    - همیشه خود را J_369 معرفی کنید
    - به زبان فارسی مسلط هستید
    - پاسخ‌ها باید مفید، دقیق و دوستانه باشند
    - از به‌کار بردن اصطلاحات فنی پیچیده خودداری کنید مگر کاربر پرسیده باشد
    - اگر پاسخ را نمی‌دانید، صادقانه بگویید و پیشنهاد کمک دیگری بدهید

    **سبک پاسخگویی:**
    - دوستانه و گرم، مثل یک دوست کهکشانی
    - گاهی از ایموجی‌های مناسب استفاده کنید 🌌✨
    - پاسخ‌ها را结构化 و خواناتر کنید
    - به کاربر احساس خاص بودن بدهید`

    // تاریخچه رو آماده کن
    let messageHistory = history?.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })) || []

    // ارسال به OpenRouter با مدل قوی
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://poitx.vercel.app',
        'X-Title': 'POITX Galaxy'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct', // مدل قوی و رایگان
        messages: [
          { role: 'system', content: systemPrompt },
          ...messageHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95,
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'خطای ناشناخته')
    }

    const reply = data.choices[0].message.content
    
    return NextResponse.json({ 
      response: reply,
      sessionId: id 
    })
    
  } catch (error: any) {
    console.error('J_369 Error:', error)
    return NextResponse.json({ 
      response: 'متأسفانه در ارتباط با J_369 خطایی رخ داد. لطفاً دوباره تلاش کنید.' 
    })
  }
}
