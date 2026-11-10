import { site } from '@/config/site';
import Img from './Img';

export default function About() {
  const a = site.about;
  return (
    <section id='about' className='sec'>
      <div className='wrap grid items-center gap-12 md:grid-cols-2'>
        <Img src={a.image} alt={a.imageAlt} eager className='aspect-[4/5] w-full rounded-3xl shadow-soft' />
        <div>
          <p className='eyebrow'>{a.eyebrow}</p>
          <h2 className='h2 mt-2'>{a.title}</h2>
          <div className='mt-6 space-y-4 text-espresso/80'>{a.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
          <div className='mt-8 grid grid-cols-3 gap-4 border-y border-espresso/10 py-6 text-center'>
            {a.stats.map(([n, l]) => <div key={l}><p className='font-serif text-3xl text-rose'>{n}</p><p className='text-xs text-espresso/70'>{l}</p></div>)}
          </div>
          <p className='mt-6 font-serif text-xl italic text-mauve'>{a.personal}</p>
        </div>
      </div>
    </section>
  );
}
