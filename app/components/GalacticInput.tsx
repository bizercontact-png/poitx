'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GalacticInputProps {
  onSubmit: (input: string, files: File[]) => void
  loading?: boolean
  placeholder?: string
  maxLength?: number
}

type FilePreview = {
  file: File
  id: string
  progress: number
  error?: string
}

export default function GalacticInput({ 
  onSubmit, 
  loading = false, 
  placeholder = "برای J_369 بنویس...",
  maxLength = 4000 
}: GalacticInputProps) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<FilePreview[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [charCount, setCharCount] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // ========== Auto-resize textarea ==========
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // ========== Character count ==========
  useEffect(() => {
    setCharCount(input.length)
  }, [input])

  // ========== Drag & Drop handlers ==========
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      if (e.dataTransfer?.files) {
        handleFiles(Array.from(e.dataTransfer.files))
      }
    }

    const dropZone = dropZoneRef.current
    if (dropZone) {
      dropZone.addEventListener('dragover', handleDragOver)
      dropZone.addEventListener('dragleave', handleDragLeave)
      dropZone.addEventListener('drop', handleDrop)
    }

    return () => {
      if (dropZone) {
        dropZone.removeEventListener('dragover', handleDragOver)
        dropZone.removeEventListener('dragleave', handleDragLeave)
        dropZone.removeEventListener('drop', handleDrop)
      }
    }
  }, [])

  // ========== Handle file selection ==========
  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`فایل ${file.name} بزرگتر از ۱۰MB است`)
        return false
      }
      return true
    })

    const filePreviews: FilePreview[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0
    }))

    setFiles(prev => [...prev, ...filePreviews])

    // Simulate upload progress (for demo)
    filePreviews.forEach(preview => {
      simulateUpload(preview.id)
    })
  }

  // ========== Simulate upload progress ==========
  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, progress } : f
        )
      )
      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  // ========== Remove file ==========
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // ========== Handle submit ==========
  const handleSubmit = () => {
    if (input.trim() && !loading) {
      onSubmit(input, files.map(f => f.file))
      setInput('')
      setFiles([])
      setCharCount(0)
    }
  }

  // ========== Handle key press ==========
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // ========== Emoji suggestions (مثل Grok) ==========
  const emojis = ['😊', '🚀', '🌌', '✨', '🤖', '💫', '⭐', '🌟']

  return (
    <div 
      ref={dropZoneRef}
      style={styles.container}
    >
      {/* ===== Drag & Drop Overlay ===== */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.dragOverlay}
          >
            <div style={styles.dragContent}>
              <span style={styles.dragIcon}>📁</span>
              <span>فایل‌ها را اینجا رها کنید</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== File Previews ===== */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.fileList}
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={styles.fileItem}
              >
                <div style={styles.fileIcon}>
                  {file.file.type.startsWith('image/') ? '🖼️' : '📄'}
                </div>
                <div style={styles.fileInfo}>
                  <div style={styles.fileName}>{file.file.name}</div>
                  <div style={styles.fileSize}>
                    {(file.file.size / 1024).toFixed(1)} KB
                  </div>
                  {file.progress < 100 && (
                    <div style={styles.progressBar}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        style={styles.progressFill}
                      />
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.2, color: '#ff4444' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFile(file.id)}
                  style={styles.removeFile}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Main Input ===== */}
      <div style={{
        ...styles.inputWrapper,
        borderColor: isExpanded ? '#0066ff' : 'rgba(255,255,255,0.2)',
        boxShadow: isExpanded ? '0 0 30px rgba(0,102,255,0.3)' : 'none',
      }}>
        {/* ===== Left Buttons ===== */}
        <div style={styles.leftButtons}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            style={styles.iconButton}
            title="آپلود فایل"
          >
            📎
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={styles.iconButton}
            title="ایموجی"
          >
            😊
          </motion.button>
        </div>

        {/* ===== Textarea ===== */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => setIsExpanded(false)}
          placeholder={placeholder}
          rows={1}
          disabled={loading}
          style={styles.textarea}
        />

        {/* ===== Right Buttons ===== */}
        <div style={styles.rightButtons}>
          {/* Character count */}
          {input.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                ...styles.charCount,
                color: charCount > maxLength * 0.9 ? '#ffaa00' : 
                       charCount >= maxLength ? '#ff4444' : 'rgba(255,255,255,0.5)'
              }}
            >
              {charCount}/{maxLength}
            </motion.span>
          )}

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendButton,
              ...(loading || !input.trim() ? styles.sendButtonDisabled : {})
            }}
          >
            {loading ? (
              <div style={styles.sendLoader}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <span style={styles.sendIcon}>🚀</span>
            )}
          </motion.button>
        </div>

        {/* ===== Hidden file input ===== */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          style={{ display: 'none' }}
        />
      </div>

      {/* ===== Emoji Picker (مثل Grok) ===== */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={styles.emojiPicker}
          >
            {emojis.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setInput(prev => prev + emoji)
                  setShowEmojiPicker(false)
                }}
                style={styles.emojiButton}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Keyboard shortcut hint ===== */}
      <div style={styles.hint}>
        <span style={styles.hintText}>Shift + Enter برای خط جدید</span>
        <span style={styles.hintDot}>•</span>
        <span style={styles.hintText}>Enter برای ارسال</span>
      </div>

      {/* ===== Global Styles for animations ===== */}
      <style>{`
        @keyframes loaderPulse {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        @keyframes galaxyPulse {
          0%, 100% { opacity: 0.5; filter: blur(10px); }
          50% { opacity: 1; filter: blur(5px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    position: 'relative' as const,
  },
  dragOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,102,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '2px dashed #0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dragContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    color: '#fff',
    fontSize: '1.2rem',
  },
  dragIcon: {
    fontSize: '3rem',
  },
  fileList: {
    marginBottom: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'slideIn 0.3s ease-out',
  },
  fileIcon: {
    fontSize: '1.5rem',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: '0.9rem',
    marginBottom: '0.2rem',
  },
  fileSize: {
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  progressBar: {
    height: '2px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '1px',
    marginTop: '0.3rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#0066ff',
  },
  removeFile: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  inputWrapper: {
    position: 'relative' as const,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'flex-end',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    minHeight: '60px',
  },
  leftButtons: {
    display: 'flex',
    gap: '0.2rem',
    padding: '0.5rem',
    alignItems: 'center',
  },
  rightButtons: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    alignItems: 'center',
  },
  iconButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'all 0.2s',
  },
  textarea: {
    flex: 1,
    padding: '1rem 0.5rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    lineHeight: '1.5',
    resize: 'none' as const,
    outline: 'none',
    minHeight: '60px',
    maxHeight: '200px',
    fontFamily: 'inherit',
  },
  charCount: {
    fontSize: '0.8rem',
    transition: 'color 0.2s',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#0066ff',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  sendIcon: {
    fontSize: '1.2rem',
  },
  sendLoader: {
    display: 'flex',
    gap: '0.2rem',
    '& span': {
      width: '4px',
      height: '4px',
      background: '#fff',
      borderRadius: '50%',
      animation: 'loaderPulse 1.4s infinite ease-in-out',
    },
    '& span:nth-child(1)': { animationDelay: '0s' },
    '& span:nth-child(2)': { animationDelay: '0.2s' },
    '& span:nth-child(3)': { animationDelay: '0.4s' },
  },
  emojiPicker: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '0',
    marginBottom: '0.5rem',
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '0.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.3rem',
    zIndex: 10,
  },
  emojiButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  hint: {
    marginTop: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    opacity: 0.5,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
  },
  hintDot: {
    color: 'rgba(255,255,255,0.3)',
  },
}
