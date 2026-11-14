'use client';
import { MutableRefObject, useEffect, useRef } from 'react';
import { STAGES } from '@/config/hero';

type Progress = MutableRefObject<number>;
const N = STAGES.length;
const ease = (t: number) => t * t * (3 - 2 * t);
const BLUSH = [0.12, 0.22, 0.3, 0.26, 0.42];
const SHEEN = [0.05, 0.16, 0.24, 0.18, 0.3];
const SMILE = [1, 1.04, 1.08, 1.02, 1.14];

const SKIN = { base: '#c88b5f', light: '#e2a97b', shade: '#a56c47', deep: '#8a5638' };
const HAIR = { base: '#1c1311', hi: '#4a3631' };
const EYES = [{ x: 245, y: 312, dir: -1 }, { x: 355, y: 312, dir: 1 }];

export default function Ambassador({ progress, stage }: { progress: Progress; stage: number }) {
  const head = useRef<SVGGElement>(null);
  const body = useRef<SVGGElement>(null);
  const eyes = useRef<(SVGGElement | null)[]>([]);
  const irises = useRef<(SVGGElement | null)[]>([]);
  const closed = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    let nextBlink = 1.8, blinkStart = -1;
    const t0 = performance.now();
    const onMove = (e: PointerEvent) => {
      look.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      look.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove);
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const f = Math.min(1, Math.max(0, progress.current)) * (N - 1);
      const i = Math.floor(f);
      const swing = Math.sin(Math.PI * ease(f - i)) * (i % 2 ? -1 : 1);
      look.x += (look.tx - look.x) * 0.07;
      look.y += (look.ty - look.y) * 0.07;

      const rot = Math.sin(t * 0.6) * 1.2 + look.x * 3 + swing * 4;
      const tx = Math.sin(t * 0.45) * 4 + look.x * 8 + swing * 12;
      const ty = Math.sin(t * 0.9) * 2.5 + look.y * 4;
      head.current?.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) rotate(${rot.toFixed(2)} 300 480)`);
      body.current?.setAttribute('transform', `translate(0 ${(Math.sin(t * 1.6) * 2).toFixed(2)})`);

      if (blinkStart < 0 && t > nextBlink) blinkStart = t;
      let b = 0;
      if (blinkStart >= 0) {
        const u = (t - blinkStart) / 0.17;
        if (u >= 1) { blinkStart = -1; nextBlink = t + 2.2 + Math.random() * 3.6; if (Math.random() < 0.2) nextBlink = t + 0.3; }
        else b = Math.sin(Math.PI * u);
      }
      const s = 1 - b * 0.96;
      EYES.forEach((e, k) => {
        eyes.current[k]?.setAttribute('transform', `translate(${e.x} ${e.y}) scale(1 ${s.toFixed(3)}) translate(${-e.x} ${-e.y})`);
        irises.current[k]?.setAttribute('transform', `translate(${(look.x * 7).toFixed(2)} ${(look.y * 4).toFixed(2)})`);
        closed.current[k]?.setAttribute('opacity', b.toFixed(2));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
  }, [progress]);

  const st = STAGES[stage] ?? STAGES[0];
  const top = `color-mix(in srgb, #f4eee4 84%, ${st.aura} 16%)`;

  return (
    <svg viewBox='0 0 600 700' className='h-full w-auto' role='img' aria-label='Bloom Studio skincare ambassador' style={{ filter: `drop-shadow(0 24px 50px ${st.aura}99) brightness(${1 + st.glow * 0.18}) saturate(${1 + st.glow * 0.25})`, transition: 'filter .7s ease' }}>
      <defs>
        <radialGradient id='amb-face' cx='50%' cy='38%' r='70%'>
          <stop offset='0%' stopColor={SKIN.light} /><stop offset='55%' stopColor={SKIN.base} /><stop offset='100%' stopColor={SKIN.shade} />
        </radialGradient>
        <linearGradient id='amb-neck' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={SKIN.deep} /><stop offset='45%' stopColor={SKIN.shade} /><stop offset='100%' stopColor={SKIN.base} />
        </linearGradient>
        <linearGradient id='amb-body' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={SKIN.base} /><stop offset='100%' stopColor={SKIN.shade} />
        </linearGradient>
        <linearGradient id='amb-hair' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor={HAIR.hi} /><stop offset='35%' stopColor={HAIR.base} /><stop offset='100%' stopColor='#0f0908' />
        </linearGradient>
        <radialGradient id='amb-blush'><stop offset='0%' stopColor='#d9605a' stopOpacity='0.9' /><stop offset='100%' stopColor='#d9605a' stopOpacity='0' /></radialGradient>
        <radialGradient id='amb-sheen'><stop offset='0%' stopColor='#fff' stopOpacity='0.9' /><stop offset='100%' stopColor='#fff' stopOpacity='0' /></radialGradient>
        <linearGradient id='amb-lip' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stopColor='#c4766c' /><stop offset='100%' stopColor='#a9544f' /></linearGradient>
      </defs>

      <g ref={body}>
        <path d='M130 700 C130 560 160 480 240 470 L360 470 C440 480 470 560 470 700 Z' fill={HAIR.base} />
        <path d='M70 700 C80 610 150 566 232 548 L368 548 C450 566 520 610 530 700 Z' fill='url(#amb-body)' />
        <path d='M150 700 C150 625 176 588 206 572 L236 576 C262 645 338 645 364 576 L394 572 C424 588 450 625 450 700 Z' fill={top} style={{ transition: 'fill .7s ease' }} />
        <path d='M236 576 C262 645 338 645 364 576' fill='none' stroke='rgba(120,90,60,0.25)' strokeWidth='3' />
        <path d='M232 556 C262 566 280 568 292 566 M368 556 C338 566 320 568 308 566' fill='none' stroke='rgba(90,50,30,0.22)' strokeWidth='4' strokeLinecap='round' />
        <path d='M255 430 L345 430 L350 565 C320 590 280 590 250 565 Z' fill='url(#amb-neck)' />
        <ellipse cx='300' cy='488' rx='84' ry='24' fill='rgba(60,30,15,0.28)' />
      </g>

      <g ref={head}>
        <path d='M158 300 C140 160 220 96 300 96 C380 96 460 160 442 300 C452 420 470 520 486 640 L114 640 C130 520 148 420 158 300 Z' fill='url(#amb-hair)' transform='translate(0 8)' opacity='0.0' />
        <ellipse cx='178' cy='332' rx='15' ry='27' fill={SKIN.shade} />
        <ellipse cx='422' cy='332' rx='15' ry='27' fill={SKIN.shade} />
        <circle cx='178' cy='364' r='6' fill='#f4ebe0' /><circle cx='422' cy='364' r='6' fill='#f4ebe0' />
        <path d='M180 300 C180 212 236 165 300 165 C364 165 420 212 420 300 C420 384 382 456 300 474 C218 456 180 384 180 300 Z' fill='url(#amb-face)' />
        <ellipse cx='228' cy='366' rx='46' ry='34' fill='url(#amb-blush)' opacity={BLUSH[stage] ?? 0.2} style={{ transition: 'opacity .7s ease' }} />
        <ellipse cx='372' cy='366' rx='46' ry='34' fill='url(#amb-blush)' opacity={BLUSH[stage] ?? 0.2} style={{ transition: 'opacity .7s ease' }} />
        <ellipse cx='300' cy='222' rx='70' ry='24' fill='url(#amb-sheen)' opacity={SHEEN[stage] ?? 0.1} style={{ transition: 'opacity .7s ease' }} />
        <ellipse cx='238' cy='352' rx='24' ry='13' fill='url(#amb-sheen)' opacity={(SHEEN[stage] ?? 0.1) * 0.9} />
        <ellipse cx='362' cy='352' rx='24' ry='13' fill='url(#amb-sheen)' opacity={(SHEEN[stage] ?? 0.1) * 0.9} />
        <ellipse cx='300' cy='362' rx='9' ry='15' fill='url(#amb-sheen)' opacity={(SHEEN[stage] ?? 0.1) * 0.7} />

        {EYES.map((e, k) => (
          <g key={k}>
            <path d={`M${e.x - 36} ${e.y - 38} C${e.x - 14} ${e.y - 54} ${e.x + 14} ${e.y - 56} ${e.x + 36} ${e.y - 42}`} fill='none' stroke={HAIR.base} strokeWidth='10' strokeLinecap='round' transform={`rotate(${e.dir * -4} ${e.x} ${e.y - 46})`} />
            <path d={`M${e.x - 40} ${e.y - 14} C${e.x - 18} ${e.y - 38} ${e.x + 18} ${e.y - 38} ${e.x + 40} ${e.y - 14}`} fill='none' stroke='rgba(90,50,30,0.35)' strokeWidth='3' strokeLinecap='round' />
            <g ref={(el) => { eyes.current[k] = el; }}>
              <ellipse cx={e.x} cy={e.y} rx='31' ry='21' fill='#f7f0e8' />
              <g ref={(el) => { irises.current[k] = el; }}>
                <circle cx={e.x} cy={e.y} r='16.5' fill='#4a2b18' />
                <circle cx={e.x} cy={e.y} r='11' fill='#2a150b' opacity='0.55' />
                <circle cx={e.x} cy={e.y} r='7.5' fill='#0b0605' />
                <circle cx={e.x + 6} cy={e.y - 6} r='4.4' fill='#fff' opacity='0.95' />
                <circle cx={e.x - 5} cy={e.y + 6} r='2' fill='#fff' opacity='0.55' />
              </g>
              <path d={`M${e.x - 33} ${e.y} C${e.x - 18} ${e.y - 20} ${e.x + 18} ${e.y - 20} ${e.x + 33} ${e.y} C${e.x + 20} ${e.y - 11} ${e.x - 20} ${e.y - 11} ${e.x - 33} ${e.y} Z`} fill='rgba(40,20,12,0.35)' />
              <path d={`M${e.x - 34} ${e.y + 1} C${e.x - 16} ${e.y - 24} ${e.x + 16} ${e.y - 24} ${e.x + 34} ${e.y + 1}`} fill='none' stroke='#150b08' strokeWidth='5.5' strokeLinecap='round' />
              <path d={`M${e.x + e.dir * 30} ${e.y - 1} l${e.dir * 9} -7 M${e.x + e.dir * 22} ${e.y - 9} l${e.dir * 8} -9`} stroke='#150b08' strokeWidth='3' strokeLinecap='round' />
            </g>
            <path ref={(el) => { closed.current[k] = el; }} d={`M${e.x - 33} ${e.y + 2} C${e.x - 14} ${e.y + 14} ${e.x + 14} ${e.y + 14} ${e.x + 33} ${e.y + 2}`} fill='none' stroke='#150b08' strokeWidth='5' strokeLinecap='round' opacity='0' />
          </g>
        ))}

        <path d='M300 318 C296 350 286 366 284 372 C292 380 308 380 316 372 C314 366 304 350 300 318' fill='none' stroke='rgba(110,60,35,0.38)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
        <ellipse cx='292' cy='376' rx='3.5' ry='2.2' fill='rgba(70,35,20,0.45)' /><ellipse cx='308' cy='376' rx='3.5' ry='2.2' fill='rgba(70,35,20,0.45)' />

        <g style={{ transformOrigin: '300px 420px', transform: `scaleX(${SMILE[stage] ?? 1})`, transition: 'transform .7s ease' }}>
          <path d='M262 420 C278 408 292 406 300 412 C308 406 322 408 338 420 C322 426 278 426 262 420 Z' fill='url(#amb-lip)' />
          <path d='M264 421 C290 450 310 450 336 421 C320 428 280 428 264 421 Z' fill='#cc7c71' />
          <path d='M282 436 C294 441 306 441 318 436' stroke='rgba(255,255,255,0.45)' strokeWidth='3' fill='none' strokeLinecap='round' />
          <path d='M262 420 C258 418 256 414 257 410 M338 420 C342 418 344 414 343 410' stroke='rgba(110,60,35,0.35)' strokeWidth='2.5' fill='none' strokeLinecap='round' />
        </g>

        <path d='M172 316 C164 196 232 138 300 138 C368 138 436 196 428 316 C418 246 372 206 300 202 C228 206 182 246 172 316 Z' fill='url(#amb-hair)' />
        <path d='M300 202 C298 176 300 156 300 140' stroke={HAIR.hi} strokeWidth='2.5' fill='none' opacity='0.8' />
        <path d='M262 160 C230 176 204 214 196 262 M338 160 C370 176 396 214 404 262' stroke={HAIR.hi} strokeWidth='2' fill='none' opacity='0.5' />
      </g>

      <g ref={undefined}>
        <path d='M176 312 C150 400 138 520 146 640 L204 640 C200 540 206 420 220 330 Z' fill='url(#amb-hair)' />
        <path d='M424 312 C450 400 462 520 454 640 L396 640 C400 540 394 420 380 330 Z' fill='url(#amb-hair)' />
        <path d='M176 380 C166 460 160 540 164 620 M424 380 C434 460 440 540 436 620' stroke={HAIR.hi} strokeWidth='2.2' fill='none' opacity='0.45' />
      </g>
    </svg>
  );
}
