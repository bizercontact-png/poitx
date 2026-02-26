'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import AuthStatus from '../components/AuthStatus'

type Session = {
  id: string
  title: string
  createdAt: Date
  type: 'chat' | 'project' // شخصی‌سازی تب (ChatGPT)
  tags?: string[]
}

type Gem = {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

export default function J369Page() {
  // ========== State ==========
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280) // برای resizable (ChatGPT)
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'project'>('all')
  const [isDragging, setIsDragging] = useState(false)

  // ========== Gems (اپلیکیشن‌های کوچک - از Gemini) ==========
  const gems: Gem[] = [
    { id: '1', name: 'Recipe Genie', icon: '🍳', description: 'از مواد خونه دستور پخت بده', color: '#ff6b6b' },
    { id: '2', name: 'Travel Planner', icon: '✈️', description: 'برنامه سفر هوشمند', color: '#4ecdc4' },
    { id: '3', name: 'Code Wizard', icon: '🧙', description: 'تولید و دیباگ کد', color: '#45b7d1' },
    { id: '4', name: 'Data Analyst', icon: '📊', description: 'تحلیل داده و نمودار', color: '#96ceb4' },
  ]

  // ========== Refs ==========
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

  // ========== تشخیص پلتفرم ==========
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

  // ========== Resizable Sidebar (مثل ChatGPT) ==========
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

  // ========== کلیک خارج از سایدبار (موبایل) ==========
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && showSidebar && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, showSidebar])

  // ========== لود سشن‌ها از localStorage ==========
  useEffect(() => {
    const saved = localStorage.getItem('j369-sessions')
    if (saved) {
      try {
        setSessions(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse sessions', e)
      }
    } else {
      // نمونه سشن برای تست
      const demoSessions: Session[] = [
        { id: '1', title: 'تحقیق درباره سیاه‌چاله‌ها', createdAt: new Date(), type: 'project', tags: ['فضا', 'فیزیک'] },
        { id: '2', title: 'برنامه React', createdAt: new Date(Date.now() - 3600000), type: 'project', tags: ['کدنویسی', 'React'] },
        { id: '3', title: 'سفر به مریخ', createdAt: new Date(Date.now() - 7200000), type: 'chat', tags: ['سفر', 'فضا'] },
      ]
      setSessions(demoSessions)
      localStorage.setItem('j369-sessions', JSON.stringify(demoSessions))
    }
  }, [])

  // ========== ایجاد چت جدید ==========
  const createNewChat = useCallback(() => {
    const newSessionId = Date.now().toString()
    const newSession: Session = {
      id: newSessionId,
      title: 'Chat ' + format(new Date(), 'yyyy/MM/dd HH:mm'),
      createdAt: new Date(),
      type: 'chat'
    }

    setSessions(prev => [newSession, ...prev])
    localStorage.setItem('j369-sessions', JSON.stringify([newSession, ...sessions]))
    setCurrentSessionId(newSessionId)
    if (isMobile) setShowSidebar(false)
  }, [sessions, isMobile])

  // ========== فیلتر سشن‌ها بر اساس جستجو و تب فعال ==========
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
      {/* ========== سایدبار هوشمند (ChatGPT + Gemini) ========== */}
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
            {/* Header سایدبار */}
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

            {/* ===== نوار تب‌ها (ChatGPT Tab Groups) ===== */}
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

            {/* ===== جستجوی پیشرفته ===== */}
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

            {/* ===== لیست سشن‌ها با Container Queries ===== */}
            <div style={styles.sessionsList}>
              <AnimatePresence>
                {filteredSessions.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setCurrentSessionId(session.id)
                      if (isMobile) setShowSidebar(false)
                    }}
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
                        // حذف سشن
                      }}
                      style={styles.deleteSession}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ===== Gems (اپلیکیشن‌های کوچک - از Gemini) ===== */}
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

            {/* ===== Footer با AuthStatus ===== */}
            <div style={styles.sidebarFooter}>
              <AuthStatus />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Resizer برای سایدبار (ChatGPT) ========== */}
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
            {!isMobile && <AuthStatus />}
          </div>
        </header>

        {/* Main Content (بعداً تکمیل میشه) */}
        <main style={styles.mainContent}>
          <div style={styles.welcomeContainer}>
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
                'برنامه پایتون',
                'شعر کهکشانی',
              ].map((suggestion, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.suggestionButton}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ========== استایل‌های گلوبال ========== */}
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
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        
        *::-webkit-scrollbar-thumb {
          background: #0066ff;
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}

// ========== استایل‌ها با CSS Variables برای تم ==========
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    background: 'radial-gradient(circle at 50% 50%, #0a0f1e, #050713)',
    color: '#fff',
    overflow: 'hidden',
    position: 'relative' as const,
    '--primary': '#0066ff',
    '--primary-dark': '#0055cc',
    '--bg-sidebar': 'rgba(10,15,30,0.95)',
    '--border-color': 'rgba(255,255,255,0.1)',
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
    transition: 'all 0.2s',
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
    transition: 'all 0.2s',
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
    transition: 'all 0.2s',
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
    transition: 'background 0.2s',
    ':hover': {
      background: '#0066ff',
    },
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
  },
  mainContent: {
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
}
