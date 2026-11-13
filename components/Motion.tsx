'use client';
import { ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { STAGES } from '@/config/hero';

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div style={{ scaleX }} className='fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-rose' />;
}

export function Marquee() {
  const words = [...STAGES.map((s) => s.product), 'Skincare', 'Wellness', 'Glow'];
  const row = [...words, ...words];
  return (
    <div className='overflow-hidden border-y border-espresso/10 bg-cream py-4'>
      <div className='bh-marquee flex w-max gap-10 whitespace-nowrap font-serif text-2xl text-espresso/70'>
        {row.concat(row).map((w, i) => <span key={i} className='flex items-center gap-10'>{w}<span className='text-rose'>✦</span></span>)}
      </div>
    </div>
  );
}
