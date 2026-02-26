'use client'

import { useState, useCallback } from 'react'

type SearchResult = {
  title: string
  link: string
  snippet: string
  source: string
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, mode: 'quick' | 'deep' = 'quick') => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setResults(data.results || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clearResults  // اسم تابع اینه
  }
}
