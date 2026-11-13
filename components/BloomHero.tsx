'use client';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/config/site';

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function Face({ src, tone, back }: { src: string; tone: 'statue' | 'real'; back?: boolean }) {
  const [ok, setOk] = useState(true);
  const skin = tone === 'statue' ? '#dfe3ea' : '#e8bfa6';
  const cloth = tone === 'statue' ? '#c4cbd8' : '#6b7d68';
  return (
    <div className='bh-face' style={{ transform: back ? 'rotateY(180deg)' : undefined }}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt='' onError={() => setOk(false)} className='h-full w-full object-contain' style={back ? { transform: 'scaleX(-1)' } : undefined} />
      ) : (
        <svg viewBox='0 0 200 360' className='h-full w-full'>
          <path d='M20 360 C20 270 60 240 100 240 C140 240 180 270 180 360Z' fill={cloth} />
          <rect x='88' y='200' width='24' height='48' rx='10' fill={skin} />
          <ellipse cx='100' cy='140' rx='48' ry='62' fill={skin} />
          <path d='M50 130 C50 60 150 60 150 130 C140 90 60 90 50 130Z' fill={tone === 'statue' ? '#b9c1d0' : '#5a3b2a'} />
        </svg>
      )}
    </div>
  );
}

export default function BloomHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        setP(clamp(-r.top / (r.height - window.innerHeight)));
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  const h = site.hero;
  const items = h.orbit;
  const step = 360 / items.length;
  const figureRot = p * 720;
  const swap = smooth(0.42, 0.58, p);
  const ringRot = -p * 360;
  const pct = Math.round(p * 100);
  const bg = `hsl(${140 - swap * 100} ${18 + swap * 22}% ${88 - swap * 4}%)`;

  return (
    <section id='home' ref={ref} className='relative' style={{ height: '450vh' }}>
      <div className='sticky top-0 h-screen w-full overflow-hidden transition-colors' style={{ background: bg }}>
        <div className='bh-grid absolute inset-0' />
        <div className='pointer-events-none absolute inset-x-0 top-[26%] z-10 flex items-center justify-between px-6 md:px-12'>
          <h1 className='font-serif text-[15vw] leading-none text-espresso md:text-[9vw]'>{h.headline[0]}</h1>
          <span className='mx-4 hidden h-[6px] flex-1 rounded-full bg-rose md:block' />
          <h1 className='font-serif text-[15vw] leading-none text-espresso md:text-[9vw]'>{h.headline[1]}</h1>
        </div>

        <div className='absolute inset-0 z-20 flex items-center justify-center' style={{ perspective: '1400px' }}>
          <div className='bh-ring' style={{ transform: `translateY(2%) rotateY(${ringRot}deg)` }}>
            {items.map((it: { src: string; label: string }, i: number) => {
              const ang = i * step + ringRot;
              const front = Math.cos((ang * Math.PI) / 180);
              return (
                <div key={i} className='bh-card' style={{ transform: `rotateY(${i * step}deg) translateZ(min(34vw, 380px))`, opacity: 0.35 + 0.65 * clamp(front * 0.5 + 0.5) }}>
                  <div className='bh-ph'>{it.label}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} alt={it.label} className='absolute inset-0 h-full w-full object-cover' onError={(e) => ((e.currentTarget.style.display = 'none'))} />
                  <span className='absolute bottom-2 left-3 rounded-full bg-cream/85 px-3 py-1 text-[11px] uppercase tracking-widest text-espresso'>{it.label}</span>
                </div>
              );
            })}
          </div>
          <div className='bh-figure' style={{ transform: `rotateY(${figureRot}deg)` }}>
            <div className='absolute inset-0' style={{ opacity: 1 - swap }}>
              <Face src={h.figureA} tone='statue' /><Face src={h.figureA} tone='statue' back />
            </div>
            <div className='absolute inset-0' style={{ opacity: swap }}>
              <Face src={h.figureB} tone='real' /><Face src={h.figureB} tone='real' back />
            </div>
          </div>
        </div>

        <div className='absolute bottom-6 left-0 right-0 z-30 mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6'>
          <p className='max-w-sm text-sm text-espresso/75'>{h.sub}</p>
          <div className='flex items-center gap-3'>
            <span className='text-xs uppercase tracking-[0.25em] text-espresso/60'>{pct}% · scroll</span>
            <a href='#booking' className='btn btn-primary'>Book a Treatment</a>
          </div>
        </div>
      </div>
    </section>
  );
}
