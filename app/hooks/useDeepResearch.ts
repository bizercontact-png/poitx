'use client'

import { useState, useCallback } from 'react'

type DeepResearchResult = {
  query: string
  summary: string
  fullAnalysis: string
  sources: { title: string; link: string; snippet: string }[]
  stats: {
    totalSources: number
    analyzedSources: number
    timeSpent: number
  }
  chart?: any
  timestamp: string
}

export function useDeepResearch() {
  const [result, setResult] = useState<DeepResearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const research = useCallback(async (query: string, depth: 'light' | 'medium' | 'deep' = 'medium') => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, depth })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    loading,
    error,
    research,
    clearResult
  }
}
