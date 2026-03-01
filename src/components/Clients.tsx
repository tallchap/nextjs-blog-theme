import styles from './Clients.module.css'

const clients = [
  'Client One',
  'Client Two',
  'Client Three',
  'Client Four',
  'Client Five',
  'Client Six',
]

export default function Clients() {
  return (
    <section className={`section section-alt ${styles.clients}`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">Our Clients</h2>
          <p className="section-subtitle">
            Trusted by leading companies to deliver results.
          </p>
        </div>

        <div className={styles.logoGrid}>
          {clients.map((client, index) => (
            <div key={index} className={styles.logoItem}>
              <div className={styles.logoPlaceholder}>
                {client}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
