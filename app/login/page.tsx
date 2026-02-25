'use client'

import { useState, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// کامپوننتی که از useSearchParams استفاده می‌کنه
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/j369')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>ورود به کهکشان 🌌</h1>
      <p style={styles.subtitle}>به J_369 خوش آمدید</p>

      {message && (
        <div style={styles.success}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="your@email.com"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'در حال ورود...' : '🚀 ورود'}
        </button>
      </form>

      <p style={styles.signupLink}>
        عضو نیستید؟{' '}
        <Link href="/signup" style={styles.link}>
          ثبت‌نام کنید
        </Link>
      </p>
    </div>
  )
}

// صفحه اصلی با Suspense
export default function LoginPage() {
  return (
    <div style={styles.container}>
      <Suspense fallback={
        <div style={styles.card}>
          <div style={styles.loading}>در حال بارگذاری...</div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1b3a 100%)',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    color: '#fff',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  label: {
    color: '#fff',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    padding: '0.8rem',
    background: 'rgba(255,0,0,0.1)',
    border: '1px solid rgba(255,0,0,0.3)',
    borderRadius: '8px',
    color: '#ff6666',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  success: {
    padding: '0.8rem',
    background: 'rgba(0,255,0,0.1)',
    border: '1px solid rgba(0,255,0,0.3)',
    borderRadius: '8px',
    color: '#66ff66',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  signupLink: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.7)',
    marginTop: '1.5rem',
  },
  link: {
    color: '#38bdf8',
    textDecoration: 'none',
  },
  loading: {
    color: '#fff',
    textAlign: 'center' as const,
    padding: '2rem',
  },
}
