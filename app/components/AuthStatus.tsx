'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    // دریافت سشن اولیه
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // شنونده تغییرات وضعیت احراز هویت
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowMenu(false)
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingDot} />
        <div style={{...styles.loadingDot, animationDelay: '0.2s'}} />
        <div style={{...styles.loadingDot, animationDelay: '0.4s'}} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.authButtons}>
        <Link href="/login" style={styles.loginButton}>
          ورود
        </Link>
        <Link href="/signup" style={styles.signupButton}>
          عضویت
        </Link>
      </div>
    )
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'کاربر'
  const userAvatar = user.user_metadata?.avatar_url

  return (
    <div style={styles.userContainer}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        style={styles.userButton}
      >
        {userAvatar ? (
          <img 
            src={userAvatar} 
            alt={userName}
            style={styles.avatar}
          />
        ) : (
          <div style={styles.avatarPlaceholder}>
            {userName[0].toUpperCase()}
          </div>
        )}
        <span style={styles.userName}>{userName}</span>
        <span style={styles.dropdownIcon}>▼</span>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={styles.dropdownMenu}
          >
            <div style={styles.menuHeader}>
              <div style={styles.menuEmail}>{user.email}</div>
            </div>
            <Link href="/profile" style={styles.menuItem}>
              👤 پروفایل
            </Link>
            <Link href="/settings" style={styles.menuItem}>
              ⚙️ تنظیمات
            </Link>
            <button onClick={handleSignOut} style={styles.menuItem}>
              🚪 خروج
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  loadingContainer: {
    display: 'flex',
    gap: '0.2rem',
    padding: '0.5rem',
  },
  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0066ff',
    animation: 'bounce 1.4s infinite ease-in-out',
  },
  authButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  loginButton: {
    padding: '0.4rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  signupButton: {
    padding: '0.4rem 1rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '20px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  userContainer: {
    position: 'relative' as const,
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '30px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  avatarPlaceholder: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 500,
  },
  userName: {
    fontSize: '0.9rem',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  dropdownIcon: {
    fontSize: '0.7rem',
    opacity: 0.7,
    marginRight: '0.3rem',
  },
  dropdownMenu: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    width: '200px',
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  menuHeader: {
    padding: '0.8rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  menuEmail: {
    fontSize: '0.8rem',
    opacity: 0.7,
    wordBreak: 'break-all' as const,
  },
  menuItem: {
    display: 'block',
    padding: '0.8rem',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  },
}
