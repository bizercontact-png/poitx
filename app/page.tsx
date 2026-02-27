import Link from 'next/link'

export default function Home() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* لوگو - بدون شعار */}
        <h1 style={styles.logo}>POITX</h1>
        
        {/* توضیح کوتاه - دقیقاً مثل Alphabet */}
        <p style={styles.description}>
          POITX is a collection of companies building the future of artificial intelligence.
        </p>
        
        {/* خط جداکننده */}
        <hr style={styles.divider} />
        
        {/* لیست شرکت‌ها - مثل Alphabet */}
        <div style={styles.companies}>
          <h2 style={styles.sectionTitle}>Companies</h2>
          
          <div style={styles.companyList}>
            {/* J_369 - برجسته‌ترین */}
            <Link href="/j369" style={styles.companyCard}>
              <div style={styles.companyName}>J_369</div>
              <div style={styles.companyDesc}>Artificial Intelligence</div>
            </Link>
            
            {/* نمونه بقیه (برای آینده) */}
            <div style={{...styles.companyCard, opacity: 0.5}}>
              <div style={styles.companyName}>POITX Cloud</div>
              <div style={styles.companyDesc}>Cloud Computing</div>
            </div>
            
            <div style={{...styles.companyCard, opacity: 0.5}}>
              <div style={styles.companyName}>POITX Ventures</div>
              <div style={styles.companyDesc}>Investments</div>
            </div>
          </div>
        </div>
        
        {/* زیرنویس ساده - لینک به Alphabet */}
        <div style={styles.footer}>
          <Link href="https://abc.xyz" style={styles.footerLink}>
            Inspired by Alphabet
          </Link>
        </div>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#1f2a44',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '4rem 2rem',
  },
  logo: {
    fontSize: '2.5rem',
    fontWeight: 500,
    margin: '0 0 1rem',
    letterSpacing: '-0.02em',
    color: '#1f2a44',
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    color: '#5f6b7a',
    marginBottom: '3rem',
    maxWidth: '600px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e9f0',
    margin: '2rem 0',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: '0 0 1.5rem',
    color: '#1f2a44',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  companies: {
    marginBottom: '4rem',
  },
  companyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  companyCard: {
    display: 'block',
    padding: '1rem',
    border: '1px solid #e5e9f0',
    borderRadius: '6px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      borderColor: '#0066ff',
      boxShadow: '0 2px 8px rgba(0,102,255,0.1)',
    },
  },
  companyName: {
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: '0.25rem',
    color: '#1f2a44',
  },
  companyDesc: {
    fontSize: '0.9rem',
    color: '#5f6b7a',
  },
  footer: {
    marginTop: '4rem',
    textAlign: 'center' as const,
    borderTop: '1px solid #e5e9f0',
    paddingTop: '2rem',
  },
  footerLink: {
    color: '#5f6b7a',
    textDecoration: 'none',
    fontSize: '0.85rem',
    ':hover': {
      color: '#0066ff',
    },
  },
}
