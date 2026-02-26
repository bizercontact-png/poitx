'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { shareSystem } from '../../lib/share'
import MessageList from '../../components/MessageList'
import { useSessions } from '../../hooks/useSessions'
import { motion } from 'framer-motion'

export default function SharePage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [permission, setPermission] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { messages, loadSession } = useSessions()

  useEffect(() => {
    validateLink()
  }, [id])

  const validateLink = async () => {
    setLoading(true)
    const result = await shareSystem.validateShareLink(id as string, password || undefined)
    
    if (result.valid) {
      setSessionId(result.sessionId!)
      setPermission(result.permission)
      await loadSession(result.sessionId!)
    } else {
      if (result.error?.includes('رمز عبور')) {
        setShowPassword(true)
      }
      setError(result.error || 'خطا در بارگذاری')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner} />
      </div>
    )
  }

  if (showPassword) {
    return (
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.passwordBox}
        >
          <h3 style={styles.passwordTitle}>این لینک محافظت شده است</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور را وارد کنید"
            style={styles.passwordInput}
          />
          <button onClick={validateLink} style={styles.passwordButton}>
            ورود
          </button>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>❌</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.badge}>
          {permission === 'view' && '👁️ مشاهده'}
          {permission === 'comment' && '💬 مشاهده + نظر'}
          {permission === 'edit' && '✏️ ویرایش'}
        </span>
      </div>
      <div style={styles.messages}>
        <MessageList
          messages={messages}
          loading={false}
          showThinking={false}
          isMobile={false}
          onCopy={() => {}}
          onDownload={() => {}}
          copiedId={null}
        />
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 50%, #0a0f1e, #050713)',
    color: '#fff',
    padding: '2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #0066ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '2rem auto',
  },
  passwordBox: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    textAlign: 'center' as const,
  },
  passwordTitle: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
  },
  passwordInput: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
  },
  passwordButton: {
    padding: '0.75rem 2rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
  },
  errorBox: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    background: 'rgba(255,0,0,0.1)',
    borderRadius: '16px',
    textAlign: 'center' as const,
  },
  errorIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '1rem',
  },
  errorText: {
    fontSize: '1rem',
    opacity: 0.8,
  },
  header: {
    maxWidth: '800px',
    margin: '0 auto 2rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    textAlign: 'center' as const,
  },
  badge: {
    padding: '0.3rem 1rem',
    background: 'rgba(0,102,255,0.2)',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  messages: {
    maxWidth: '800px',
    margin: '0 auto',
  },
}
