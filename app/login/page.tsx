'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push('/j369')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/j369`,
        }
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        {/* Logo */}
        <div style={styles.logoContainer}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            style={styles.logoEmoji}
          >
            🌌
          </motion.div>
          <h1 style={styles.title}>ورود به کهکشان</h1>
          <p style={styles.subtitle}>به J_369 خوش آمدید</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.error}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Google Login */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          style={styles.googleButton}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google"
            style={styles.googleIcon}
          />
          <span>ورود با حساب گوگل</span>
        </motion.button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>یا</span>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="your@email.com"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'در حال ورود...' : '🚀 ورود'}
          </motion.button>
        </form>

        {/* Signup Link */}
        <p style={styles.signupLink}>
          عضو نیستید؟{' '}
          <Link href="/signup" style={styles.link}>
            ثبت‌نام کنید
          </Link>
        </p>

        {/* Forgot Password */}
        <button style={styles.forgotButton}>
          رمز عبور را فراموش کرده‌اید؟
        </button>
      </motion.div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 50%, #0a0f1e, #050713)',
    padding: '1rem',
  },
  card: {
    maxWidth: '400px',
    width: '100%',
    background: 'rgba(10,15,30,0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '2rem',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  logoContainer: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  logoEmoji: {
    fontSize: '4rem',
    marginBottom: '1rem',
    display: 'inline-block',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    background: 'linear-gradient(135deg, #fff, #aaddff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900,
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.7)',
    marginTop: '0.5rem',
  },
  error: {
    padding: '0.8rem',
    background: 'rgba(255,0,0,0.1)',
    border: '1px solid rgba(255,0,0,0.3)',
    borderRadius: '12px',
    color: '#ff6666',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  googleButton: {
    width: '100%',
    padding: '0.8rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  divider: {
    position: 'relative' as const,
    textAlign: 'center' as const,
    margin: '1.5rem 0',
  },
  dividerText: {
    background: '#0a0f1e',
    padding: '0 1rem',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#aaddff',
  },
  input: {
    padding: '0.8rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  submitButton: {
    padding: '1rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  signupLink: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.7)',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
  },
  link: {
    color: '#0066ff',
    textDecoration: 'none',
    fontWeight: 500,
  },
  forgotButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    marginTop: '1rem',
    width: '100%',
    textAlign: 'center' as const,
    transition: 'color 0.2s',
    ':hover': {
      color: '#aaddff',
    },
  },
}
