'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <Link href="/login" style={styles.link}>ورود</Link>
        <span style={styles.separator}>|</span>
        <Link href="/signup" style={styles.link}>عضویت</Link>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <span style={styles.welcome}>
        👤 {user.email?.split('@')[0]}
      </span>
      <button onClick={handleSignOut} style={styles.logout}>
        خروج
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  welcome: {
    fontSize: '0.9rem',
    color: '#fff'
  },
  link: {
    color: '#38bdf8',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  separator: {
    color: 'rgba(255,255,255,0.3)'
  },
  logout: {
    background: 'rgba(255,0,0,0.2)',
    border: '1px solid rgba(255,0,0,0.3)',
    color: '#ff6666',
    padding: '0.2rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  }
}
