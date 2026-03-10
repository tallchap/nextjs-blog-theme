'use client'

import Link from 'next/link'

export default function GroomingHeader() {
  return (
    <header className="grooming-header">
      <div className="container">
        <Link href="/grooming" className="grooming-logo">
          <span className="logo-icon">🐕</span>
          <span className="logo-text">PawStyle</span>
        </Link>
        <nav className="grooming-nav">
          <Link href="/grooming">Book Grooming</Link>
          <Link href="/grooming/admin">Groomer Portal</Link>
        </nav>
      </div>
    </header>
  )
}
