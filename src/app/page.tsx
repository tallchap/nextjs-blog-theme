import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Clients from '@/components/Clients'
import Testimonials from '@/components/Testimonials'
import Approach from '@/components/Approach'
import Founder from '@/components/Founder'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Services />
      <Clients />
      <Testimonials />
      <Approach />
      <Founder />
      <Footer />
    </main>
  )
}
