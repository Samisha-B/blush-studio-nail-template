import { site } from '@/config/site';

export default function Footer() {
  const c = site.contact;
  const links = site.nav.filter((l) => site.shop.enabled || l.href !== '#shop');
  return (
    <footer className='bg-espresso text-cream/90'>
      <div className='wrap grid gap-10 py-16 md:grid-cols-4'>
        <div>
          <p className='font-serif text-3xl'>{site.brand.name}</p>
          <p className='mt-2 text-sm text-cream/70'>{site.brand.tagline}</p>
          <a href='#booking' className='btn mt-5 bg-blush text-espresso hover:bg-cream'>Book Appointment</a>
        </div>
        <nav aria-label='Footer'>
          <p className='mb-3 font-serif text-xl'>Explore</p>
          <ul className='space-y-2 text-sm'>{links.map((l) => <li key={l.href}><a href={l.href} className='hover:text-blush'>{l.label}</a></li>)}</ul>
        </nav>
        <div className='text-sm'>
          <p className='mb-3 font-serif text-xl'>Contact</p>
          <p>{c.homeBased ? 'Appointment-only studio' : c.address}</p>
          <p className='mt-2'><a href={`tel:${c.phone}`}>{c.phone}</a></p>
          <p><a href={`mailto:${c.email}`}>{c.email}</a></p>
          <div className='mt-3 flex gap-4'>{site.socials.map((s) => <a key={s.label} href={s.href} target='_blank' rel='noopener noreferrer' className='hover:text-blush'>{s.label}</a>)}</div>
        </div>
        <div className='text-sm'>
          <p className='mb-3 font-serif text-xl'>Hours</p>
          {c.hours.map(([d, h]) => <p key={d} className='flex justify-between'><span>{d}</span><span>{h}</span></p>)}
        </div>
      </div>
      <div className='border-t border-cream/10 py-5 text-center text-xs text-cream/60'>
        © {new Date().getFullYear()} {site.brand.name}. All rights reserved. · <a href={site.legal.privacy}>Privacy Policy</a> · <a href={site.legal.terms}>Terms & Conditions</a>
      </div>
    </footer>
  );
}
