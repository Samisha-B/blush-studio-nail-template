import { Phone, Mail, Instagram, Clock, Car, MapPin } from 'lucide-react';
import { site } from '@/config/site';

export default function Contact() {
  const c = site.contact;
  const q = encodeURIComponent(c.mapQuery);
  return (
    <section id='contact' className='sec bg-blush/30'>
      <div className='wrap'>
        <div className='mx-auto max-w-xl text-center'>
          <p className='eyebrow'>Visit us</p>
          <h2 className='h2 mt-2'>Location & contact</h2>
        </div>
        <div className='mt-12 grid gap-8 md:grid-cols-2'>
          <div className='card space-y-5 p-8 text-sm'>
            <p className='flex gap-3'><MapPin size={18} className='shrink-0 text-rose' /> {c.homeBased ? c.privateNote : c.address}</p>
            <p className='flex gap-3'><Phone size={18} className='shrink-0 text-rose' /> <a href={`tel:${c.phone}`}>{c.phone}</a></p>
            <p className='flex gap-3'><Mail size={18} className='shrink-0 text-rose' /> <a href={`mailto:${c.email}`}>{c.email}</a></p>
            <p className='flex gap-3'><Instagram size={18} className='shrink-0 text-rose' /> <a href={`https://instagram.com/${c.instagram}`} target='_blank' rel='noopener noreferrer'>@{c.instagram}</a></p>
            <div className='flex gap-3'><Clock size={18} className='shrink-0 text-rose' /><dl className='w-full'>{c.hours.map(([d, h]) => <div key={d} className='flex justify-between py-0.5'><dt>{d}</dt><dd>{h}</dd></div>)}</dl></div>
            <p className='flex gap-3'><Car size={18} className='shrink-0 text-rose' /> {c.parking}</p>
            {!c.homeBased && <a className='btn btn-primary' href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target='_blank' rel='noopener noreferrer'>Get Directions</a>}
          </div>
          <iframe title='Map to the studio' loading='lazy' className='h-96 w-full rounded-2xl border-0 shadow-soft md:h-full' src={`https://www.google.com/maps?q=${q}&output=embed`} referrerPolicy='no-referrer-when-downgrade' />
        </div>
      </div>
    </section>
  );
}
