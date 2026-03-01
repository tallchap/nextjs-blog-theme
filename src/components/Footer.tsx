import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h3 className={styles.logo}>YGrowth</h3>
            <p className={styles.tagline}>
              Growth marketing for startups and small businesses.
            </p>
          </div>

          <div className={styles.links}>
            <h4 className={styles.linksTitle}>Quick Links</h4>
            <nav className={styles.nav}>
              <a href="#services">Services</a>
              <a href="#approach">Our Approach</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>

          <div className={styles.services}>
            <h4 className={styles.linksTitle}>Services</h4>
            <nav className={styles.nav}>
              <a href="#services">Growth Strategy</a>
              <a href="#services">Creative Production</a>
              <a href="#services">Paid Search</a>
              <a href="#services">SEO</a>
            </nav>
          </div>

          <div className={styles.contact}>
            <h4 className={styles.linksTitle}>Get In Touch</h4>
            <p className={styles.contactInfo}>
              San Francisco, CA
            </p>
            <a href="mailto:hello@ygrowth.co" className={styles.email}>
              hello@ygrowth.co
            </a>
            <a href="#contact" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Work With Us
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} YGrowth. All rights reserved.
          </p>
          <div className={styles.social}>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
            <a href="#" aria-label="Twitter">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
