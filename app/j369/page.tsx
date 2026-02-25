
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant'
  content: string
  id?: string
}

export default function J369Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // اسکرول خودکار روان
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [messages])

  // فوکوس خودکار روی ورودی
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const askJ369 = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/j369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          sessionId 
        })
      })
      
      const data = await res.json()
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        id: Date.now().toString()
      }])
      
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        id: Date.now().toString()
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const newChat = () => {
    setMessages([])
    setSessionId(null)
    setInput('')
  }

  return (
    <div style={styles.container}>
      {/* هدر شناور */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.leftSection}>
            <Link href="/" style={styles.logo}>
              🌌 POITX
            </Link>
            <span style={styles.badge}>J_369</span>
          </div>
          
          <nav style={styles.nav}>
            <Link href="/" style={styles.navLink}>Home</Link>
            <Link href="/j369" style={{...styles.navLink, ...styles.activeLink}}>J_369</Link>
          </nav>

          <button onClick={newChat} style={styles.newChatButton}>
            + New Chat
          </button>
        </div>
      </header>

      {/* پیام‌ها */}
      <main style={styles.main}>
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.welcomeContainer}>
              <h1 style={styles.welcomeTitle}>🤖 J_369</h1>
              <p style={styles.welcomeText}>
                The official AI of POITX Galaxy. How can I help you today?
              </p>
              <div style={styles.suggestions}>
                {[
                  'What is POITX Galaxy?',
                  'Tell me about J_369',
                  'What can you do?',
                  'Help me with coding'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion)
                      setTimeout(askJ369, 100)
                    }}
                    style={styles.suggestionButton}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id || i}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: `fadeSlideIn 0.3s ease-out ${i * 0.05}s both`
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={styles.assistantAvatar}>🤖</div>
                )}
                <div
                  style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
                  }}
                >
                  <div style={styles.messageContent}>
                    {msg.content.split('\n').map((line, j) => (
                      <p key={j} style={styles.messageText}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div style={{...styles.messageWrapper, justifyContent: 'flex-start'}}>
              <div style={styles.assistantAvatar}>🤖</div>
              <div style={{...styles.message, ...styles.assistantMessage}}>
                <div style={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ورودی ثابت پایین */}
      <footer style={styles.footer}>
        <div style={styles.inputContainer}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                askJ369()
              }
            }}
            placeholder="Message J_369..."
            rows={1}
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={askJ369}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendButton,
              ...(loading || !input.trim() ? styles.sendButtonDisabled : {})
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </footer>

      {/* انیمیشن‌های CSS */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#0a0f1e',
    color: '#fff',
    overflow: 'hidden',
  },
  header: {
    background: 'rgba(10, 15, 30, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '0.5rem 1rem',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    textDecoration: 'none',
    textShadow: '0 0 10px #0066ff',
  },
  badge: {
    background: '#0066ff',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.3s',
  },
  activeLink: {
    color: '#0066ff',
  },
  newChatButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  messagesContainer: {
    height: '100%',
    overflowY: 'auto' as const,
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  welcomeContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '2rem',
  },
  welcomeTitle: {
    fontSize: '4rem',
    margin: 0,
    background: 'linear-gradient(135deg, #fff 0%, #aaddff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem',
  },
  welcomeText: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '2rem',
  },
  suggestions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  suggestionButton: {
    padding: '0.8rem 1.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '30px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '1.5rem',
    gap: '1rem',
    opacity: 0,
  },
  assistantAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  message: {
    maxWidth: '70%',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    position: 'relative' as const,
  },
  userMessage: {
    background: '#0066ff',
    borderBottomRightRadius: '5px',
  },
  assistantMessage: {
    background: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: '5px',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  messageText: {
    margin: 0,
    lineHeight: 1.6,
    fontSize: '1rem',
  },
  footer: {
    background: 'rgba(10, 15, 30, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1rem',
  },
  inputContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '30px',
    color: '#fff',
    fontSize: '1rem',
    resize: 'none' as const,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s',
  },
  sendButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#0066ff',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  typingIndicator: {
    display: 'flex',
    gap: '0.3rem',
    padding: '0.5rem 0',
    '& span': {
      width: '8px',
      height: '8px',
      background: '#fff',
      borderRadius: '50%',
      animation: 'bounce 1.4s infinite ease-in-out',
    },
    '& span:nth-child(1)': { animationDelay: '0s' },
    '& span:nth-child(2)': { animationDelay: '0.2s' },
    '& span:nth-child(3)': { animationDelay: '0.4s' },
  },
}
