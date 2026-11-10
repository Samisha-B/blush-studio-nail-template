import { Star } from 'lucide-react';
import { site } from '@/config/site';
import Carousel from './Carousel';

export default function Reviews() {
  return (
    <section id='reviews' className='sec bg-blush/30'>
      <div className='wrap'>
        <div className='mx-auto max-w-xl text-center'>
          <p className='eyebrow'>Kind words</p>
          <h2 className='h2 mt-2'>Loved by our clients</h2>
        </div>
        <div className='mt-12'>
          <Carousel label='Customer reviews'>
            {site.reviews.map((r) => (
              <figure key={r.name} className='card w-80 shrink-0 snap-start p-7'>
                <div className='flex gap-0.5 text-gold' aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill={i < r.rating ? 'currentColor' : 'none'} />)}</div>
                <blockquote className='mt-4 font-serif text-xl italic leading-snug'>“{r.text}”</blockquote>
                <figcaption className='mt-4 text-sm text-espresso/70'>{r.name}</figcaption>
              </figure>
            ))}
          </Carousel>
          <p className='mt-4 text-center text-xs text-espresso/60'>{site.reviewsNote}</p>
        </div>
      </div>
    </section>
  );
}
