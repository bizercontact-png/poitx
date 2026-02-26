'use client'

import { useState, useRef, useEffect } from 'react'

interface GalacticInputProps {
  onSubmit: (input: string) => void
  loading?: boolean
}

export default function GalacticInput({ onSubmit, loading }: GalacticInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (input.trim() && !loading) {
      onSubmit(input)
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="برای J_369 بنویس..."
          rows={1}
          disabled={loading}
          style={styles.input}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          style={{
            ...styles.button,
            ...(loading || !input.trim() ? styles.buttonDisabled : {})
          }}
        >
          {loading ? '...' : '🚀'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%'
  },
  inputWrapper: {
    position: 'relative' as const,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '1rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    resize: 'none' as const,
    outline: 'none',
    minHeight: '60px',
    maxHeight: '200px',
    fontFamily: 'inherit'
  },
  button: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#0066ff',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    margin: '0.5rem',
    transition: 'all 0.2s'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}
