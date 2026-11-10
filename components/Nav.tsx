'use client';
import { useEffect, useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { site } from '@/config/site';
import { useCart } from './Cart';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const cart = useCart();
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 20);
    f();
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);
  const links = site.nav.filter((l) => site.shop.enabled || l.href !== '#shop');
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition ${solid || open ? 'border-b border-espresso/10 bg-cream/90 backdrop-blur' : ''}`}>
      <div className='wrap flex h-[72px] items-center justify-between'>
        <a href='#home' className='font-serif text-2xl'>{site.brand.name}</a>
        <nav aria-label='Main' className='hidden items-center gap-7 text-sm lg:flex'>
          {links.map((l) => <a key={l.href} href={l.href} className='transition hover:text-rose'>{l.label}</a>)}
        </nav>
        <div className='flex items-center gap-3'>
          {site.shop.enabled && (
            <button aria-label='Open cart' onClick={() => cart.setOpen(true)} className='relative p-2'>
              <ShoppingBag size={20} />
              {cart.count > 0 && <span className='absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-rose text-[10px] text-white'>{cart.count}</span>}
            </button>
          )}
          <a href='#booking' className='btn btn-primary hidden sm:inline-flex'>Book Appointment</a>
          <button className='p-2 lg:hidden' aria-label='Toggle menu' aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav aria-label='Mobile' className='flex flex-col border-t border-espresso/10 px-5 pb-6 pt-2 lg:hidden'>
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className='border-b border-espresso/5 py-3 font-serif text-2xl'>{l.label}</a>)}
          <a href='#booking' onClick={() => setOpen(false)} className='btn btn-primary mt-4'>Book Appointment</a>
        </nav>
      )}
    </header>
  );
}
