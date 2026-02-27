'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// بارگذاری پویا برای کامپوننت‌های سنگین
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  { ssr: false, loading: () => <div style={styles.codeLoading}>...</div> }
)

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: Date
  sources?: string[]
  thinking?: string
  files?: { name: string; url: string; type: string }[]
}

type MessageListProps = {
  messages: Message[]
  loading: boolean
  searchLoading?: boolean
  showThinking: boolean
  isMobile: boolean
  onCopy: (text: string, id: string) => void
  onDownload: (content: string, filename: string) => void
  copiedId: string | null
}

// بهینه‌سازی با React.memo
const MessageList = memo(function MessageList({
  messages,
  loading,
  searchLoading,
  showThinking,
  isMobile,
  onCopy,
  onDownload,
  copiedId
}: MessageListProps) {
  return (
    <AnimatePresence mode="popLayout">
      {/* پیام جستجو */}
      {searchLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={styles.searchMessage}
        >
          <span style={styles.searchIcon}>🔍</span>
          <span>در حال جستجو در وب...</span>
        </motion.div>
      )}

      {/* پیام‌ها */}
      {messages.map((msg, i) => (
        <MessageItem
          key={msg.id}
          msg={msg}
          index={i}
          showThinking={showThinking}
          isMobile={isMobile}
          onCopy={onCopy}
          onDownload={onDownload}
          copiedId={copiedId}
        />
      ))}

      {/* ایندیکیتور تایپینگ */}
      {loading && <TypingIndicator />}
    </AnimatePresence>
  )
})

// کامپوننت جداگانه برای هر پیام
const MessageItem = memo(function MessageItem({
  msg,
  index,
  showThinking,
  isMobile,
  onCopy,
  onDownload,
  copiedId
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: msg.role === 'user' ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      style={{
        display: 'flex',
        marginBottom: '1.5rem',
        gap: '1rem',
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
        {/* فرآیند تفکر */}
        {msg.thinking && showThinking && (
          <div style={styles.thinkingBubble}>
            <strong>🧠 فرآیند تفکر:</strong>
            <p style={styles.thinkingText}>{msg.thinking}</p>
          </div>
        )}

        {/* فایل‌ها */}
        {msg.files && msg.files.length > 0 && (
          <div style={styles.fileList}>
            {msg.files.map((file: any, idx: number) => (
              <a key={idx} href={file.url} target="_blank" style={styles.fileItem}>
                <span>{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                <span>{file.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* محتوای اصلی */}
        <div style={styles.messageContent}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const codeId = `code-${msg.id}-${Math.random()}`
                return match ? (
                  <div style={{ position: 'relative' }}>
                    <SyntaxHighlighter
                      language={match[1]}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '14px'
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                    <div style={styles.codeActions}>
                      <button onClick={() => onCopy(String(children), codeId)} style={styles.codeButton}>
                        {copiedId === codeId ? '✅' : '📋'}
                      </button>
                      <button onClick={() => onDownload(String(children), `code.${match[1]}`)} style={styles.codeButton}>
                        📥
                      </button>
                    </div>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* منابع */}
        {msg.sources && msg.sources.length > 0 && (
          <div style={styles.sourcesContainer}>
            <strong>📚 منابع:</strong>
            <ul style={styles.sourcesList}>
              {msg.sources.map((source: string, idx: number) => (
                <li key={idx}>
                  <a href={source} target="_blank" style={styles.sourceLink}>
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* زمان */}
        <div style={styles.messageFooter}>
          <span style={styles.messageTime}>
            {format(new Date(msg.created_at), 'HH:mm', { locale: faIR })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
})

// کامپوننت تایپینگ
const TypingIndicator = memo(function TypingIndicator() {
  return (
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
  )
})

// ========== استایل‌ها ==========
const styles = {
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
  messageWrapper: {
    display: 'flex',
    gap: '1rem',
  },
  searchMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(0,102,255,0.2)',
    borderRadius: '30px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#aaddff',
  },
  searchIcon: {
    fontSize: '1rem',
  },
  thinkingBubble: {
    background: 'rgba(255,170,0,0.1)',
    borderRadius: '12px',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid rgba(255,170,0,0.3)',
  },
  thinkingText: {
    margin: '0.5rem 0 0',
    fontSize: '0.9rem',
    opacity: 0.8,
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
  },
  messageContent: {
    lineHeight: 1.6,
    fontSize: '1rem',
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
  },
  sourcesList: {
    margin: '0.3rem 0 0',
    paddingLeft: '1.2rem',
  },
  sourceLink: {
    color: '#aaddff',
    textDecoration: 'none',
    fontSize: '0.8rem',
    wordBreak: 'break-all' as const,
    ':hover': {
      textDecoration: 'underline',
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
  codeLoading: {
    padding: '1rem',
    textAlign: 'center' as const,
    opacity: 0.5,
  }
}

export default MessageList
