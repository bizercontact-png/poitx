'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function J369Page() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const askJ369 = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResponse('')
    
    try {
      const res = await fetch('/api/j369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      setResponse('خطا در ارتباط با J_369')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* هدر */}
      <header style={styles.header}>
        <Link href="/" style={styles.logoLink}>
          <span style={styles.logo}>🌌 POITX</span>
        </Link>
        <nav style={styles.nav}>
          <Link href="/" style={styles.navLink}>خانه</Link>
          <Link href="/j369" style={{...styles.navLink, ...styles.activeLink}}>J_369</Link>
          <Link href="/about" style={styles.navLink}>درباره</Link>
        </nav>
      </header>

      {/* محتوای اصلی */}
      <main style={styles.main}>
        <div style={styles.chatContainer}>
          <div style={styles.header}>
            <h1 style={styles.title}>🤖 J_369</h1>
            <p style={styles.subtitle}>هوش مصنوعی کهکشان POITX</p>
          </div>

          {/* بخش چت */}
          <div style={styles.chatBox}>
            {response && (
              <div style={styles.responseBox}>
                <strong>J_369:</strong>
                <p style={styles.responseText}>{response}</p>
              </div>
            )}
          </div>

          {/* ورودی */}
          <div style={styles.inputContainer}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="سوالت رو از J_369 بپرس..."
              rows={3}
              style={styles.input}
            />
            <button
              onClick={askJ369}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'در حال فکر کردن...' : '🚀 بپرس'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f35 100%)',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  logoLink: {
    textDecoration: 'none',
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 900,
    color: 'white',
    textShadow: '0 0 10px #0066ff',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '1.1rem',
    transition: 'color 0.3s',
  },
  activeLink: {
    color: '#0066ff',
  },
  main: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
  },
  chatContainer: {
    width: '100%',
    maxWidth: '800px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '2rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '2.5rem',
    margin: '0 0 0.5rem',
    background: 'linear-gradient(135deg, #fff 0%, #aaddff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#aaddff',
    marginBottom: '2rem',
  },
  chatBox: {
    minHeight: '200px',
    marginBottom: '2rem',
  },
  responseBox: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  responseText: {
    margin: '0.5rem 0 0',
    lineHeight: '1.8',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  input: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    resize: 'none' as const,
    fontFamily: 'inherit',
  },
  button: {
    padding: '1rem',
    fontSize: '1.2rem',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #0066ff 0%, #00aaff 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontWeight: 700,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
