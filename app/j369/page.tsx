'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// تایپ برای پیام‌ها
type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function J369Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'سلام! من J_369 هستم، هوش مصنوعی کهکشان POITX. چطور می‌تونم بهت کمک کنم؟ 🌌',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // اسکرول خودکار به آخر
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const askJ369 = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
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
          sessionId,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })
      
      const data = await res.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'متأسفانه در ارتباط با J_369 خطایی رخ داد. دوباره تلاش کن.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askJ369()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'سلام! من J_369 هستم، هوش مصنوعی کهکشان POITX. چطور می‌تونم بهت کمک کنم؟ 🌌',
      timestamp: new Date()
    }])
    setSessionId(null)
  }

  return (
    <div style={styles.container}>
      {/* هدر ثابت */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link href="/" style={styles.logo}>
            🌌 POITX
          </Link>
          <div style={styles.nav}>
            <Link href="/" style={styles.navLink}>خانه</Link>
            <Link href="/j369" style={{...styles.navLink, ...styles.activeLink}}>J_369</Link>
            <Link href="/about" style={styles.navLink}>درباره</Link>
          </div>
          <button onClick={clearChat} style={styles.clearButton}>
            شروع مجدد
          </button>
        </div>
      </header>

      {/* بخش چت */}
      <main style={styles.main}>
        <div style={styles.chatContainer}>
          {/* پیام‌ها */}
          <div style={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
                    animation: `slideIn 0.3s ease-out ${index * 0.1}s`
                  }}
                >
                  {msg.role === 'assistant' && (
                    <span style={styles.assistantIcon}>🤖</span>
                  )}
                  <div style={styles.messageContent}>
                    <p style={styles.messageText}>{msg.content}</p>
                    <span style={styles.timestamp}>
                      {msg.timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{...styles.messageWrapper, justifyContent: 'flex-start'}}>
                <div style={{...styles.message, ...styles.assistantMessage}}>
                  <span style={styles.assistantIcon}>🤖</span>
                  <div style={styles.messageContent}>
                    <div style={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ورودی */}
          <div style={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="برای J_369 پیام بفرست..."
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
              {loading ? '...' : '↑'}
            </button>
          </div>
        </div>
      </main>

      {/* انیمیشن‌های CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0f1e',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    background: 'rgba(10, 15, 30, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'white',
    textDecoration: 'none',
    textShadow: '0 0 10px #0066ff',
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
  clearButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
  },
  main: {
    flex: 1,
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    padding: '2rem',
  },
  chatContainer: {
    height: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '80%',
    padding: '1rem',
    borderRadius: '15px',
    display: 'flex',
    gap: '0.8rem',
    animation: 'slideIn 0.3s ease-out',
  },
  userMessage: {
    background: 'linear-gradient(135deg, #0066ff 0%, #00aaff 100%)',
    borderBottomRightRadius: '5px',
  },
  assistantMessage: {
    background: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: '5px',
  },
  assistantIcon: {
    fontSize: '1.5rem',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    margin: 0,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
  },
  timestamp: {
    fontSize: '0.7rem',
    opacity: 0.6,
    marginTop: '0.3rem',
    display: 'block',
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
    '& span:nth-child(1)': {
      animationDelay: '0s',
    },
    '& span:nth-child(2)': {
      animationDelay: '0.2s',
    },
    '& span:nth-child(3)': {
      animationDelay: '0.4s',
    },
  },
  inputContainer: {
    display: 'flex',
    padding: '1rem',
    background: 'rgba(0,0,0,0.3)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.8rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    resize: 'none' as const,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s',
  },
  sendButton: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0066ff 0%, #00aaff 100%)',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
