import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PawStyle Grooming | AI-Powered Dog Grooming Visualizer',
  description: 'Upload a photo of your dog and preview different grooming styles. Customize haircuts, see pricing, and book your grooming appointment.',
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
