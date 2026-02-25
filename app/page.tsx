import Link from 'next/link'

export default function Home() {
  return (
    <main style={styles.main}>
      {/* پس‌زمینه ستاره‌ای */}
      <div style={styles.stars}></div>
      
      {/* محتوای اصلی */}
      <div style={styles.container}>
        {/* لوگو و نام کهکشان */}
        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>🌌 POITX</h1>
          <div style={styles.logoGlow}></div>
        </div>
        
        {/* شعار کهکشانی */}
        <h2 style={styles.title}>
          کهکشان هوش مصنوعی
        </h2>
        <p style={styles.subtitle}>
          با J_369، هوشمندترین دستیار کهکشانی
        </p>
        
        {/* دکمه‌های اصلی */}
        <div style={styles.buttonContainer}>
          <Link href="/j369" style={{ ...styles.button, ...styles.primaryButton }}>
            🚀 شروع کن
          </Link>
          <Link href="/about" style={{ ...styles.button, ...styles.secondaryButton }}>
            ⚡ درباره کهکشان
          </Link>
        </div>
        
        {/* آمار کهکشانی */}
        <div style={styles.statsContainer}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>∞</span>
            <span style={styles.statLabel}>امکانات</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>J_369</span>
            <span style={styles.statLabel}>هوش مصنوعی</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>۷B+</span>
            <span style={styles.statLabel}>کاربران هدف</span>
          </div>
        </div>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f35 50%, #0a0f1e 100%)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  stars: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(100,150,255,0.1) 0%, transparent 50%)',
    animation: 'twinkle 4s ease-in-out infinite',
  },
  container: {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center' as const,
  },
  logoContainer: {
    position: 'relative' as const,
    marginBottom: '2rem',
  },
  logo: {
    fontSize: '5rem',
    margin: 0,
    color: '#fff',
    textShadow: '0 0 20px rgba(0,150,255,0.8)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  logoGlow: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150%',
    height: '150%',
    background: 'radial-gradient(circle, rgba(0,150,255,0.2) 0%, transparent 70%)',
    zIndex: -1,
    animation: 'rotate 10s linear infinite',
  },
  title: {
    fontSize: '3rem',
    margin: '0 0 1rem',
    background: 'linear-gradient(135deg, #fff 0%, #aaddff 50%, #fff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900,
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#aaddff',
    marginBottom: '3rem',
    opacity: 0.9,
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '4rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  button: {
    padding: '1rem 2.5rem',
    fontSize: '1.2rem',
    borderRadius: '50px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    fontWeight: 700,
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #0066ff 0%, #00aaff 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0,102,255,0.4)',
  },
  secondaryButton: {
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  statsContainer: {
    display: 'flex',
    gap: '3rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#fff',
    textShadow: '0 0 10px #0066ff',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#aaddff',
    marginTop: '0.5rem',
  }
}

// اضافه کردن انیمیشن‌های CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`
document.head.appendChild(style)
