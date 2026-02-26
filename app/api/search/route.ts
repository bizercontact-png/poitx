import { NextResponse } from 'next/server'

// ========== محیط ==========
const SERP_API_KEY = process.env.SERP_API_KEY
const BING_API_KEY = process.env.BING_API_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CX = process.env.GOOGLE_CX

// ========== کش جستجو ==========
const searchCache = new Map<string, { results: any[]; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // ۱۰ دقیقه

// ========== تابع جستجو با Google Custom Search ==========
async function searchGoogle(query: string): Promise<any[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log('Google Search API not configured')
    return []
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error('Google Search error:', data)
      return []
    }

    return data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: 'google'
    })) || []
  } catch (error) {
    console.error('Error searching Google:', error)
    return []
  }
}

// ========== تابع جستجو با Bing ==========
async function searchBing(query: string): Promise<any[]> {
  if (!BING_API_KEY) {
    console.log('Bing Search API not configured')
    return []
  }

  try {
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`
    const response = await fetch(url, {
      headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY }
    })
    const data = await response.json()

    if (!response.ok) {
      console.error('Bing Search error:', data)
      return []
    }

    return data.webPages?.value?.map((item: any) => ({
      title: item.name,
      link: item.url,
      snippet: item.snippet,
      source: 'bing'
    })) || []
  } catch (error) {
    console.error('Error searching Bing:', error)
    return []
  }
}

// ========== تابع جستجو با SerpAPI ==========
async function searchSerp(query: string): Promise<any[]> {
  if (!SERP_API_KEY) {
    console.log('SerpAPI not configured')
    return []
  }

  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error('SerpAPI error:', data)
      return []
    }

    return data.organic_results?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: 'serp'
    })) || []
  } catch (error) {
    console.error('Error searching Serp:', error)
    return []
  }
}

// ========== تابع اصلی جستجو ==========
export async function POST(req: Request) {
  try {
    const { query, mode = 'quick' } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // ===== بررسی کش =====
    const cacheKey = query.toLowerCase().trim()
    const cached = searchCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        results: cached.results,
        cached: true
      })
    }

    // ===== جستجو در موتورهای مختلف =====
    let results: any[] = []

    if (mode === 'deep') {
      // حالت تحقیقات عمیق - همه موتورها
      const [googleResults, bingResults, serpResults] = await Promise.all([
        searchGoogle(query),
        searchBing(query),
        searchSerp(query)
      ])
      results = [...googleResults, ...bingResults, ...serpResults]
    } else {
      // حالت سریع - فقط یک موتور
      results = await searchGoogle(query)
      if (results.length === 0) {
        results = await searchBing(query)
      }
      if (results.length === 0) {
        results = await searchSerp(query)
      }
    }

    // ===== حذف نتایج تکراری =====
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.link === result.link)
    ).slice(0, 10) // حداکثر ۱۰ نتیجه

    // ===== ذخیره در کش =====
    searchCache.set(cacheKey, {
      results: uniqueResults,
      timestamp: Date.now()
    })

    return NextResponse.json({
      results: uniqueResults,
      count: uniqueResults.length,
      mode
    })

  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
