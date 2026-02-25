'use client'

import { useState } from 'react'

export default function J369Page() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const askJ369 = async () => {
    setResponse('در حال فکر کردن...')
    // اینجا بعداً API وصل می‌کنیم
    setTimeout(() => {
      setResponse('J_369: ' + message)
    }, 1000)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🤖 J_369</h1>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="سوالت رو بپرس..."
        rows={4}
        style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
      />
      <button
        onClick={askJ369}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 2rem',
          fontSize: '1rem',
          background: '#004e92',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        بپرس
      </button>
      {response && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '5px' }}>
          {response}
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'

export default function J369Page() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const askJ369 = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResponse('')
    
    try {
      const res = await fetch('/api/j369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      setResponse('خطا در ارتباط با J_369')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖 J_369</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>هوش مصنوعی کهکشان POITX</p>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="سوالت رو بپرس..."
        rows={4}
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '1rem'
        }}
      />
      
      <button
        onClick={askJ369}
        disabled={loading}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          background: '#004e92',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'در حال فکر کردن...' : 'بپرس'}
      </button>
      
      {response && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <strong>J_369:</strong>
          <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{response}</p>
        </div>
      )}
    </div>
  )
}
