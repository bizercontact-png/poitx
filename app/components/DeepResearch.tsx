'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type Source = {
  title: string
  link: string
  snippet: string
}

type DeepResearchProps = {
  query: string
  summary: string
  fullAnalysis: string
  sources: Source[]
  stats: {
    totalSources: number
    analyzedSources: number
    timeSpent: number
  }
  chart?: any
  onClose: () => void
}

export default function DeepResearch({
  query,
  summary,
  fullAnalysis,
  sources,
  stats,
  chart,
  onClose
}: DeepResearchProps) {
  const [showFull, setShowFull] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={styles.container}
    >
      {/* هدر */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>🔬</span>
          <h3 style={styles.title}>تحقیق عمیق</h3>
        </div>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>

      {/* آمار */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{stats.totalSources}</span>
          <span style={styles.statLabel}>کل منابع</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{stats.analyzedSources}</span>
          <span style={styles.statLabel}>تحلیل شده</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{(stats.timeSpent / 1000).toFixed(1)}s</span>
          <span style={styles.statLabel}>زمان</span>
        </div>
      </div>

      {/* خلاصه */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>📋 خلاصه تحقیق</h4>
        <p style={styles.summary}>{summary}</p>
      </div>

      {/* منابع */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>📚 منابع ({sources.length})</h4>
        <div style={styles.sourcesList}>
          {sources.map((source, idx) => (
            <motion.a
              key={idx}
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={styles.sourceItem}
            >
              <span style={styles.sourceTitle}>{source.title}</span>
              <span style={styles.sourceSnippet}>{source.snippet}</span>
            </motion.a>
          ))}
        </div>
      </div>

      {/* تحلیل کامل (قابل گسترش) */}
      <div style={styles.section}>
        <button
          onClick={() => setShowFull(!showFull)}
          style={styles.toggleButton}
        >
          {showFull ? '▼ نمایش کمتر' : '▶ نمایش تحلیل کامل'}
        </button>
        <AnimatePresence>
          {showFull && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.fullAnalysis}
            >
              <p style={styles.analysisText}>{fullAnalysis}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* نمودار (اگه باشه) */}
      {chart && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>📊 نمودار تحلیلی</h4>
          <div style={styles.chart}>
            <pre>{JSON.stringify(chart, null, 2)}</pre>
          </div>
        </div>
      )}
    </motion.div>
  )
}

const styles = {
  container: {
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    fontSize: '1.5rem',
  },
  title: {
    fontSize: '1.2rem',
    margin: 0,
    color: '#aaddff',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    opacity: 0.7,
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
  },
  stat: {
    textAlign: 'center' as const,
  },
  statValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#0066ff',
  },
  statLabel: {
    fontSize: '0.8rem',
    opacity: 0.7,
  },
  section: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: '1rem',
    margin: '0 0 0.5rem',
    color: '#aaddff',
  },
  summary: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    margin: 0,
    opacity: 0.9,
  },
  sourcesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  sourceItem: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#fff',
  },
  sourceTitle: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#aaddff',
    marginBottom: '0.2rem',
  },
  sourceSnippet: {
    fontSize: '0.8rem',
    opacity: 0.7,
  },
  toggleButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.5rem',
    width: '100%',
    textAlign: 'left' as const,
  },
  fullAnalysis: {
    marginTop: '0.5rem',
    overflow: 'hidden',
  },
  analysisText: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    margin: 0,
    opacity: 0.8,
    whiteSpace: 'pre-wrap' as const,
  },
  chart: {
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    overflowX: 'auto' as const,
  },
}
