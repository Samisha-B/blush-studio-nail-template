'use client';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/config/site';

export default function Img({ src, alt, className = '', eager = false }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  const [bad, setBad] = useState(!src);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (eager && el && el.complete && el.naturalWidth === 0) setBad(true);
  }, [eager]);
  if (bad)
    return (
      <div role='img' aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-blush via-cream to-rose/30 text-center font-serif italic text-mauve/70 ${className}`}>
        {site.brand.name}
      </div>
    );
  return <img ref={ref} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={() => setBad(true)} className={`object-cover ${className}`} />;
}
