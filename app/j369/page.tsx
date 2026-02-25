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
