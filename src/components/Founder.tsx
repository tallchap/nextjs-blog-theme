import styles from './Founder.module.css'

export default function Founder() {
  return (
    <section id="about" className={`section ${styles.founder}`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.imageWrapper}>
            <div className={styles.imagePlaceholder}>
              <span>ON</span>
            </div>
          </div>

          <div className={styles.content}>
            <h2 className="section-title">Meet the Founder</h2>

            <h3 className={styles.name}>Ori Nagel</h3>
            <p className={styles.role}>Lead Consultant & Founder</p>

            <div className={styles.bio}>
              <p>
                Ori Nagel is a growth marketer with expertise running digital marketing
                and PR campaigns for enterprise and consumer companies.
              </p>
              <p>
                With over a decade of digital experience, Ori has introduced more than
                twenty consumer and enterprise products to the public, including several
                award-winning video game and tech marketing campaigns.
              </p>
              <p>
                His expertise spans digital marketing, analytics, and growth strategy,
                helping companies form a clear vision and execute on it effectively.
              </p>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10+</span>
                <span className={styles.statLabel}>Years Experience</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>20+</span>
                <span className={styles.statLabel}>Products Launched</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100+</span>
                <span className={styles.statLabel}>Campaigns Run</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
