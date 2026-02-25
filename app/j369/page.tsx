'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import GalacticInput from '../components/GalacticInput'
import AuthStatus from '../components/AuthStatus'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  sessionId?: string
}

type Session = {
  id: string
  title: string
  createdAt: Date
  lastMessage?: string
}

export default function J369Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const saved = localStorage.getItem('j369-sessions')
    if (saved) {
      try {
        setSessions(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse sessions', e)
      }
    }
  }, [])

  const createNewChat = () => {
    const newSessionId = Date.now().toString()
    const newSession: Session = {
      id: newSessionId,
      title: 'Chat ' + format(new Date(), 'yyyy/MM/dd HH:mm'),
      createdAt: new Date()
    }

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    localStorage.setItem('j369-sessions', JSON.stringify(updatedSessions))

    setCurrentSessionId(newSessionId)
    setMessages([])
    setError(null)
  }

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setMessages([])
    setError(null)
  }

  const deleteSession = (sessionId: string) => {
    const filtered = sessions.filter(s => s.id !== sessionId)
    setSessions(filtered)
    localStorage.setItem('j369-sessions', JSON.stringify(filtered))

    if (currentSessionId === sessionId) {
      createNewChat()
    }
  }

  const askJ369 = async (input: string, files: File[]) => {
    if (!input.trim() || loading) return

    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date(),
      sessionId: currentSessionId || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const res = await fetch('/api/j369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId,
          history: messages.slice(-10)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unknown error')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
        sessionId: data.sessionId
      }

      setMessages(prev => [...prev, assistantMessage])

      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId)
        const updatedSessions = sessions.map(s =>
          s.id === data.sessionId
            ? { ...s, title: input.slice(0, 30) + '...' }
            : s
        )
        setSessions(updatedSessions)
        localStorage.setItem('j369-sessions', JSON.stringify(updatedSessions))
      }
    } catch (error: any) {
      console.error('J_369 Error:', error)
      setError(error.message || 'خطایی رخ داد')
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        createdAt: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={styles.container}>
      {/* سایدبار */}
      <div style={{
        ...styles.sidebar,
        transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={styles.sidebarHeader}>
          <button onClick={() => setShowSidebar(false)} style={styles.closeSidebar}>
            ←
          </button>
          <button onClick={createNewChat} style={styles.newChatButton}>
            + New Chat
          </button>
        </div>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="جستجوی مکالمات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.sessionsList}>
          {filteredSessions.map(session => (
            <div
              key={session.id}
              onClick={() => loadSession(session.id)}
              style={{
                ...styles.sessionItem,
                ...(session.id === currentSessionId ? styles.activeSession : {})
              }}
            >
              <div style={styles.sessionInfo}>
                <div style={styles.sessionTitle}>{session.title}</div>
                <div style={styles.sessionDate}>
                  {format(session.createdAt, 'yyyy/MM/dd HH:mm', { locale: faIR })}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSession(session.id)
                }}
                style={styles.deleteSession}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* بخش اصلی چت */}
      <div style={{
        ...styles.main,
        marginLeft: showSidebar ? '280px' : '0'
      }}>
        {/* هدر با وضعیت کاربر */}
        <header style={styles.header}>
          <button onClick={() => setShowSidebar(true)} style={styles.openSidebar}>
            ☰
          </button>
          <Link href="/" style={styles.logo}>
            🌌 POITX
          </Link>
          <div style={styles.headerRight}>
            <AuthStatus />
            <span style={styles.badge}>J_369</span>
          </div>
        </header>

        {/* ناحیه پیام‌ها */}
        <main style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.welcomeContainer}>
              <h1 style={styles.welcomeTitle}>🤖 J_369</h1>
              <p style={styles.welcomeText}>
                هوش مصنوعی کهکشان POITX. چطور می‌تونم کمک کنم؟
              </p>
              <div style={styles.suggestions}>
                {[
                  'What is POITX Galaxy?',
                  'Tell me about J_369',
                  'Help me with coding',
                  'Write a poem',
                  'Explain quantum computing',
                  'Give me a recipe'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => askJ369(suggestion, [])}
                    style={styles.suggestionButton}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.messagesList}>
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    animation: `slideIn 0.3s ease-out ${i * 0.05}s both`
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
                    <div style={styles.messageFooter}>
                      <span style={styles.messageTime}>
                        {format(msg.createdAt, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}>
                  <div style={styles.assistantAvatar}>🤖</div>
                  <div style={{ ...styles.message, ...styles.assistantMessage }}>
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
          )}
        </main>

        {/* ورودی کهکشانی */}
        <footer style={styles.footer}>
          <GalacticInput onSubmit={askJ369} loading={loading} />
          {error && (
            <div style={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}
        </footer>
      </div>

      <style jsx>{`
        @keyframes slideIn {
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
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    background: '#0a0f1e',
    color: '#fff',
    overflow: 'hidden',
  },
  sidebar: {
    width: '280px',
    height: '100vh',
    background: 'rgba(20, 25, 40, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    transition: 'transform 0.3s ease',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarHeader: {
    padding: '1rem',
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  closeSidebar: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  newChatButton: {
    flex: 1,
    padding: '0.5rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  searchContainer: {
    padding: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  sessionsList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.5rem',
  },
  sessionItem: {
    padding: '0.75rem',
    margin: '0.25rem 0',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  activeSession: {
    background: 'rgba(0,102,255,0.2)',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  sessionDate: {
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  deleteSession: {
    background: 'transparent',
    border: 'none',
    color: '#ff4444',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  main: {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'margin-left 0.3s ease',
  },
  header: {
    padding: '1rem',
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  openSidebar: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    textDecoration: 'none',
    textShadow: '0 0 10px #0066ff',
  },
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  badge: {
    background: '#0066ff',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '2rem',
  },
  welcomeContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '800px',
    margin: '0 auto',
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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.5rem',
    width: '100%',
    marginBottom: '2rem',
  },
  suggestionButton: {
    padding: '0.8rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  },
  messagesList: {
    maxWidth: '800px',
    margin: '0 auto',
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
    marginBottom: '0.3rem',
  },
  messageText: {
    margin: '0.3rem 0',
    lineHeight: 1.6,
    fontSize: '1rem',
  },
  messageFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  footer: {
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1rem',
  },
  errorMessage: {
    maxWidth: '800px',
    margin: '0.5rem auto 0',
    padding: '0.5rem',
    background: 'rgba(255,0,0,0.1)',
    border: '1px solid rgba(255,0,0,0.3)',
    borderRadius: '8px',
    color: '#ff6666',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
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
