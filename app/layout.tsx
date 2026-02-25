import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'POITX - کهکشان هوش مصنوعی',
  description: 'J_369 هوش مصنوعی کهکشان POITX',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: 'Vazirmatn, sans-serif' }}>{children}</body>
    </html>
  )
}
