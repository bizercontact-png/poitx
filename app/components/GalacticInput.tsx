'use client'

import { useState, useRef, useEffect } from 'react'

interface GalacticInputProps {
  onSubmit: (input: string, files: File[]) => void
  loading?: boolean
}

export default function GalacticInput({ onSubmit, loading }: GalacticInputProps) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // تنظیم خودکار ارتفاع
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (input.trim() && !loading) {
      onSubmit(input, files)
      setInput('')
      setFiles([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      width: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* بخش فایل‌ها */}
      {files.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.8rem',
                background: 'rgba(168,85,247,0.2)',
                borderRadius: '30px',
                border: '1px solid rgba(168,85,247,0.5)',
              }}
            >
              <span>📎</span>
              <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4444',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ورودی اصلی */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '24px',
        border: '2px solid',
        borderColor: input ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease',
        boxShadow: input ? '0 0 30px rgba(168,85,247,0.3)' : 'none',
      }}>
        {/* دکمه آپلود */}
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="file-upload"
          style={{
            position: 'absolute',
            left: '15px',
            bottom: '15px',
            cursor: 'pointer',
            fontSize: '1.5rem',
            opacity: 0.7,
            transition: 'opacity 0.2s',
          }}
        >
          📎
        </label>

        {/* textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => setIsExpanded(false)}
          onKeyPress={handleKeyPress}
          placeholder="از J_369 بپرس..."
          rows={1}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem 3rem',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1rem',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            minHeight: '60px',
            maxHeight: '200px',
            opacity: loading ? 0.5 : 1,
          }}
        />

        {/* دکمه ارسال */}
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          style={{
            position: 'absolute',
            right: '15px',
            bottom: '15px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
            border: 'none',
            color: '#fff',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.3s',
            opacity: input && !loading ? 1 : 0.5,
            transform: input && !loading ? 'scale(1)' : 'scale(0.9)',
          }}
        >
          🚀
        </button>
      </div>

      {/* کاراکتر شمار */}
      {input && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          opacity: 0.5,
          textAlign: 'right',
        }}>
          {input.length} / 4000
        </div>
      )}

      {/* استایل انیمیشن */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
