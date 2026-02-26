'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import GalacticInput from '../components/GalacticInput'
import AuthStatus from '../components/AuthStatus'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  sessionId?: string
  sources?: string[]  // برای نمایش منابع (مثل Perplexity)
  thinking?: string   // برای نمایش فرآیند تفکر (مثل Grok)
}

type Agent = {
  name: string
  role: string
  status: 'thinking' | 'searching' | 'calculating' | 'creating' | 'done' | 'debating'
  message?: string
  color: string
  icon: string
  confidence?: number
}

type Session = {
  id: string
  title: string
  createdAt: Date
  lastMessage?: string
}

type VisualElement = {
  type: 'chart' | 'timeline' | 'gallery' | 'code' | 'table'
  data: any
  layout?: 'grid' | 'list' | 'card'
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
  const [agents, setAgents] = useState<Agent[]>([
    { 
      name: 'کاپیتان', 
      role: 'هماهنگ‌کننده', 
      status: 'thinking', 
      color: '#0066ff', 
      icon: '👨‍✈️',
      message: 'تحلیل سوال و تقسیم وظایف...'
    },
    { 
      name: 'هارپر', 
      role: 'محقق', 
      status: 'searching', 
      color: '#00aaff', 
      icon: '🔍',
      message: 'جستجو در منابع لحظه‌ای...'
    },
    { 
      name: 'بنجامین', 
      role: 'منطق‌دان', 
      status: 'calculating', 
      color: '#aa00ff', 
      icon: '🧮',
      message: 'بررسی محاسبات و استدلال...'
    },
    { 
      name: 'لوکاس', 
      role: 'خلاق', 
      status: 'creating', 
      color: '#ffaa00', 
      icon: '🎨',
      message: 'ایده‌پردازی خلاقانه...'
    },
  ])
  const [visualElements, setVisualElements] = useState<VisualElement[]>([])
  const [showThinking, setShowThinking] = useState(true)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // تشخیص موبایل
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowSidebar(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // کلیک خارج از سایدبار
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && showSidebar && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, showSidebar])

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
    setVisualElements([])
  }

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setMessages([])
    setVisualElements([])
    setError(null)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const deleteSession = (sessionId: string) => {
    const filtered = sessions.filter(s => s.id !== sessionId)
    setSessions(filtered)
    localStorage.setItem('j369-sessions', JSON.stringify(filtered))

    if (currentSessionId === sessionId) {
      createNewChat()
    }
  }

  // شبیه‌سازی فرآیند تفکر عوامل (مثل Grok)
  const simulateAgentThinking = async () => {
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'thinking' })))

    // کاپیتان تحلیل می‌کنه
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.name === 'کاپیتان' 
          ? { ...agent, status: 'done', message: 'تحلیل کامل شد. وظایف به عوامل دیگر ارسال شد.' }
          : agent
      ))
    }, 1000)

    // هارپر جستجو می‌کنه
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.name === 'هارپر' 
          ? { ...agent, status: 'done', message: '۳ منبع معتبر پیدا شد.' }
          : agent
      ))
    }, 2000)

    // بنجامین محاسبه می‌کنه
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.name === 'بنجامین' 
          ? { ...agent, status: 'done', message: 'محاسبات با دقت ۹۸٪ انجام شد.' }
          : agent
      ))
    }, 1500)

    // لوکاس خلاقیت به خرج می‌ده
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.name === 'لوکاس' 
          ? { ...agent, status: 'done', message: '۲ ایده خلاقانه ارائه شد.' }
          : agent
      ))
    }, 2500)

    // بحث گروهی (مثل Grok)
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.name === 'کاپیتان' 
          ? { ...agent, status: 'debating', message: 'بحث گروهی بین عوامل در حال انجام...' }
          : { ...agent, status: 'debating', message: 'در حال بحث با سایر عوامل...' }
      ))
    }, 3000)

    // پایان بحث
    setTimeout(() => {
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'done' })))
    }, 4000)
  }

  // شبیه‌سازی Visual Layout (مثل Gemini)
  const generateVisualLayout = (response: string) => {
    // تشخیص نوع پاسخ و ایجاد عناصر بصری
    if (response.includes('جدول') || response.includes('table')) {
      setVisualElements([
        {
          type: 'table',
          data: {
            headers: ['ستون ۱', 'ستون ۲', 'ستون ۳'],
            rows: [
              ['ردیف ۱', 'داده ۱', 'داده ۲'],
              ['ردیف ۲', 'داده ۳', 'داده ۴'],
            ]
          },
          layout: 'grid'
        }
      ])
    } else if (response.includes('نمودار') || response.includes('chart')) {
      setVisualElements([
        {
          type: 'chart',
          data: {
            labels: ['فروردین', 'اردیبهشت', 'خرداد'],
            values: [30, 45, 60]
          },
          layout: 'card'
        }
      ])
    }
  }

  const askJ369 = async (input: string, files: File[]) => {
    if (!input.trim() || loading) return

    setError(null)
    setVisualElements([])
    await simulateAgentThinking()

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

      // ایجاد عناصر بصری (مثل Gemini)
      generateVisualLayout(data.response)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
        sessionId: data.sessionId,
        sources: data.sources || ['منبع ۱', 'منبع ۲'], // مثل Perplexity
        thinking: data.thinking // مثل Grok
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
      {/* سایدبار پیشرفته (مثل ChatGPT + Gemini) */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              ...styles.sidebar,
              position: isMobile ? 'fixed' : 'relative',
              zIndex: 200,
            }}
          >
            <div style={styles.sidebarHeader}>
              <button onClick={() => setShowSidebar(false)} style={styles.closeSidebar}>
                ←
              </button>
              <button onClick={createNewChat} style={styles.newChatButton}>
                + New Chat
              </button>
            </div>

            {/* جستجوی پیشرفته در تاریخچه (مثل Gemini) */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="جستجوی مکالمات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* لیست سشن‌ها با انیمیشن */}
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* بخش Gems (اپلیکیشن‌های کوچک - مثل Gemini) */}
            <div style={styles.gemsSection}>
              <h3 style={styles.gemsTitle}>💎 Gems</h3>
              <div style={styles.gemsList}>
                <button 
                  onClick={() => setActiveTool('recipe')}
                  style={{
                    ...styles.gemButton,
                    ...(activeTool === 'recipe' ? styles.activeGem : {})
                  }}
                >
                  🍳 Recipe Genie
                </button>
                <button 
                  onClick={() => setActiveTool('travel')}
                  style={{
                    ...styles.gemButton,
                    ...(activeTool === 'travel' ? styles.activeGem : {})
                  }}
                >
                  ✈️ Travel Planner
                </button>
                <button 
                  onClick={() => setActiveTool('code')}
                  style={{
                    ...styles.gemButton,
                    ...(activeTool === 'code' ? styles.activeGem : {})
                  }}
                >
                  💻 Code Assistant
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div style={{
        ...styles.main,
        marginLeft: showSidebar && !isMobile ? '280px' : '0',
        width: showSidebar && !isMobile ? 'calc(100% - 280px)' : '100%',
      }}>
        {/* Header با وضعیت کاربر و Temporary Chat toggle (مثل Gemini) */}
        <header style={styles.header}>
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              ...styles.openSidebar,
              opacity: showSidebar ? 0 : 1,
              pointerEvents: showSidebar ? 'none' : 'auto',
            }}
          >
            ☰
          </button>
          <Link href="/" style={styles.logo}>
            🌌 POITX
          </Link>
          <div style={styles.headerRight}>
            <button 
              onClick={() => setShowThinking(!showThinking)}
              style={styles.thinkingToggle}
              title={showThinking ? 'مخفی کردن تفکر عوامل' : 'نمایش تفکر عوامل'}
            >
              🧠
            </button>
            <AuthStatus />
            <span style={styles.badge}>J_369</span>
          </div>
        </header>

        {/* نمایش زنده عوامل (مثل Grok) - فقط اگه showThinking فعال باشه */}
        {showThinking && loading && (
          <div style={styles.agentsContainer}>
            <AnimatePresence>
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    ...styles.agentItem,
                    borderLeft: `3px solid ${agent.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: agent.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {agent.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{agent.name}</strong>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {agent.status === 'done' && '✅'}
                          {agent.status === 'thinking' && '🤔'}
                          {agent.status === 'searching' && '🔍'}
                          {agent.status === 'calculating' && '🧮'}
                          {agent.status === 'creating' && '🎨'}
                          {agent.status === 'debating' && '💬'}
                        </span>
                      </div>
                      {agent.message && (
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
                          {agent.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {agent.status !== 'done' && agent.status !== 'debating' && (
                    <div style={styles.agentProgress}>
                      <motion.div
                        animate={{
                          width: ['0%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                        style={{
                          height: '2px',
                          background: agent.color,
                          borderRadius: '1px',
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Messages */}
        <main style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.welcomeContainer}
            >
              <h1 style={styles.welcomeTitle}>🤖 J_369</h1>
              <p style={styles.welcomeText}>
                هوش مصنوعی کهکشان POITX با معماری چندعاملی. چطور می‌تونم کمک کنم؟
              </p>
              <div style={styles.suggestions}>
                {[
                  'تحقیق عمیق درباره هوش مصنوعی',
                  'برنامه‌نویسی یک اپ React',
                  'تحلیل داده‌های فروش',
                  'شعر کهکشانی',
                  'برنامه سفر به مریخ',
                  'جدول مقایسه غول‌های AI'
                ].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => askJ369(suggestion, [])}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
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
                        {/* نمایش فرآیند تفکر (مثل Grok) - اگه وجود داشت */}
                        {msg.thinking && showThinking && (
                          <div style={styles.thinkingBubble}>
                            <strong>🧠 فرآیند تفکر:</strong>
                            <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                              {msg.thinking}
                            </p>
                          </div>
                        )}

                        {/* محتوای اصلی با Markdown */}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              const language = match ? match[1] : 'plaintext'
                              return (
                                <div style={{ position: 'relative' }}>
                                  <pre style={{
                                    background: '#1e1e1e',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    overflowX: 'auto',
                                    margin: '0.5rem 0',
                                    border: '1px solid #333',
                                  }}>
                                    <code className={`language-${language}`} {...props}>
                                      {String(children).replace(/\n$/, '')}
                                    </code>
                                  </pre>
                                  <button
                                    onClick={() => downloadFile(String(children), `code.${language}`)}
                                    style={{
                                      position: 'absolute',
                                      top: '0.5rem',
                                      right: '0.5rem',
                                      padding: '0.2rem 0.5rem',
                                      background: 'rgba(255,255,255,0.2)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem',
                                    }}
                                  >
                                    📥 دانلود
                                  </button>
                                </div>
                              )
                            },
                            table({ children }) {
                              return (
                                <div style={{ overflowX: 'auto' }}>
                                  <table style={{
                                    borderCollapse: 'collapse',
                                    width: '100%',
                                    margin: '1rem 0',
                                  }}>
                                    {children}
                                  </table>
                                </div>
                              )
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>

                        {/* عناصر بصری (مثل Gemini) */}
                        {msg.role === 'assistant' && visualElements.length > 0 && (
                          <div style={styles.visualContainer}>
                            {visualElements.map((element, idx) => (
                              <div key={idx} style={styles.visualElement}>
                                {element.type === 'table' && (
                                  <table style={styles.table}>
                                    <thead>
                                      <tr>
                                        {element.data.headers.map((h: string, i: number) => (
                                          <th key={i}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {element.data.rows.map((row: any[], i: number) => (
                                        <tr key={i}>
                                          {row.map((cell, j) => (
                                            <td key={j}>{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                                {element.type === 'chart' && (
                                  <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                  }}>
                                    <p style={{ textAlign: 'center' }}>
                                      📊 {element.data.labels.join(' - ')}: {element.data.values.join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* منابع (مثل Perplexity) */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div style={styles.sourcesContainer}>
                            <strong>📚 منابع:</strong>
                            <ul style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
                              {msg.sources.map((source, idx) => (
                                <li key={idx}>{source}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div style={styles.messageFooter}>
                        <span style={styles.messageTime}>
                          {format(msg.createdAt, 'HH:mm')}
                        </span>
                      </div>
                    </div>
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

      {/* استایل‌های گلوبال */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        pre {
          margin: 0.5rem 0 !important;
        }
        
        code {
          font-family: 'Fira Code', 'Courier New', monospace !important;
          font-size: 0.9rem !important;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        th, td {
          border: 1px solid #444;
          padding: 0.5rem;
          text-align: left;
        }
        
        th {
          background: #2a2a2a;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #0066ff rgba(255,255,255,0.1);
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
        }
        
        *::-webkit-scrollbar-thumb {
          background: #0066ff;
          border-radius: 4px;
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
    position: 'relative' as const,
  },
  sidebar: {
    width: '280px',
    height: '100vh',
    background: 'rgba(20, 25, 40, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    left: 0,
    top: 0,
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
    borderRadius: '4px',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255,68,68,0.2)',
    },
  },
  gemsSection: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  gemsTitle: {
    fontSize: '0.9rem',
    margin: '0 0 0.5rem',
    color: '#aaddff',
  },
  gemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  gemButton: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    textAlign: 'left' as const,
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(0,102,255,0.2)',
      borderColor: '#0066ff',
    },
  },
  activeGem: {
    background: 'rgba(0,102,255,0.3)',
    borderColor: '#0066ff',
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
    transition: 'opacity 0.3s',
    padding: '0.5rem',
    borderRadius: '8px',
    ':hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    textDecoration: 'none',
    textShadow: '0 0 10px #0066ff',
    transition: 'text-shadow 0.3s',
    ':hover': {
      textShadow: '0 0 20px #0066ff',
    },
  },
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  thinkingToggle: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    padding: '0.3rem 0.8rem',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    ':hover': {
      background: '#0066ff',
      borderColor: '#0066ff',
    },
  },
  badge: {
    background: '#0066ff',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  agentsContainer: {
    padding: '1rem',
    background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  agentItem: {
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    position: 'relative' as const,
  },
  agentProgress: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
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
  },
  message: {
    maxWidth: '70%',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    position: 'relative' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  userMessage: {
    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
    borderBottomRightRadius: '5px',
  },
  assistantMessage: {
    background: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: '5px',
  },
  messageContent: {
    marginBottom: '0.3rem',
    lineHeight: 1.6,
  },
  thinkingBubble: {
    background: 'rgba(0,0,0,0.3)',
    padding: '0.5rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    borderLeft: '3px solid #ffaa00',
  },
  visualContainer: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  visualElement: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  sourcesContainer: {
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: '0.9rem',
    opacity: 0.8,
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    '& th, & td': {
      border: '1px solid #444',
      padding: '0.5rem',
      textAlign: 'left' as const,
    },
    '& th': {
      background: '#2a2a2a',
    },
    '& tr:nth-child(even)': {
      background: 'rgba(255,255,255,0.05)',
    },
  },
}
