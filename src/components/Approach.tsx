import styles from './Approach.module.css'

export default function Approach() {
  return (
    <section id="approach" className={`section section-alt ${styles.approach}`}>
      <div className="container">
        <div className={styles.content}>
          <h2 className="section-title">Our Approach</h2>

          <div className={styles.quote}>
            <blockquote className={styles.hebrewSaying}>
              "If you work hard and you find success, believe it."
            </blockquote>
            <p className={styles.quoteSource}>- Traditional Hebrew Saying</p>
          </div>

          <div className={styles.description}>
            <p>
              There's no magic formula to marketing success. It takes investigation,
              experimentation, and a willingness to learn from both successes and failures.
            </p>
            <p>
              The YGrowth method is simple: we put in the effort to find what works for
              your unique situation, then we double down on it. We believe that hard work
              begets success, and we strive to produce positive results every single day.
            </p>
            <p>
              With over a decade of digital experience, we bring expertise and agility
              to help you form a clear vision and execute on it effectively.
            </p>
          </div>

          <div className={styles.values}>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Investigation</h3>
              <p className={styles.valueDescription}>
                Deep dive into your market, competitors, and opportunities.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Experimentation</h3>
              <p className={styles.valueDescription}>
                Test, learn, and iterate to find winning strategies.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Execution</h3>
              <p className={styles.valueDescription}>
                Double down on what works and scale for growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
