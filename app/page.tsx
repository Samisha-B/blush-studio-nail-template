import { site } from '@/config/site';
import { CartProvider, CartDrawer } from '@/components/Cart';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import Booking from '@/components/Booking';
import Shop from '@/components/Shop';
import Reviews from '@/components/Reviews';
import Why from '@/components/Why';
import Contact from '@/components/Contact';
import Instagram from '@/components/Instagram';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Page() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    name: site.brand.name,
    description: site.seo.description,
    telephone: site.contact.phone,
    email: site.contact.email,
    url: site.seo.url,
    areaServed: site.brand.city,
  };
  return (
    <CartProvider>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Booking />
        {site.shop.enabled && <Shop />}
        <Reviews />
        <Why />
        <Contact />
        <Instagram />
        <FAQ />
      </main>
      <Footer />
      {site.shop.enabled && <CartDrawer />}
    </CartProvider>
  );
}
