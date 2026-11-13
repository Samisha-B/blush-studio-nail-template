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
import { Marquee, Reveal, ScrollProgress } from '@/components/Motion';

export default function Page() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'DaySpa',
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
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Reveal><About /></Reveal>
        <Reveal><Services /></Reveal>
        <Reveal><Gallery /></Reveal>
        <Reveal><Booking /></Reveal>
        {site.shop.enabled && <Reveal><Shop /></Reveal>}
        <Reveal><Reviews /></Reveal>
        <Reveal><Why /></Reveal>
        <Reveal><Contact /></Reveal>
        <Reveal><Instagram /></Reveal>
        <Reveal><FAQ /></Reveal>
      </main>
      <Footer />
      {site.shop.enabled && <CartDrawer />}
    </CartProvider>
  );
}
