'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'

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
  showThinking,
  isMobile,
  onCopy,
  onDownload,
  copiedId
}: MessageListProps) {
  return (
    <AnimatePresence mode="popLayout">
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

      {loading && <TypingIndicator />}
    </AnimatePresence>
  )
})

// کامپوننت جداگانه برای هر پیام (برای بهینه‌سازی)
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
        {msg.thinking && showThinking && (
          <div style={styles.thinkingBubble}>
            <strong>🧠 فرآیند تفکر:</strong>
            <p style={styles.thinkingText}>{msg.thinking}</p>
          </div>
        )}

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
                      style={vscDarkPlus}
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
                  <code className={className}>{children}</code>
                )
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div style={styles.sourcesContainer}>
            <strong>📚 منابع:</strong>
            <ul>
              {msg.sources.map((source: string, idx: number) => (
                <li key={idx}>{source}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.messageFooter}>
          <span style={styles.messageTime}>
            {format(new Date(msg.created_at), 'HH:mm', { locale: faIR })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
})

// کامپوننت جداگانه برای تایپینگ
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

// استایل‌ها
const styles = {
  // ... همون استایل‌های قبلی
  codeLoading: {
    padding: '1rem',
    textAlign: 'center' as const,
    opacity: 0.5,
  }
}

export default MessageList
