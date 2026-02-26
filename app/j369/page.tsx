'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // تشخیص پلتفرم
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
      setShowSidebar(width >= 1024)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // کلیک خارج از سایدبار (موبایل)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && showSidebar && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, showSidebar])

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
    if (isMobile) setShowSidebar(false)
  }, [sessions, isMobile])

  const loadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setMessages([])
    if (isMobile) setShowSidebar(false)
  }

  const deleteSession = (sessionId: string) => {
    const filtered = sessions.filter(s => s.id !== sessionId)
    setSessions(filtered)
    localStorage.setItem('j369-sessions', JSON.stringify(filtered))
    if (currentSessionId === sessionId) {
      createNewChat()
    }
  }

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

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={styles.container}>
      {/* سایدبار با انیمیشن */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: isMobile ? -300 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              ...styles.sidebar,
              position: isMobile ? 'fixed' : 'relative',
              width: isMobile ? '280px' : isTablet ? '240px' : '280px',
              zIndex: 200,
            }}
          >
            <div style={styles.sidebarHeader}>
              {isMobile && (
                <button onClick={() => setShowSidebar(false)} style={styles.closeSidebar}>
                  ←
                </button>
              )}
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
              <AnimatePresence>
                {filteredSessions.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => loadSession(session.id)}
                    style={{
                      ...styles.sessionItem,
                      ...(session.id === currentSessionId ? styles.activeSession : {})
                    }}
                  >
                    <div style={styles.sessionInfo}>
                      <div style={styles.sessionTitle}>{session.title}</div>
                      <div style={styles.sessionDate}>
                        {format(session.createdAt, 'HH:mm')}
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div style={styles.sidebarFooter}>
              <div style={styles.userInfo}>
                <AuthStatus />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div style={{
        ...styles.main,
        marginLeft: showSidebar && !isMobile ? (isTablet ? '240px' : '280px') : '0',
        width: showSidebar && !isMobile ? `calc(100% - ${isTablet ? '240px' : '280px'})` : '100%',
      }}>
        {/* Header */}
        <header style={styles.header}>
          {(!showSidebar || isMobile) && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSidebar(true)}
              style={styles.openSidebar}
            >
              ☰
            </motion.button>
          )}
          <Link href="/" style={styles.logo}>
            <span style={styles.logoText}>🌌 POITX</span>
          </Link>
          <div style={styles.headerRight}>
            {!isMobile && <AuthStatus />}
          </div>
        </header>

        {/* Messages */}
        <main style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.welcomeContainer}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={styles.welcomeEmoji}
              >
                🌌
              </motion.div>
              <h1 style={styles.welcomeTitle}>J_369</h1>
              <p style={styles.welcomeText}>
                هوش مصنوعی کهکشان POITX
              </p>
              <div style={styles.suggestions}>
                {[
                  'تحقیق عمیق درباره سیاه‌چاله‌ها',
                  'برنامه پایتون برای محاسبه اعداد اول',
                  'شعر کهکشانی',
                  'جدول مقایسه سیارات'
                ].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => askJ369(suggestion)}
                    style={styles.suggestionButton}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={styles.messagesList}>
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={styles.assistantAvatar}
                      >
                        🤖
                      </motion.div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      style={{
                        ...styles.message,
                        ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
                      }}
                    >
                      <div style={styles.messageContent}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div style={{ position: 'relative' }}>
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                      margin: 0,
                                      borderRadius: '8px',
                                      fontSize: isMobile ? '12px' : '14px'
                                    }}
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                  <button
                                    onClick={() => downloadFile(String(children), `code.${match[1]}`)}
                                    style={styles.downloadButton}
                                  >
                                    📥
                                  </button>
                                </div>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              )
                            },
                            table({ children }) {
                              return (
                                <div style={styles.tableWrapper}>
                                  <table style={styles.table}>{children}</table>
                                </div>
                              )
                            },
                            p({ children }) {
                              return <p style={styles.paragraph}>{children}</p>
                            },
                            h1({ children }) {
                              return <h1 style={styles.heading1}>{children}</h1>
                            },
                            h2({ children }) {
                              return <h2 style={styles.heading2}>{children}</h2>
                            },
                            ul({ children }) {
                              return <ul style={styles.list}>{children}</ul>
                            },
                            li({ children }) {
                              return <li style={styles.listItem}>{children}</li>
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div style={styles.messageFooter}>
                        <span style={styles.messageTime}>
                          {format(msg.createdAt, 'HH:mm')}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}
                >
                  <div style={styles.assistantAvatar}>🤖</div>
                  <div style={{ ...styles.message, ...styles.assistantMessage }}>
                    <div style={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Galactic Input */}
        <footer style={styles.footer}>
          <GalacticInput onSubmit={askJ369} loading={loading} />
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.errorMessage}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </footer>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        @keyframes galaxyGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,102,255,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,102,255,0.5); }
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #0066ff rgba(255,255,255,0.1);
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        
        *::-webkit-scrollbar-thumb {
          background: #0066ff;
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: #0055cc;
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    background: 'radial-gradient(circle at 50% 50%, #0a0f1e, #050713)',
    color: '#fff',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  sidebar: {
    height: '100vh',
    background: 'rgba(10,15,30,0.95)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    left: 0,
    top: 0,
  },
  sidebarHeader: {
    padding: '1rem',
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  closeSidebar: {
    padding: '0.5rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.2rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.1)',
    },
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
    transition: 'all 0.2s',
    ':hover': {
      background: '#0055cc',
      transform: 'scale(1.02)',
    },
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
    outline: 'none',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: '#0066ff',
      boxShadow: '0 0 0 2px rgba(0,102,255,0.2)',
    },
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
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  },
  activeSession: {
    background: 'rgba(0,102,255,0.2)',
    borderLeft: '3px solid #0066ff',
  },
  sessionInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  sessionTitle: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    borderRadius: '4px',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255,68,68,0.2)',
    },
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  userInfo: {
    display: 'flex',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'margin-left 0.3s ease, width 0.3s ease',
  },
  header: {
    padding: '1rem',
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  openSidebar: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  },
  logo: {
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    textShadow: '0 0 10px #0066ff',
    transition: 'text-shadow 0.3s',
    ':hover': {
      textShadow: '0 0 20px #0066ff',
    },
  },
  headerRight: {
    marginLeft: 'auto',
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
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  welcomeEmoji: {
    fontSize: '5rem',
    marginBottom: '1rem',
    display: 'inline-block',
  },
  welcomeTitle: {
    fontSize: '3rem',
    margin: 0,
    background: 'linear-gradient(135deg, #fff, #aaddff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem',
    fontWeight: 900,
  },
  welcomeText: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '2rem',
  },
  suggestions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.5rem',
    width: '100%',
  },
  suggestionButton: {
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
    ':hover': {
      background: 'rgba(0,102,255,0.2)',
      borderColor: '#0066ff',
    },
  },
  messagesList: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '1.5rem',
    gap: '1rem',
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
    boxShadow: '0 4px 10px rgba(0,102,255,0.3)',
    cursor: 'pointer',
  },
  message: {
    maxWidth: '70%',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    position: 'relative' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
    lineHeight: 1.6,
    fontSize: '1rem',
  },
  paragraph: {
    margin: '0.5rem 0',
  },
  heading1: {
    fontSize: '1.8rem',
    margin: '1rem 0 0.5rem',
  },
  heading2: {
    fontSize: '1.4rem',
    margin: '0.8rem 0 0.4rem',
  },
  list: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
  },
  listItem: {
    margin: '0.3rem 0',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    margin: '1rem 0',
  },
  table: {
    borderCollapse: 'collapse' as const,
    width: '100%',
    fontSize: '0.9rem',
    '& th, & td': {
      border: '1px solid rgba(255,255,255,0.2)',
      padding: '0.5rem',
      textAlign: 'left' as const,
    },
    '& th': {
      background: 'rgba(255,255,255,0.1)',
      fontWeight: 600,
    },
    '& tr:nth-child(even)': {
      background: 'rgba(255,255,255,0.05)',
    },
  },
  messageFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.6,
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
    fontSize: '0.8rem',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.3)',
    },
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
