'use client';
import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { site } from '@/config/site';
import Img from './Img';
import Carousel from './Carousel';

export default function Gallery() {
  const g = site.gallery;
  const [cat, setCat] = useState('All');
  const [idx, setIdx] = useState<number | null>(null);
  const items = useMemo(() => (cat === 'All' ? g.items : g.items.filter((i) => i.category === cat)), [cat]);
  const feat = g.items.filter((i) => i.featured);

  useEffect(() => {
    if (idx === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [idx, items.length]);

  const openFeatured = (src: string) => { setCat('All'); setIdx(g.items.findIndex((i) => i.src === src)); };
  const cur = idx !== null ? (cat === 'All' ? g.items : items)[idx] : null;

  return (
    <section id='gallery' className='sec'>
      <div className='wrap'>
        <div className='mx-auto max-w-xl text-center'>
          <p className='eyebrow'>Nail gallery</p>
          <h2 className='h2 mt-2'>Little works of art</h2>
        </div>

        <div className='mt-12'>
          <h3 className='mb-4 font-serif text-2xl italic text-mauve'>Featured designs</h3>
          <Carousel label='Featured nail designs'>
            {feat.map((i) => (
              <button key={i.src} onClick={() => openFeatured(i.src)} className='group w-60 shrink-0 snap-start overflow-hidden rounded-2xl shadow-soft'>
                <Img src={i.src} alt={i.alt} className='aspect-[3/4] w-full transition duration-500 group-hover:scale-105' />
              </button>
            ))}
          </Carousel>
        </div>

        <div className='mt-12 flex flex-wrap justify-center gap-2' role='group' aria-label='Filter gallery'>
          {g.categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-full border px-4 py-2 text-sm transition ${cat === c ? 'border-espresso bg-espresso text-cream' : 'border-espresso/20 hover:bg-blush'}`}>{c}</button>
          ))}
        </div>

        <div className='mt-8 columns-2 gap-4 md:columns-3'>
          {items.map((i, n) => (
            <button key={i.src} onClick={() => setIdx(n)} className='group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl'>
              <Img src={i.src} alt={i.alt} className={`w-full transition duration-500 group-hover:scale-105 ${i.tall ? 'aspect-[3/4]' : 'aspect-square'}`} />
              <span className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/60 to-transparent p-3 text-left text-sm text-cream opacity-0 transition group-hover:opacity-100'>{i.category}</span>
            </button>
          ))}
        </div>

        <div className='mt-10 text-center'>
          <p className='font-serif text-2xl italic'>Love a design? Let’s recreate it!</p>
          <a href='#booking' className='btn btn-primary mt-4'>Request this look</a>
        </div>
      </div>

      {cur && (
        <div role='dialog' aria-modal='true' aria-label='Image preview' className='fixed inset-0 z-50 flex items-center justify-center bg-espresso/90 p-4' onClick={() => setIdx(null)}>
          <button aria-label='Close' className='absolute right-4 top-4 text-cream' onClick={() => setIdx(null)}><X size={28} /></button>
          <button aria-label='Previous' className='absolute left-3 text-cream' onClick={(e) => { e.stopPropagation(); setIdx((idx + (cat === 'All' ? g.items : items).length - 1) % (cat === 'All' ? g.items : items).length); }}><ChevronLeft size={36} /></button>
          <div onClick={(e) => e.stopPropagation()} className='max-h-[85vh] w-full max-w-lg'>
            <Img src={cur.src} alt={cur.alt} className='max-h-[80vh] w-full rounded-2xl' />
            <p className='mt-3 text-center text-cream'>{cur.alt}</p>
          </div>
          <button aria-label='Next' className='absolute right-3 text-cream' onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % (cat === 'All' ? g.items : items).length); }}><ChevronRight size={36} /></button>
        </div>
      )}
    </section>
  );
}
