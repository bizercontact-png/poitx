'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import GalacticInput from '../components/GalacticInput'
import AuthStatus from '../components/AuthStatus'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

type Session = {
  id: string
  title: string
  createdAt: Date
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
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // اسکرول خودکار
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // لود سشن‌ها
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

  const createNewChat = useCallback(() => {
    const newSessionId = Date.now().toString()
    const newSession: Session = {
      id: newSessionId,
      title: 'Chat ' + format(new Date(), 'yyyy/MM/dd HH:mm'),
      createdAt: new Date()
    }

    setSessions(prev => [newSession, ...prev])
    localStorage.setItem('j369-sessions', JSON.stringify([newSession, ...sessions]))
    setCurrentSessionId(newSessionId)
    setMessages([])
    setError(null)
  }, [sessions])

  const askJ369 = useCallback(async (input: string) => {
    if (!input.trim() || loading) return

    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const res = await fetch('/api/j369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      if (!currentSessionId) {
        createNewChat()
      }

    } catch (error) {
      setError('خطا در ارتباط با J_369')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [loading, currentSessionId, createNewChat])

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      {/* سایدبار */}
      {showSidebar && (
        <div style={styles.sidebar}>
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
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.sessionsList}>
            {sessions
              .filter(s => s.title.includes(searchQuery))
              .map(session => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  style={{
                    ...styles.sessionItem,
                    ...(session.id === currentSessionId ? styles.activeSession : {})
                  }}
                >
                  <div style={styles.sessionTitle}>{session.title}</div>
                  <div style={styles.sessionDate}>
                    {format(session.createdAt, 'HH:mm')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Chat */}
      <div style={{
        ...styles.main,
        marginLeft: showSidebar ? '280px' : '0'
      }}>
        {/* Header */}
        <header style={styles.header}>
          {!showSidebar && (
            <button onClick={() => setShowSidebar(true)} style={styles.openSidebar}>
              ☰
            </button>
          )}
          <Link href="/" style={styles.logo}>
            🌌 POITX
          </Link>
          <div style={styles.headerRight}>
            <AuthStatus />
            <span style={styles.badge}>J_369</span>
          </div>
        </header>

        {/* Messages */}
        <main style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.welcomeContainer}>
              <h1 style={styles.welcomeTitle}>🤖 J_369</h1>
              <p style={styles.welcomeText}>
                چطور می‌تونم کمک کنم؟
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={styles.assistantAvatar}>🤖</div>
                  )}
                  <div style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
                  }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : 'text'
                          return (
                            <div style={{ position: 'relative' }}>
                              <pre style={styles.codeBlock}>
                                <code className={`language-${language}`} {...props}>
                                  {String(children).replace(/\n$/, '')}
                                </code>
                              </pre>
                              <button
                                onClick={() => downloadFile(String(children), `code.${language}`)}
                                style={styles.downloadButton}
                              >
                                📥
                              </button>
                            </div>
                          )
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    <div style={styles.messageTime}>
                      {format(msg.createdAt, 'HH:mm')}
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
            </>
          )}
        </main>

        {/* Input */}
        <footer style={styles.footer}>
          <GalacticInput onSubmit={askJ369} loading={loading} />
          {error && <div style={styles.errorMessage}>⚠️ {error}</div>}
        </footer>
      </div>

      <style>{`
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
    overflow: 'hidden'
  },
  sidebar: {
    width: '280px',
    height: '100vh',
    background: 'rgba(20, 25, 40, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column' as const
  },
  sidebarHeader: {
    padding: '1rem',
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  closeSidebar: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.2rem',
    borderRadius: '8px'
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
    fontWeight: 500
  },
  searchContainer: {
    padding: '1rem'
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none'
  },
  sessionsList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.5rem'
  },
  sessionItem: {
    padding: '0.75rem',
    margin: '0.25rem 0',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  activeSession: {
    background: 'rgba(0,102,255,0.2)',
    borderLeft: '3px solid #0066ff'
  },
  sessionTitle: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem'
  },
  sessionDate: {
    fontSize: '0.7rem',
    opacity: 0.6
  },
  main: {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'margin-left 0.3s ease'
  },
  header: {
    padding: '1rem',
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  openSidebar: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    textDecoration: 'none',
    textShadow: '0 0 10px #0066ff'
  },
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  badge: {
    background: '#0066ff',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.8rem'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '2rem'
  },
  welcomeContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomeTitle: {
    fontSize: '4rem',
    margin: 0,
    background: 'linear-gradient(135deg, #fff 0%, #aaddff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem'
  },
  welcomeText: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.7)'
  },
  messagesList: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '1.5rem',
    gap: '1rem'
  },
  assistantAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(0,102,255,0.3)'
  },
  message: {
    maxWidth: '70%',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    position: 'relative' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  userMessage: {
    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
    borderBottomRightRadius: '5px'
  },
  assistantMessage: {
    background: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: '5px'
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.6,
    marginTop: '0.5rem',
    textAlign: 'right' as const
  },
  codeBlock: {
    background: '#1e1e1e',
    padding: '1rem',
    borderRadius: '8px',
    overflowX: 'auto' as const,
    margin: '0.5rem 0',
    border: '1px solid #333'
  },
  downloadButton: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.2rem 0.5rem',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  footer: {
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1rem'
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
    textAlign: 'center' as const
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
      animation: 'bounce 1.4s infinite ease-in-out'
    },
    '& span:nth-child(1)': { animationDelay: '0s' },
    '& span:nth-child(2)': { animationDelay: '0.2s' },
    '& span:nth-child(3)': { animationDelay: '0.4s' }
  }
}
