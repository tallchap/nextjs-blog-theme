import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YGrowth | SF-Based Growth Marketing Agency',
  description: 'Growth marketing for startups and small businesses. We offer strategy, creative production, paid search, SEO, paid social, and analytics services.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
