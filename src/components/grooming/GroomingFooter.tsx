export default function GroomingFooter() {
  return (
    <footer className="grooming-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🐕</span>
            <span className="logo-text">PawStyle</span>
            <p>Professional dog grooming made easy. Upload a photo, preview styles, and book your appointment.</p>
          </div>
          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li>Full Grooming</li>
              <li>Bath & Brush</li>
              <li>Nail Trimming</li>
              <li>De-matting</li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li>FAQ</li>
              <li>Contact Us</li>
              <li>Cancellation Policy</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 PawStyle. All rights reserved.</p>
          <p className="footer-version">Build: {process.env.NEXT_PUBLIC_COMMIT_HASH || 'dev'}</p>
        </div>
      </div>
    </footer>
  )
}
