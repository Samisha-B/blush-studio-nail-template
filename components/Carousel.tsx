'use client';
import { ReactNode, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const r = useRef<HTMLDivElement>(null);
  const go = (d: number) => r.current?.scrollBy({ left: d * r.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className='relative'>
      <div ref={r} role='region' aria-label={label} tabIndex={0} className='no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2'>{children}</div>
      <div className='mt-4 flex justify-end gap-2'>
        <button aria-label='Previous' onClick={() => go(-1)} className='rounded-full border border-espresso/20 p-2 transition hover:bg-blush'><ChevronLeft size={18} /></button>
        <button aria-label='Next' onClick={() => go(1)} className='rounded-full border border-espresso/20 p-2 transition hover:bg-blush'><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}
