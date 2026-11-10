import { MapPin } from 'lucide-react';
import { site } from '@/config/site';
import Img from './Img';

export default function Hero() {
  const h = site.hero;
  return (
    <section id='home' className='pb-16 pt-28 md:pt-36'>
      <div className='wrap grid items-center gap-12 md:grid-cols-2'>
        <div>
          <p className='eyebrow'>{site.brand.tagline}</p>
          <h1 className='mt-4 text-5xl leading-[1.05] md:text-7xl'>{h.headline[0]} <em className='text-rose'>{h.headline[1]}</em></h1>
          <p className='mt-6 max-w-md text-lg text-espresso/75'>{h.sub}</p>
          <div className='mt-8 flex flex-wrap gap-3'>
            <a href='#booking' className='btn btn-primary'>Book Your Appointment</a>
            <a href='#gallery' className='btn btn-ghost'>Explore Our Work</a>
          </div>
          <p className='mt-8 flex items-center gap-2 text-sm text-mauve'><MapPin size={16} /> Based in {site.brand.city}</p>
        </div>
        <div className='relative'>
          <Img src={h.image} alt={h.imageAlt} className='aspect-[4/5] w-full rounded-t-[999px] rounded-b-3xl shadow-soft' />
          <div className='card absolute -bottom-4 -left-4 hidden px-5 py-4 font-serif italic md:block'>★ 5.0 · loved by 300+ clients</div>
        </div>
      </div>
    </section>
  );
}
