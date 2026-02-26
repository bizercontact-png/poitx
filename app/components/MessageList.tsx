'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// این تایپ باید با types/index.ts هماهنگ باشه
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: Date        // اینجا created_at هست (نه createdAt)
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
  return (
    <AnimatePresence mode="popLayout">
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 20, x: msg.role === 'user' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
          style={{
            display: 'flex',
            marginBottom: '1.5rem',
            gap: '1rem',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          {/* آواتار J_369 */}
          {msg.role === 'assistant' && (
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              style={{
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
              }}
            >
              🤖
            </motion.div>
          )}

          {/* بدنه پیام */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              maxWidth: '70%',
              padding: '1rem 1.5rem',
              borderRadius: '20px',
              position: 'relative',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              background: msg.role === 'user' 
                ? '#0066ff' 
                : 'rgba(255,255,255,0.1)',
              borderBottomRightRadius: msg.role === 'user' ? '5px' : '20px',
              borderBottomLeftRadius: msg.role === 'assistant' ? '5px' : '20px',
            }}
          >
            {/* بخش تفکر (Thinking) */}
            {msg.thinking && showThinking && (
              <div style={{
                background: 'rgba(255,170,0,0.1)',
                borderRadius: '12px',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid rgba(255,170,0,0.3)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🧠</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffaa00' }}>
                    فرآیند تفکر
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6 }}>
                  {msg.thinking}
                </p>
              </div>
            )}

            {/* فایل‌های آپلود شده */}
            {msg.files && msg.files.length > 0 && (
              <div style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                {msg.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#fff',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>
                      {file.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                  </a>
                ))}
              </div>
            )}

            {/* محتوای اصلی پیام با Markdown */}
            <div style={{ lineHeight: 1.6, fontSize: '1rem' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeId = `code-${msg.id}-${Math.random()}`
                    return match ? (
                      <div style={{ position: 'relative' }}>
                        <pre style={{
                          background: '#1e1e1e',
                          padding: '1rem',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          margin: '0.5rem 0',
                          border: '1px solid #333',
                          fontFamily: 'monospace',
                          fontSize: isMobile ? '12px' : '14px'
                        }}>
                          <code className={className} {...props}>
                            {String(children).replace(/\n$/, '')}
                          </code>
                        </pre>
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          display: 'flex',
                          gap: '0.3rem',
                        }}>
                          <button
                            onClick={() => onCopy(String(children), codeId)}
                            style={{
                              padding: '0.2rem 0.5rem',
                              background: 'rgba(255,255,255,0.2)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                            title="کپی"
                          >
                            {copiedId === codeId ? '✅' : '📋'}
                          </button>
                          <button
                            onClick={() => onDownload(String(children), `code.${match[1]}`)}
                            style={{
                              padding: '0.2rem 0.5rem',
                              background: 'rgba(255,255,255,0.2)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                            title="دانلود"
                          >
                            📥
                          </button>
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
                      <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
                        <table style={{
                          borderCollapse: 'collapse',
                          width: '100%',
                          fontSize: '0.9rem',
                        }}>
                          {children}
                        </table>
                      </div>
                    )
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>

            {/* منابع */}
            {msg.sources && msg.sources.length > 0 && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.9rem',
                opacity: 0.8,
              }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem' }}>📚 منابع:</strong>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {msg.sources.map((source, idx) => (
                    <li key={idx}>{source}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* زمان پیام - استفاده از created_at */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.7rem',
                opacity: 0.6,
              }}>
                {format(new Date(msg.created_at), 'HH:mm', { locale: faIR })}
              </span>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* ایندیکیتور تایپینگ */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            marginBottom: '1.5rem',
            gap: '1rem',
            justifyContent: 'flex-start',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0066ff, #00aaff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0,
          }}>
            🤖
          </div>
          <div style={{
            maxWidth: '70%',
            padding: '1rem 1.5rem',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderBottomLeftRadius: '5px',
          }}>
            <div style={{
              display: 'flex',
              gap: '0.3rem',
              padding: '0.5rem 0',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#fff',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out',
              }}></span>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#fff',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out 0.2s',
              }}></span>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#fff',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out 0.4s',
              }}></span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
