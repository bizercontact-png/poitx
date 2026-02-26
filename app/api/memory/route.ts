import { NextResponse } from 'next/server'
import { memorySystem } from '../../lib/memory'

export async function POST(req: Request) {
  try {
    const { action, userId, ...data } = await req.json()

    switch (action) {
      case 'remember':
        await memorySystem.remember(userId, data.type, data.key, data.value, data.confidence)
        return NextResponse.json({ success: true })

      case 'recall':
        const value = await memorySystem.recall(userId, data.key)
        return NextResponse.json({ value })

      case 'forget':
        await memorySystem.forget(userId, data.key)
        return NextResponse.json({ success: true })

      case 'search':
        const results = await memorySystem.search(userId, data.query, data.type)
        return NextResponse.json({ results })

      case 'profile':
        if (data.method === 'get') {
          const profile = await memorySystem.getProfile(userId)
          return NextResponse.json({ profile })
        } else {
          await memorySystem.updateProfile(userId, data.profile)
          return NextResponse.json({ success: true })
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Memory API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
