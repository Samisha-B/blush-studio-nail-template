'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { site } from '@/config/site';
import Img from './Img';

export default function HeroSlider() {
  const h: any = site.hero;
  const slides: { src: string; alt: string }[] = h.slides ?? [
    { src: h.image, alt: h.imageAlt },
    { src: site.about.image, alt: site.about.imageAlt },
  ];
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <div className='relative' role='region' aria-roledescription='carousel' aria-label='Featured nail photography' onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className='relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-soft'>
        {slides.map((s, k) => (
          <div key={s.src} aria-hidden={k !== i} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`}>
            <Img src={s.src} alt={s.alt} eager className='h-full w-full' />
          </div>
        ))}
        {n > 1 && (
          <>
            <button aria-label='Previous slide' onClick={() => setI((i - 1 + n) % n)} className='absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/80 p-2 transition hover:bg-cream'><ChevronLeft size={18} /></button>
            <button aria-label='Next slide' onClick={() => setI((i + 1) % n)} className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/80 p-2 transition hover:bg-cream'><ChevronRight size={18} /></button>
            <div className='absolute inset-x-0 bottom-5 flex justify-center gap-2'>
              {slides.map((_, k) => (
                <button key={k} aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-cream' : 'w-2 bg-cream/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className='card absolute -bottom-4 -left-4 hidden px-5 py-4 font-serif italic md:block'>★ 5.0 · loved by 300+ clients</div>
    </div>
  );
}
