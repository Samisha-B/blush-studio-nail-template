'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/config/site';
import { STAGES } from '@/config/hero';
import Ambassador from './Ambassador';

const BloomOrbit = dynamic(() => import('./BloomOrbit'), { ssr: false });
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

export default function BloomHero() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrap.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const p = clamp(-r.top / (r.height - window.innerHeight));
        progress.current = p;
        setIdx(Math.round(p * (STAGES.length - 1)));
        setPct(Math.round(p * 100));
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  const s = STAGES[idx];
  return (
    <section id='home' ref={wrap} className='relative' style={{ height: '520vh' }}>
      <div className='sticky top-0 h-screen w-full overflow-hidden transition-[background] duration-700' style={{ background: `linear-gradient(160deg, ${s.bg[0]}, ${s.bg[1]})` }}>
        <div className='bh-grid absolute inset-0' />
        <h1 className='pointer-events-none absolute inset-x-0 top-[18%] z-0 select-none text-center font-serif text-[22vw] leading-none text-espresso/10 md:text-[16vw]'>{site.brand.name.split(' ')[0]}</h1>

        <div className='absolute inset-0 z-[5]'>
          <BloomOrbit progress={progress} auraColor={s.aura} />
        </div>

        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-[88%] justify-center pt-24'>
          <Ambassador progress={progress} stage={idx} />
        </div>
        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[16%] transition-[background] duration-700' style={{ background: `linear-gradient(to top, ${s.bg[1]} 20%, transparent)` }} />

        <div className='pointer-events-none absolute left-6 top-28 z-20 max-w-xs md:left-12'>
          <p className='eyebrow'>Step {String(idx + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}</p>
          <h2 key={s.key} className='bh-in mt-2 font-serif text-6xl text-espresso md:text-7xl'>{s.title}</h2>
          <p key={s.key + 'b'} className='bh-in mt-3 text-sm text-espresso/75'>{s.blurb}</p>
          <p className='mt-4 inline-block rounded-full border border-espresso/30 px-4 py-1 text-xs uppercase tracking-widest text-espresso'>{s.product}</p>
        </div>

        <div className='absolute bottom-6 left-0 right-0 z-20 mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6'>
          <p className='max-w-sm text-sm text-espresso/75'>{site.hero.sub}</p>
          <div className='flex items-center gap-4'>
            <div className='flex gap-2'>{STAGES.map((st, i) => <span key={st.key} className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-espresso' : 'w-2 bg-espresso/30'}`} />)}</div>
            <span className='text-xs uppercase tracking-[0.25em] text-espresso/60'>{pct}%</span>
            <a href='#booking' className='btn btn-primary'>Book a Treatment</a>
          </div>
        </div>
      </div>
    </section>
  );
}
