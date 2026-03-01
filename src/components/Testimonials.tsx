import styles from './Testimonials.module.css'

const testimonials = [
  {
    id: 1,
    quote: "YGrowth transformed our digital marketing strategy. Their data-driven approach delivered exceptional results within months.",
    author: "Sarah Johnson",
    role: "CEO, TechStart Inc.",
  },
  {
    id: 2,
    quote: "The team's expertise in paid search and social media helped us achieve a 3x increase in qualified leads.",
    author: "Michael Chen",
    role: "Marketing Director, GrowthCo",
  },
  {
    id: 3,
    quote: "Their strategic approach and attention to detail set them apart. YGrowth is a true partner in our growth journey.",
    author: "Emily Rodriguez",
    role: "Founder, ScaleUp Labs",
  },
]

export default function Testimonials() {
  return (
    <section className={`section ${styles.testimonials}`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">
            Hear from the companies we've helped grow.
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.card}>
              <blockquote className={styles.quote}>
                "{testimonial.quote}"
              </blockquote>
              <div className={styles.author}>
                <div className={styles.avatar}></div>
                <div className={styles.authorInfo}>
                  <p className={styles.authorName}>{testimonial.author}</p>
                  <p className={styles.authorRole}>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
