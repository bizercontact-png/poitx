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

// ========== Types ==========
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  sources?: string[]
  thinking?: string
  files?: { name: string; url: string; type: string }[]
}

type Session = {
  id: string
  title: string
  createdAt: Date
  type: 'chat' | 'project'
  tags?: string[]
  messages?: Message[]
}

type Gem = {
  id: string
  name: string
  icon: string
  description: string
  color: string
  prompt: string
}

export default function J369Page() {
  // ========== State ==========
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'project'>('all')
  const [isDragging, setIsDragging] = useState(false)
  const [showThinking, setShowThinking] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ========== Gems ==========
  const gems: Gem[] = [
    { 
      id: '1', 
      name: 'Recipe Genie', 
      icon: '🍳', 
      description: 'از مواد خونه دستور پخت بده',
      color: '#ff6b6b',
      prompt: 'با استفاده از این مواد غذایی، یه دستور پخت خوشمزه بهم بده:'
    },
    { 
      id: '2', 
      name: 'Travel Planner', 
      icon: '✈️', 
      description: 'برنامه سفر هوشمند',
      color: '#4ecdc4',
      prompt: 'یه برنامه سفر کامل برام بنویس برای مقصد:'
    },
    { 
      id: '3', 
      name: 'Code Wizard', 
      icon: '🧙', 
      description: 'تولید و دیباگ کد',
      color: '#45b7d1',
      prompt: 'کد زیر رو بررسی کن و بهینه‌ش کن:'
    },
    { 
      id: '4', 
      name: 'Data Analyst', 
      icon: '📊', 
      description: 'تحلیل داده و نمودار',
      color: '#96ceb4',
      prompt: 'این داده‌ها رو تحلیل کن و نتیجه رو به صورت نمودار توضیح بده:'
    },
  ]

  // ========== Refs ==========
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

  // ========== Auto-scroll ==========
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ========== Device Detection ==========
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
      setShowSidebar(width >= 1024)
      setSidebarWidth(width >= 1024 ? (width < 1280 ? 240 : 280) : 280)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // ========== Resizable Sidebar ==========
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // ========== Click Outside (Mobile) ==========
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && showSidebar && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, showSidebar])

  // ========== Load Sessions ==========
  useEffect(() => {
    const saved = localStorage.getItem('j369-sessions')
    if (saved) {
      try {
        setSessions(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse sessions', e)
      }
    } else {
      const demoSessions: Session[] = [
        { id: '1', title: 'تحقیق درباره سیاه‌چاله‌ها', createdAt: new Date(), type: 'project', tags: ['فضا', 'فیزیک'] },
        { id: '2', title: 'برنامه React', createdAt: new Date(Date.now() - 3600000), type: 'project', tags: ['کدنویسی', 'React'] },
        { id: '3', title: 'سفر به مریخ', createdAt: new Date(Date.now() - 7200000), type: 'chat', tags: ['سفر', 'فضا'] },
      ]
      setSessions(demoSessions)
      localStorage.setItem('j369-sessions', JSON.stringify(demoSessions))
    }
  }, [])

  // ========== Create New Chat ==========
  const createNewChat = useCallback(() => {
    const newSessionId = Date.now().toString()
    const newSession: Session = {
      id: newSessionId,
      title: 'چت جدید ' + format(new Date(), 'yyyy/MM/dd HH:mm'),
      createdAt: new Date(),
      type: 'chat',
      messages: []
    }

    setSessions(prev => [newSession, ...prev])
    localStorage.setItem('j369-sessions', JSON.stringify([newSession, ...sessions]))
    setCurrentSessionId(newSessionId)
    setMessages([])
    if (isMobile) setShowSidebar(false)
  }, [sessions, isMobile])

  // ========== Load Session ==========
  const loadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    // TODO: Load messages from Supabase
    setMessages([])
    if (isMobile) setShowSidebar(false)
  }

  // ========== Delete Session ==========
  const deleteSession = (sessionId: string) => {
    const filtered = sessions.filter(s => s.id !== sessionId)
    setSessions(filtered)
    localStorage.setItem('j369-sessions', JSON.stringify(filtered))
    if (currentSessionId === sessionId) {
      createNewChat()
    }
  }

  // ========== Ask J_369 ==========
  const askJ369 = async (input: string, files: File[]) => {
    if (!input.trim() || loading) return

    setError(null)

    // Create file previews for messages
    const filePreviews = files.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type
    }))

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date(),
      files: filePreviews
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

      if (!res.ok) throw new Error(data.error)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
        sources: data.sources,
        thinking: data.thinking
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
  }

  // ========== Handle Gem Click ==========
  const handleGemClick = (gem: Gem) => {
    askJ369(gem.prompt, [])
  }

  // ========== Copy to Clipboard ==========
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ========== Download File ==========
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ========== Filter Sessions ==========
  const filteredSessions = sessions
    .filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(s => {
      if (activeTab === 'all') return true
      if (activeTab === 'chat') return s.type === 'chat'
      if (activeTab === 'project') return s.type === 'project'
      return true
    })

  return (
    <div style={styles.container}>
      {/* ========== Sidebar ========== */}
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
              width: isMobile ? '280px' : sidebarWidth,
              position: isMobile ? 'fixed' : 'relative',
              zIndex: 200,
            }}
          >
            {/* Sidebar Header */}
            <div style={styles.sidebarHeader}>
              {isMobile && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSidebar(false)}
                  style={styles.closeSidebar}
                >
                  ←
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createNewChat}
                style={styles.newChatButton}
              >
                + New Chat
              </motion.button>
            </div>

            {/* Tabs */}
            <div style={styles.tabContainer}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('all')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'all' ? styles.activeTab : {})
                }}
              >
                📋 همه
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('chat')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'chat' ? styles.activeTab : {})
                }}
              >
                💬 چت‌ها
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('project')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'project' ? styles.activeTab : {})
                }}
              >
                🚀 پروژه‌ها
              </motion.button>
            </div>

            {/* Search */}
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="جستجو در مکالمات و تگ‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  style={styles.clearSearch}
                >
                  ×
                </motion.button>
              )}
            </div>

            {/* Sessions List */}
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
                      <div style={styles.sessionTitle}>
                        {session.type === 'project' ? '🚀 ' : '💬 '}
                        {session.title}
                      </div>
                      <div style={styles.sessionMeta}>
                        <span style={styles.sessionDate}>
                          {format(session.createdAt, 'HH:mm')}
                        </span>
                        {session.tags && session.tags.length > 0 && (
                          <div style={styles.tagContainer}>
                            {session.tags.map(tag => (
                              <span key={tag} style={styles.tag}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2, color: '#ff4444' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.id)
                      }}
                      style={styles.deleteSession}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Gems */}
            <div style={styles.gemsSection}>
              <h3 style={styles.gemsTitle}>
                <span style={styles.gemsIcon}>💎</span>
                Gems
              </h3>
              <div style={styles.gemsList}>
                {gems.map(gem => (
                  <motion.button
                    key={gem.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGemClick(gem)}
                    style={{
                      ...styles.gemButton,
                      borderLeft: `3px solid ${gem.color}`,
                    }}
                  >
                    <span style={styles.gemIcon}>{gem.icon}</span>
                    <div style={styles.gemInfo}>
                      <span style={styles.gemName}>{gem.name}</span>
                      <span style={styles.gemDesc}>{gem.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div style={styles.sidebarFooter}>
              <AuthStatus />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resizer */}
      {!isMobile && showSidebar && (
        <div
          ref={resizerRef}
          onMouseDown={() => setIsDragging(true)}
          style={styles.resizer}
        />
      )}

      {/* ========== Main Chat Area ========== */}
      <div style={{
        ...styles.main,
        marginLeft: showSidebar && !isMobile ? `${sidebarWidth}px` : '0',
        width: showSidebar && !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%',
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
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowThinking(!showThinking)}
              style={styles.thinkingToggle}
              title={showThinking ? 'مخفی کردن تفکر' : 'نمایش تفکر'}
            >
              🧠
            </motion.button>
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
                  duration: 3,
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
                  'تحقیق درباره سیاه‌چاله‌ها',
                  'برنامه پایتون برای محاسبه اعداد اول',
                  'شعر کهکشانی',
                  'جدول مقایسه سیارات'
                ].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
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
                      {/* Thinking Process */}
                      {msg.thinking && showThinking && (
                        <div style={styles.thinkingBubble}>
                          <strong>🧠 فرآیند تفکر:</strong>
                          <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                            {msg.thinking}
                          </p>
                        </div>
                      )}

                      {/* Files */}
                      {msg.files && msg.files.length > 0 && (
                        <div style={styles.fileList}>
                          {msg.files.map((file, idx) => (
                            <div key={idx} style={styles.fileItem}>
                              <span style={styles.fileIcon}>
                                {file.type.startsWith('image/') ? '🖼️' : '📄'}
                              </span>
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={styles.fileLink}
                              >
                                {file.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Content */}
                      <div style={styles.messageContent}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              const codeId = `code-${msg.id}-${Math.random()}`
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
                                  <div style={styles.codeActions}>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => copyToClipboard(String(children), codeId)}
                                      style={styles.codeButton}
                                      title="کپی"
                                    >
                                      {copiedId === codeId ? '✅' : '📋'}
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => downloadFile(String(children), `code.${match[1]}`)}
                                      style={styles.codeButton}
                                      title="دانلود"
                                    >
                                      📥
                                    </motion.button>
                                  </div>
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

                      {/* Sources */}
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

                      {/* Message Footer */}
                      <div style={styles.messageFooter}>
                        <span style={styles.messageTime}>
                          {format(msg.createdAt, 'HH:mm')}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
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
          <GalacticInput 
            onSubmit={askJ369} 
            loading={loading}
            placeholder="برای J_369 بنویس... (فایل هم می‌تونی آپلود کنی)"
            maxLength={4000}
          />
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

      {/* ========== Global Styles ========== */}
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
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        
        *::-webkit-scrollbar-thumb {
          background: #0066ff;
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: #0055cc;
        }
      `}</style>
    </div>
  )
}

// ========== Styles ==========
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
    overflow: 'hidden',
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
  tabContainer: {
    display: 'flex',
    padding: '0.5rem',
    gap: '0.3rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    padding: '0.4rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  activeTab: {
    background: 'rgba(0,102,255,0.2)',
    color: '#fff',
  },
  searchContainer: {
    padding: '0.75rem',
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '1.25rem',
    top: '1.25rem',
    opacity: 0.5,
    fontSize: '0.9rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.5rem 0.5rem 2rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  clearSearch: {
    position: 'absolute' as const,
    right: '1.25rem',
    top: '1.25rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    opacity: 0.7,
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
  sessionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  sessionDate: {
    flexShrink: 0,
  },
  tagContainer: {
    display: 'flex',
    gap: '0.3rem',
    overflow: 'hidden',
  },
  tag: {
    background: 'rgba(0,102,255,0.2)',
    padding: '0.1rem 0.3rem',
    borderRadius: '4px',
    fontSize: '0.6rem',
    whiteSpace: 'nowrap' as const,
  },
  deleteSession: {
    background: 'transparent',
    border: 'none',
    color: '#ff4444',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  gemsSection: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  gemsTitle: {
    fontSize: '0.8rem',
    margin: '0 0 0.75rem',
    color: '#aaddff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  gemsIcon: {
    fontSize: '1rem',
  },
  gemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  gemButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    textAlign: 'left' as const,
    width: '100%',
  },
  gemIcon: {
    fontSize: '1.2rem',
  },
  gemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.1rem',
  },
  gemName: {
    fontWeight: 500,
  },
  gemDesc: {
    fontSize: '0.7rem',
    opacity: 0.7,
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  resizer: {
    width: '4px',
    height: '100vh',
    cursor: 'ew-resize',
    background: 'transparent',
    position: 'fixed' as const,
    left: 'var(--sidebar-width)',
    top: 0,
    zIndex: 300,
  },
  main: {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'margin-left 0.2s ease, width 0.2s ease',
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
  },
  logo: {
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#fff',
    textShadow: '0 0 10px #0066ff',
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
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  suggestionButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  thinkingBubble: {
    background: 'rgba(0,0,0,0.3)',
    padding: '0.5rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    borderLeft: '3px solid #ffaa00',
  },
  fileList: {
    marginBottom: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
  },
  fileIcon: {
    fontSize: '1rem',
  },
  fileLink: {
    color: '#aaddff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    ':hover': {
      textDecoration: 'underline',
    },
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
  },
  codeActions: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    display: 'flex',
    gap: '0.3rem',
  },
  codeButton: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
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
    marginTop: '0.5rem',
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
