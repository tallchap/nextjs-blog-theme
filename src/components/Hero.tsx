import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            GROWTH MARKETING FOR STARTUPS AND SMALL BUSINESSES
          </h1>
          <p className={styles.subtitle}>
            We offer the full range of digital marketing solutions for high-performing companies.
            Hard work begets success, and we strive to produce positive results every single day.
          </p>
          <div className={styles.buttons}>
            <a href="#contact" className="btn btn-primary">
              Work With Us
            </a>
            <a href="#services" className="btn btn-outline">
              Our Services
            </a>
          </div>
        </div>
        <div className={styles.visual}>
          <div className={styles.visualShape}></div>
        </div>
      </div>
    </section>
  )
}
