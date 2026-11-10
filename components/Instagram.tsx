import { Instagram as IG } from 'lucide-react';
import { site } from '@/config/site';
import Img from './Img';

export default function Instagram() {
  const i = site.instagram;
  return (
    <section id='instagram' className='sec'>
      <div className='wrap text-center'>
        <p className='eyebrow'>On Instagram</p>
        <h2 className='h2 mt-2'>@{i.handle}</h2>
        <div className='mt-10 grid grid-cols-2 gap-3 md:grid-cols-6'>
          {i.images.map((src, n) => (
            <a key={src} href={`https://instagram.com/${i.handle}`} target='_blank' rel='noopener noreferrer' aria-label={`View post ${n + 1} on Instagram`} className='group relative overflow-hidden rounded-xl'>
              <Img src={src} alt={`Recent nail design ${n + 1}`} className='aspect-square w-full transition duration-500 group-hover:scale-110' />
              <span className='absolute inset-0 grid place-items-center bg-espresso/40 text-cream opacity-0 transition group-hover:opacity-100'><IG /></span>
            </a>
          ))}
        </div>
        <a href={`https://instagram.com/${i.handle}`} target='_blank' rel='noopener noreferrer' className='btn btn-primary mt-8'><IG size={16} /> Follow on Instagram</a>
      </div>
    </section>
  );
}
