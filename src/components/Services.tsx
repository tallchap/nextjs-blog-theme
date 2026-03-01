import styles from './Services.module.css'

const services = [
  {
    id: 1,
    title: 'Growth Strategy',
    description: 'We help you figure out the winning strategy for your specific circumstances and goals.',
    icon: '📊',
  },
  {
    id: 2,
    title: 'Creative Production',
    description: 'Image, video, and web assets designed to help you sell more and engage your audience.',
    icon: '🎨',
  },
  {
    id: 3,
    title: 'Paid Search',
    description: 'As certified specialists, we get your Google Ads programs running efficiently.',
    icon: '🔍',
  },
  {
    id: 4,
    title: 'SEO',
    description: 'Navigate the SEO landscape with meaningful improvements that drive organic growth.',
    icon: '📈',
  },
  {
    id: 5,
    title: 'Paid Social',
    description: 'Scale your Paid Social programs to increase demand and reach new audiences.',
    icon: '📱',
  },
  {
    id: 6,
    title: 'Analytics & Reporting',
    description: 'Ongoing dashboards and ad-hoc reporting to track performance and inform decisions.',
    icon: '📉',
  },
]

export default function Services() {
  return (
    <section id="services" className={`section ${styles.services}`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            We offer the full range of digital marketing solutions for high-performing companies.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((service) => (
            <div key={service.id} className={styles.card}>
              <span className={styles.icon}>{service.icon}</span>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDescription}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
