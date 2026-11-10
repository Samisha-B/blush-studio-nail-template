// ============ EDIT THIS FILE TO CUSTOMIZE FOR EACH CLIENT ============
// Images live in /public/images. Missing images fall back to a blush placeholder.

export const site = {
  brand: { name: 'The Blush Studio', tagline: 'Nails · Self-care · Everyday luxury', city: 'Miami, Florida', since: 2019 },
  seo: { title: 'The Blush Studio | Custom Nail Art in Miami, FL', description: 'Luxury gel manicures, structured gel, acrylics and custom nail art in Miami, Florida. Book your appointment request online.', url: 'https://blush-studio-demo.vercel.app' },
  nav: [
    { label: 'Home', href: '#home' }, { label: 'About', href: '#about' }, { label: 'Services', href: '#services' },
    { label: 'Nail Gallery', href: '#gallery' }, { label: 'Shop', href: '#shop' }, { label: 'Contact', href: '#contact' },
  ],
  hero: { headline: ['Beautiful Nails.', 'Beautifully You.'], sub: 'Your little escape for beautiful nails, self-care, and a touch of everyday luxury.', image: '/images/hero.jpg', imageAlt: 'Soft blush nails with gold details' },
  about: {
    eyebrow: 'Meet your nail artist', title: 'A Little About Your Nail Girl', image: '/images/about.jpg', imageAlt: 'Nail artist Camila at her studio desk',
    paragraphs: [
      'Hi, I’m Camila! I’ve been doing nails for over 7 years, and my studio is my happy place. I believe a great set should feel like you: effortless, polished, and a little bit special.',
      'My approach is gentle and detail-obsessed: careful prep, healthy nail care first, and designs that last. I specialize in structured gel, gel extensions, and custom hand-painted art.',
    ],
    stats: [['7+', 'years experience'], ['4,000+', 'sets created'], ['100%', 'sanitized tools']],
    personal: 'Fun fact: there’s always a cup of iced matcha and a Taylor Swift record waiting for you.',
  },
  services: [
    { name: 'Gel Manicure', desc: 'Prep, shape, cuticle care and long-wear gel colour with a glossy finish.', price: 55, duration: '60 min', image: '/images/services/gel.jpg' },
    { name: 'Structured Gel Manicure', desc: 'Builder gel overlay for strength and a flawless apex on natural nails.', price: 75, duration: '75 min', image: '/images/services/structured.jpg' },
    { name: 'Acrylic Full Set', desc: 'Sculpted acrylic in your preferred length and shape.', price: 85, duration: '120 min', image: '/images/services/acrylic.jpg' },
    { name: 'Gel Extensions', desc: 'Lightweight soft-gel tips for natural-feeling length.', price: 95, duration: '120 min', image: '/images/services/extensions.jpg' },
    { name: 'Nail Art', desc: 'Hand-painted designs, chrome, charms and 3D details. Priced per nail or per set.', price: 10, duration: '+15–45 min', image: '/images/services/art.jpg' },
    { name: 'French Tips', desc: 'Classic, micro or colored French, perfectly symmetrical.', price: 20, duration: '+20 min', image: '/images/services/french.jpg' },
    { name: 'Nail Repairs', desc: 'Fix a broken or lifted nail between full appointments.', price: 8, duration: '15 min', image: '/images/services/repair.jpg' },
    { name: 'Removal & Reapplication', desc: 'Safe removal of gel or acrylic, followed by a fresh set.', price: 30, duration: '+30 min', image: '/images/services/removal.jpg' },
    { name: 'Custom Press-On Nails', desc: 'Made-to-measure reusable sets, shipped or picked up.', price: 45, duration: '5–7 day turnaround', image: '/images/services/presson.jpg' },
  ],
  pricingNote: 'Starting prices shown. Final pricing may vary based on nail length, design complexity, and any additional details. Your artist will confirm before you arrive.',
  gallery: {
    categories: ['All', 'French', 'Chrome', 'Minimal', 'Floral', '3D Art', 'Bridal', 'Seasonal', 'Custom'],
    items: [
      { src: '/images/gallery/01.jpg', alt: 'Milky French tips with gold line', category: 'French', tall: true, featured: true },
      { src: '/images/gallery/02.jpg', alt: 'Pearl chrome almond nails', category: 'Chrome', featured: true },
      { src: '/images/gallery/03.jpg', alt: 'Minimal nude gel with glossy finish', category: 'Minimal', tall: true },
      { src: '/images/gallery/04.jpg', alt: 'Hand-painted pink florals', category: 'Floral', featured: true },
      { src: '/images/gallery/05.jpg', alt: '3D bow and pearl charms', category: '3D Art', tall: true, featured: true },
      { src: '/images/gallery/06.jpg', alt: 'Bridal soft white with crystals', category: 'Bridal' },
      { src: '/images/gallery/07.jpg', alt: 'Autumn cocoa cat-eye', category: 'Seasonal', tall: true },
      { src: '/images/gallery/08.jpg', alt: 'Custom abstract blush swirls', category: 'Custom', featured: true },
      { src: '/images/gallery/09.jpg', alt: 'Double French with mauve tips', category: 'French' },
      { src: '/images/gallery/10.jpg', alt: 'Mirror chrome champagne', category: 'Chrome', tall: true },
      { src: '/images/gallery/11.jpg', alt: 'Daisy accents on sheer pink', category: 'Floral' },
      { src: '/images/gallery/12.jpg', alt: 'Holiday red velvet nails', category: 'Seasonal', tall: true },
    ],
  },
  booking: {
    // Set externalUrl to Calendly / Square Appointments / Fresha link to show an instant-booking button
    provider: 'request', externalUrl: '', externalLabel: 'Book instantly online',
    times: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    lengths: ['Short', 'Medium', 'Long', 'Extra long'],
    shapes: ['Round', 'Squoval', 'Oval', 'Almond', 'Coffin', 'Square', 'Stiletto'],
    deposit: 'A $20 deposit (applied to your total) secures your appointment once your request is approved.',
    cancellation: 'Please give 24 hours’ notice to reschedule or cancel. Late cancellations may forfeit the deposit.',
  },
  shop: {
    enabled: true, // set false to hide the entire shop (nav link, section, cart)
    // Put a Shopify / Stripe Payment Link / Square checkout URL here. Left blank, checkout is disabled (no fake payments).
    checkoutUrl: '',
    products: [
      { id: 'presson', name: 'Custom Press-On Set', price: 48, desc: 'Reusable, made to your measurements.', image: '/images/shop/presson.jpg', variants: ['XS', 'S', 'M', 'L'] },
      { id: 'carekit', name: 'Nail Care Kit', price: 32, desc: 'File, buffer, cuticle pusher and travel pouch.', image: '/images/shop/kit.jpg' },
      { id: 'oil', name: 'Cuticle Oil', price: 16, desc: 'Jojoba and vitamin E rollerball.', image: '/images/shop/oil.jpg', variants: ['Vanilla', 'Rose', 'Unscented'] },
      { id: 'accessories', name: 'Nail Charm Set', price: 14, desc: 'Pearls, bows and gold studs.', image: '/images/shop/charms.jpg' },
      { id: 'gift', name: 'Gift Card', price: 50, desc: 'The perfect treat for someone special.', image: '/images/shop/gift.jpg', variants: ['$50', '$75', '$100'] },
      { id: 'collection', name: 'Nail Art Collection', price: 38, desc: 'Seasonal limited-edition press-on collection.', image: '/images/shop/collection.jpg', variants: ['Blush Bloom', 'Cocoa Chrome'] },
    ],
  },
  reviews: [
    { name: 'Ashley M.', text: 'Camila is a total artist. My structured gel lasted five weeks without a single lift!', rating: 5 },
    { name: 'Jordan T.', text: 'So relaxing and spotless. I walked in with a Pinterest photo and left with it on my hands.', rating: 5 },
    { name: 'Priya S.', text: 'Did my bridal set and every guest asked who did them. Worth every penny.', rating: 5 },
    { name: 'Danielle R.', text: 'Gentle, patient and incredibly detail-oriented. My go-to for chrome.', rating: 5 },
    { name: 'K.L.', text: 'Cutest studio ever. Press-ons fit perfectly!', rating: 4 },
  ],
  reviewsNote: 'Sample testimonials for demo purposes. Replace with genuine client reviews.',
  why: [
    { icon: 'sparkles', title: 'Personalized designs', text: 'Every set is planned around your style, lifestyle and inspiration.' },
    { icon: 'gem', title: 'Quality products', text: 'Premium gels, builder and acrylics that protect your natural nails.' },
    { icon: 'eye', title: 'Attention to detail', text: 'Clean cuticles, perfect symmetry, flawless finish.' },
    { icon: 'shield', title: 'Clean and hygienic', text: 'Hospital-grade sanitized tools and fresh files every client.' },
    { icon: 'flower', title: 'Relaxing studio', text: 'Soft music, warm tea and a calm, private setting.' },
    { icon: 'heart', title: 'Friendly service', text: 'Come as you are. You’ll leave feeling like a million bucks.' },
  ],
  contact: {
    homeBased: false, // true = hide street address, show privateNote instead
    address: '123 Collins Ave, Suite 4, Miami Beach, FL 33139',
    privateNote: 'Private studio in Miami. The exact address is shared after your booking is approved.',
    mapQuery: '123 Collins Ave, Miami Beach, FL 33139', // for home studios use just the neighborhood / city
    phone: '(305) 555-0142', email: 'hello@theblushstudio.com', instagram: 'theblushstudio',
    hours: [['Mon', 'Closed'], ['Tue–Fri', '10am – 6pm'], ['Sat', '9am – 4pm'], ['Sun', 'By appointment']],
    parking: 'Free street parking in front; garage parking on 2nd Street. Step-free studio access.',
  },
  instagram: { handle: 'theblushstudio', images: [1, 2, 3, 4, 5, 6].map((n) => `/images/insta/${n}.jpg`) },
  socials: [{ label: 'Instagram', href: 'https://instagram.com/theblushstudio' }, { label: 'Facebook', href: 'https://facebook.com/theblushstudio' }, { label: 'TikTok', href: 'https://tiktok.com/@theblushstudio' }],
  faq: [
    { q: 'How do I book an appointment?', a: 'Fill in the request form above. We’ll reply within 24 hours to confirm availability.' },
    { q: 'Do you require a deposit?', a: 'Yes, a $20 deposit secures your time and is applied toward your service.' },
    { q: 'What is your cancellation policy?', a: 'We ask for 24 hours’ notice. Late cancellations or no-shows may forfeit the deposit.' },
    { q: 'Can I bring my own nail inspiration?', a: 'Absolutely! Upload photos in the form or bring them to your visit.' },
    { q: 'Do you accept walk-ins?', a: 'We’re appointment-first, but ask us about same-day openings.' },
    { q: 'How should I prepare for my appointment?', a: 'Arrive with clean, bare nails or tell us if you have existing enhancements.' },
    { q: 'Do you offer nail removals?', a: 'Yes. Gel and acrylic removal is available alone or with a new set.' },
    { q: 'What payment methods do you accept?', a: 'Credit and debit cards, Apple Pay, Zelle and cash. Tips are always appreciated.' },
  ],
  legal: { privacy: '#', terms: '#' },
};
