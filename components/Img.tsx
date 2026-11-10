'use client';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/config/site';

export default function Img({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [bad, setBad] = useState(!src);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBad(true);
  }, []);
  if (bad)
    return (
      <div role='img' aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-blush via-cream to-rose/30 text-center font-serif italic text-mauve/70 ${className}`}>
        {site.brand.name}
      </div>
    );
  return <img ref={ref} src={src} alt={alt} loading='lazy' onError={() => setBad(true)} className={`object-cover ${className}`} />;
}
