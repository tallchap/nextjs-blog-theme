import type { Metadata } from 'next'
import './grooming.css'

export const metadata: Metadata = {
  title: 'PawStyle | Dog Grooming Made Easy',
  description: 'Upload a photo of your dog, preview different grooming styles, and book your appointment. AI-powered breed detection and style recommendations.',
}

export default function GroomingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
