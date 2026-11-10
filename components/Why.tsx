import { Sparkles, Gem, Eye, ShieldCheck, Flower2, HeartHandshake } from 'lucide-react';
import { site } from '@/config/site';

const icons: Record<string, any> = { sparkles: Sparkles, gem: Gem, eye: Eye, shield: ShieldCheck, flower: Flower2, heart: HeartHandshake };

export default function Why() {
  return (
    <section id='why' className='sec'>
      <div className='wrap'>
        <div className='mx-auto max-w-xl text-center'>
          <p className='eyebrow'>Why choose us</p>
          <h2 className='h2 mt-2'>The Blush difference</h2>
        </div>
        <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {site.why.map((w) => {
            const I = icons[w.icon] || Sparkles;
            return (
              <div key={w.title} className='text-center'>
                <div className='mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/60 bg-blush/50 text-mauve'><I size={24} strokeWidth={1.5} /></div>
                <h3 className='mt-4 text-2xl'>{w.title}</h3>
                <p className='mx-auto mt-2 max-w-xs text-sm text-espresso/75'>{w.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
