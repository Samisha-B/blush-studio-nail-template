'use client';
import { useState } from 'react';
import { site } from '@/config/site';
import Img from './Img';
import { useCart } from './Cart';

function Product({ p }: { p: any }) {
  const cart = useCart();
  const [variant, setVariant] = useState<string>(p.variants?.[0] || '');
  return (
    <article className='card group overflow-hidden'>
      <div className='overflow-hidden'><Img src={p.image} alt={p.name} className='aspect-square w-full transition duration-500 group-hover:scale-105' /></div>
      <div className='p-5'>
        <div className='flex items-baseline justify-between'><h3 className='text-xl'>{p.name}</h3><span className='font-serif text-lg text-rose'>${p.price}</span></div>
        <p className='mt-1 text-sm text-espresso/70'>{p.desc}</p>
        {p.variants && (
          <select aria-label={`${p.name} option`} value={variant} onChange={(e) => setVariant(e.target.value)} className='field mt-3'>
            {p.variants.map((v: string) => <option key={v}>{v}</option>)}
          </select>
        )}
        <button className='btn btn-primary mt-4 w-full' onClick={() => cart.add({ id: p.id, name: p.name, variant, price: p.price, image: p.image })}>Add to Cart</button>
      </div>
    </article>
  );
}

export default function Shop() {
  return (
    <section id='shop' className='sec'>
      <div className='wrap'>
        <div className='mx-auto max-w-xl text-center'>
          <p className='eyebrow'>The shop</p>
          <h2 className='h2 mt-2'>Take the glow home</h2>
        </div>
        <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>{site.shop.products.map((p) => <Product key={p.id} p={p} />)}</div>
      </div>
    </section>
  );
}
