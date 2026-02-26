'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  sources?: string[]
  thinking?: string
  files?: { name: string; url: string; type: string }[]
}

type MessageListProps = {
  messages: Message[]
  loading: boolean
  showThinking: boolean
  isMobile: boolean
  onCopy: (text: string, id: string) => void
  onDownload: (content: string, filename: string) => void
  copiedId: string | null
}

export default function MessageList({ 
  messages, 
  loading, 
  showThinking, 
  isMobile,
  onCopy,
  onDownload,
  copiedId 
}: MessageListProps) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  // تابع تشخیص نوع محتوا برای نمایش ویژه (مثل جدول، نمودار)
  const detectContentType = (content: string) => {
    if (content.includes('|') && content.includes('\n')) {
      // احتمالاً جدول مارک‌داون
      return 'table'
    }
    if (content.includes('```') && content.includes('\n')) {
      return 'code'
    }
    return 'text'
  }

  // تابع برای فرمت‌دهی ویژه جدول‌ها
  const renderEnhancedTable = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim())
    if (lines.length < 2) return null

    const headers = lines[0].split('|').filter(h => h.trim())
    const rows = lines.slice(2).map(l => l.split('|').filter(c => c.trim()))

    return (
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <AnimatePresence mode="popLayout">
        {messages.map((msg, index) => {
          const contentType = detectContentType(msg.content)
          const isLast = index === messages.length - 1

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: index * 0.05, 
                type: 'spring', 
                stiffness: 100,
                damping: 15
              }}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Avatar برای J_369 */}
              {msg.role === 'assistant' && (
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  style={styles.assistantAvatar}
                >
                  <span style={styles.avatarIcon}>🤖</span>
                </motion.div>
              )}

              {/* بسته پیام */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
                  ...(isLast ? styles.lastMessage : {})
                }}
              >
                {/* فرآیند تفکر (Thinking) - مثل Grok */}
                {msg.thinking && showThinking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={styles.thinkingBubble}
                  >
                    <div style={styles.thinkingHeader}>
                      <span style={styles.thinkingIcon}>🧠</span>
                      <span style={styles.thinkingTitle}>فرآیند تفکر</span>
                    </div>
                    <p style={styles.thinkingText}>{msg.thinking}</p>
                  </motion.div>
                )}

                {/* فایل‌های آپلود شده */}
                {msg.files && msg.files.length > 0 && (
                  <div style={styles.fileList}>
                    {msg.files.map((file, idx) => (
                      <motion.a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        style={styles.fileItem}
                      >
                        <span style={styles.fileIcon}>
                          {file.type.startsWith('image/') ? '🖼️' : '📄'}
                        </span>
                        <span style={styles.fileName}>{file.name}</span>
                      </motion.a>
                    ))}
                  </div>
                )}

                {/* محتوای اصلی پیام */}
                <div style={styles.messageContent}>
                  {contentType === 'table' && renderEnhancedTable(msg.content)}
                  
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // کدهای تخصصی
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeId = `code-${msg.id}-${Math.random()}`
                        const isExpanded = expandedCode === codeId
                        
                        return match ? (
                          <div style={styles.codeContainer}>
                            <div style={styles.codeHeader}>
                              <span style={styles.codeLanguage}>{match[1]}</span>
                              <div style={styles.codeActions}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setExpandedCode(isExpanded ? null : codeId)}
                                  style={styles.codeAction}
                                  title={isExpanded ? 'کوچک کردن' : 'بزرگ کردن'}
                                >
                                  {isExpanded ? '🔽' : '🔼'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onCopy(String(children), codeId)}
                                  style={styles.codeAction}
                                  title="کپی"
                                >
                                  {copiedId === codeId ? '✅' : '📋'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onDownload(String(children), `code.${match[1]}`)}
                                  style={styles.codeAction}
                                  title="دانلود"
                                >
                                  📥
                                </motion.button>
                              </div>
                            </div>
                            <pre style={{
                              ...styles.codeBlock,
                              maxHeight: isExpanded ? 'none' : '300px',
                              overflow: isExpanded ? 'visible' : 'auto',
                            }}>
                              <code className={className} {...props}>
                                {String(children).replace(/\n$/, '')}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className={className} style={styles.inlineCode} {...props}>
                            {children}
                          </code>
                        )
                      },

                      // جدول‌های ساده
                      table({ children }) {
                        return (
                          <div style={styles.tableWrapper}>
                            <table style={styles.table}>{children}</table>
                          </div>
                        )
                      },

                      // استایل‌های پیشرفته برای متن
                      h1({ children }) {
                        return <h1 style={styles.heading1}>{children}</h1>
                      },
                      h2({ children }) {
                        return <h2 style={styles.heading2}>{children}</h2>
                      },
                      h3({ children }) {
                        return <h3 style={styles.heading3}>{children}</h3>
                      },
                      p({ children }) {
                        return <p style={styles.paragraph}>{children}</p>
                      },
                      ul({ children }) {
                        return <ul style={styles.list}>{children}</ul>
                      },
                      li({ children }) {
                        return <li style={styles.listItem}>{children}</li>
                      },
                      blockquote({ children }) {
                        return <blockquote style={styles.blockquote}>{children}</blockquote>
                      },
                      a({ href, children }) {
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" style={styles.link}>
                            {children}
                          </a>
                        )
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* منابع (مثل Perplexity) */}
                {msg.sources && msg.sources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.sourcesContainer}
                  >
                    <div style={styles.sourcesHeader}>
                      <span style={styles.sourcesIcon}>📚</span>
                      <span style={styles.sourcesTitle}>منابع</span>
                    </div>
                    <ul style={styles.sourcesList}>
                      {msg.sources.map((source, idx) => (
                        <li key={idx} style={styles.sourceItem}>{source}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* فوتر پیام با زمان */}
                <div style={styles.messageFooter}>
                  <span style={styles.messageTime}>
                    {format(msg.createdAt, 'HH:mm', { locale: faIR })}
                  </span>
                  {msg.role === 'assistant' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={styles.copyMessage}
                      onClick={() => onCopy(msg.content, `msg-${msg.id}`)}
                      title="کپی پیام"
                    >
                      📋
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* ایندیکیتور تایپینگ (وقتی در حال بارگذاری هستیم) */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}
        >
          <div style={styles.assistantAvatar}>
            <span style={styles.avatarIcon}>🤖</span>
          </div>
          <div style={{ ...styles.message, ...styles.assistantMessage }}>
            <div style={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ========== Styles ==========
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    width: '100%',
  },
  messageWrapper: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
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
  avatarIcon: {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  message: {
    maxWidth: '70%',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    position: 'relative' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
  },
  userMessage: {
    background: '#0066ff',
    borderBottomRightRadius: '5px',
    marginLeft: 'auto',
  },
  assistantMessage: {
    background: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: '5px',
    backdropFilter: 'blur(10px)',
  },
  lastMessage: {
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 0 20px rgba(0,102,255,0.3)',
  },
  thinkingBubble: {
    background: 'rgba(255,170,0,0.1)',
    borderRadius: '12px',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid rgba(255,170,0,0.3)',
    overflow: 'hidden',
  },
  thinkingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  thinkingIcon: {
    fontSize: '1.2rem',
  },
  thinkingTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#ffaa00',
  },
  thinkingText: {
    margin: 0,
    fontSize: '0.9rem',
    opacity: 0.8,
    lineHeight: 1.6,
  },
  fileList: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  fileIcon: {
    fontSize: '1.2rem',
  },
  fileName: {
    fontSize: '0.9rem',
    wordBreak: 'break-all' as const,
  },
  messageContent: {
    lineHeight: 1.6,
    fontSize: '1rem',
  },
  codeContainer: {
    background: '#1e1e1e',
    borderRadius: '8px',
    margin: '0.5rem 0',
    overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  codeLanguage: {
    fontSize: '0.8rem',
    color: '#aaddff',
    textTransform: 'uppercase' as const,
  },
  codeActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  codeAction: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0.2rem 0.5rem',
  },
  codeBlock: {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: '#fff',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  inlineCode: {
    background: 'rgba(0,0,0,0.3)',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
  },
  heading1: {
    fontSize: '1.8rem',
    margin: '1rem 0 0.5rem',
  },
  heading2: {
    fontSize: '1.5rem',
    margin: '0.8rem 0 0.4rem',
  },
  heading3: {
    fontSize: '1.2rem',
    margin: '0.6rem 0 0.3rem',
  },
  paragraph: {
    margin: '0.5rem 0',
  },
  list: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
  },
  listItem: {
    margin: '0.3rem 0',
  },
  blockquote: {
    margin: '0.5rem 0',
    padding: '0.5rem 1rem',
    borderLeft: '4px solid #0066ff',
    background: 'rgba(0,102,255,0.1)',
    borderRadius: '0 8px 8px 0',
  },
  link: {
    color: '#aaddff',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
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
  sourcesContainer: {
    marginTop: '1rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  sourcesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  sourcesIcon: {
    fontSize: '1rem',
  },
  sourcesTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#aaddff',
  },
  sourcesList: {
    margin: 0,
    paddingLeft: '1.5rem',
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  sourceItem: {
    margin: '0.2rem 0',
  },
  messageFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  copyMessage: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0.2rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 1,
    },
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
