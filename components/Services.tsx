'use client';
import { Clock } from 'lucide-react';
import { site } from '@/config/site';
import Img from './Img';

export default function Services() {
  const pick = (name: string) => {
    window.dispatchEvent(new CustomEvent('select-service', { detail: name }));
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section id='services' className='sec bg-blush/30'>
      <div className='wrap'>
        <div className='mx-auto max-w-xl text-center'>
          <p className='eyebrow'>Services & pricing</p>
          <h2 className='h2 mt-2'>The treatment menu</h2>
        </div>
        <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {site.services.map((s) => (
            <article key={s.name} className='card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1'>
              <div className='overflow-hidden'><Img src={s.image} alt={s.name} className='h-44 w-full transition duration-500 group-hover:scale-105' /></div>
              <div className='flex flex-1 flex-col p-6'>
                <h3 className='text-2xl'>{s.name}</h3>
                <p className='mt-2 flex-1 text-sm text-espresso/75'>{s.desc}</p>
                <div className='mt-4 flex items-center justify-between text-sm'>
                  <span className='font-serif text-xl text-rose'>from ${s.price}</span>
                  <span className='flex items-center gap-1 text-espresso/60'><Clock size={14} /> {s.duration}</span>
                </div>
                <button onClick={() => pick(s.name)} className='btn btn-ghost mt-5'>Book Now</button>
              </div>
            </article>
          ))}
        </div>
        <p className='mx-auto mt-8 max-w-2xl text-center text-sm italic text-espresso/70'>{site.pricingNote}</p>
      </div>
    </section>
  );
}
