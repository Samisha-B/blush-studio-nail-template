'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { site } from '@/config/site';
import Img from './Img';

export type Line = { id: string; name: string; variant?: string; price: number; image?: string; qty: number };
const Ctx = createContext<any>(null);
export const useCart = () => useContext(Ctx);
const keyOf = (l: { id: string; variant?: string }) => l.id + '|' + (l.variant || '');

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const add = (l: Omit<Line, 'qty'>) => {
    setLines((p) => {
      const i = p.findIndex((x) => keyOf(x) === keyOf(l));
      if (i > -1) { const c = [...p]; c[i] = { ...c[i], qty: c[i].qty + 1 }; return c; }
      return [...p, { ...l, qty: 1 }];
    });
    setOpen(true);
  };
  const setQty = (k: string, q: number) => setLines((p) => p.map((x) => (keyOf(x) === k ? { ...x, qty: q } : x)).filter((x) => x.qty > 0));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return <Ctx.Provider value={{ lines, add, setQty, count, subtotal, open, setOpen }}>{children}</Ctx.Provider>;
}

export function CartDrawer() {
  const c = useCart();
  const url = site.shop.checkoutUrl;
  return (
    <div className={`fixed inset-0 z-50 ${c.open ? '' : 'pointer-events-none'}`} aria-hidden={!c.open}>
      <div onClick={() => c.setOpen(false)} className={`absolute inset-0 bg-espresso/40 transition ${c.open ? 'opacity-100' : 'opacity-0'}`} />
      <aside role='dialog' aria-label='Shopping cart' className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-soft transition-transform duration-300 ${c.open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex items-center justify-between border-b border-espresso/10 p-5'>
          <h2 className='font-serif text-2xl'>Your bag ({c.count})</h2>
          <button aria-label='Close cart' onClick={() => c.setOpen(false)}><X /></button>
        </div>
        <div className='flex-1 space-y-4 overflow-y-auto p-5'>
          {c.lines.length === 0 && <p className='text-espresso/60'>Your bag is empty.</p>}
          {c.lines.map((l: Line) => (
            <div key={keyOf(l)} className='flex gap-3'>
              <Img src={l.image} alt={l.name} className='h-20 w-20 rounded-xl text-xs' />
              <div className='flex-1'>
                <p className='font-medium'>{l.name}</p>
                {l.variant && <p className='text-xs text-espresso/60'>{l.variant}</p>}
                <div className='mt-2 flex items-center gap-2'>
                  <button aria-label='Decrease quantity' className='rounded-full border p-1' onClick={() => c.setQty(keyOf(l), l.qty - 1)}><Minus size={14} /></button>
                  <span className='w-6 text-center text-sm'>{l.qty}</span>
                  <button aria-label='Increase quantity' className='rounded-full border p-1' onClick={() => c.setQty(keyOf(l), l.qty + 1)}><Plus size={14} /></button>
                  <button className='ml-auto text-xs underline' onClick={() => c.setQty(keyOf(l), 0)}>Remove</button>
                </div>
              </div>
              <p className='text-sm'>${(l.price * l.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className='border-t border-espresso/10 p-5'>
          <div className='mb-4 flex justify-between font-serif text-xl'><span>Subtotal</span><span>${c.subtotal.toFixed(2)}</span></div>
          {url ? (
            <a href={url} className='btn btn-primary w-full'>Checkout</a>
          ) : (
            <>
              <button disabled className='btn btn-primary w-full cursor-not-allowed opacity-50'>Checkout</button>
              <p className='mt-2 text-center text-xs text-espresso/60'>Demo: connect Shopify, Stripe or Square in config/site.ts to enable checkout.</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
