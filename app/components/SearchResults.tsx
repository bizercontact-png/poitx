'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type SearchResult = {
  title: string
  link: string
  snippet: string
  source: string
}

type SearchResultsProps = {
  results: SearchResult[]
  loading: boolean
  onSelect: (result: SearchResult) => void
}

export default function SearchResults({ results, loading, onSelect }: SearchResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>در حال جستجو در وب...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyIcon}>🔍</span>
        <p style={styles.emptyText}>نتیجه‌ای یافت نشد</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        <span style={styles.titleIcon}>🌐</span>
        نتایج جستجو ({results.length})
      </h3>
      <div style={styles.resultsList}>
        <AnimatePresence>
          {results.map((result, idx) => (
            <motion.div
              key={result.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={styles.resultCard}
            >
              <div style={styles.resultHeader}>
                <span style={styles.resultSource}>
                  {result.source === 'google' ? '🔵' : result.source === 'bing' ? '🔴' : '🟢'}
                  {' ' + result.source}
                </span>
                <button
                  onClick={() => setExpandedId(expandedId === result.link ? null : result.link)}
                  style={styles.expandButton}
                >
                  {expandedId === result.link ? '▲' : '▼'}
                </button>
              </div>
              
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.resultLink}
              >
                {result.title}
              </a>
              
              <p style={styles.resultSnippet}>
                {expandedId === result.link ? result.snippet : result.snippet.slice(0, 100) + '...'}
              </p>
              
              <div style={styles.resultActions}>
                <button
                  onClick={() => window.open(result.link, '_blank')}
                  style={styles.actionButton}
                >
                  🔗 باز کردن
                </button>
                <button
                  onClick={() => onSelect(result)}
                  style={styles.actionButton}
                >
                  📋 استفاده در چت
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '1rem',
    margin: '1rem 0',
  },
  title: {
    fontSize: '1rem',
    margin: '0 0 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#aaddff',
  },
  titleIcon: {
    fontSize: '1.2rem',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  resultCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  resultSource: {
    fontSize: '0.7rem',
    opacity: 0.7,
    textTransform: 'uppercase' as const,
  },
  expandButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    opacity: 0.5,
  },
  resultLink: {
    color: '#aaddff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'block',
    marginBottom: '0.5rem',
  },
  resultSnippet: {
    fontSize: '0.8rem',
    opacity: 0.8,
    lineHeight: 1.5,
    margin: '0 0 0.5rem',
  },
  resultActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  loadingSpinner: {
    width: '30px',
    height: '30px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTop: '2px solid #0066ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '2rem',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '0.9rem',
    opacity: 0.5,
  },
}
