import { ChevronDown } from 'lucide-react';
import { site } from '@/config/site';

export default function FAQ() {
  return (
    <section id='faq' className='sec bg-blush/30'>
      <div className='wrap max-w-3xl'>
        <div className='text-center'>
          <p className='eyebrow'>Good to know</p>
          <h2 className='h2 mt-2'>Frequently asked questions</h2>
        </div>
        <div className='mt-10 space-y-3'>
          {site.faq.map((f) => (
            <details key={f.q} className='card group p-5'>
              <summary className='flex cursor-pointer list-none items-center justify-between font-serif text-xl'>{f.q}<ChevronDown size={18} className='transition group-open:rotate-180' /></summary>
              <p className='mt-3 text-sm text-espresso/75'>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
