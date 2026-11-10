'use client';
import { ReactNode, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { site } from '@/config/site';

const F = ({ label, name, err, children }: { label: string; name: string; err?: string; children: ReactNode }) => (
  <div>
    <label htmlFor={name} className='mb-1.5 block text-sm font-medium'>{label}</label>
    {children}
    {err && <p role='alert' className='mt-1 text-xs text-red-700'>{err}</p>}
  </div>
);

export default function Booking() {
  const b = site.booking;
  const [v, setV] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [serverErr, setServerErr] = useState('');
  const set = (n: string, val: any) => setV((p) => ({ ...p, [n]: val }));

  useEffect(() => {
    const h = (e: Event) => set('service', (e as CustomEvent).detail);
    window.addEventListener('select-service', h);
    return () => window.removeEventListener('select-service', h);
  }, []);

  const bind = (n: string) => ({ id: n, name: n, value: v[n] || '', className: 'field', 'aria-invalid': !!errors[n], onChange: (e: any) => set(n, e.target.value) });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!v.name?.trim()) e.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(v.email || '')) e.email = 'Enter a valid email address.';
    if ((v.phone || '').replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit phone number.';
    if (!v.service) e.service = 'Choose a service.';
    if (!v.date) e.date = 'Choose a preferred date.';
    else if (new Date(v.date) < new Date(new Date().toDateString())) e.date = 'Date must be today or later.';
    if (!v.time) e.time = 'Choose a preferred time.';
    if (!v.agree) e.agree = 'Please acknowledge the booking and cancellation policies.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, inspirationFile: v.file?.name || null, file: undefined }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setStatus('done');
    } catch (err: any) {
      setServerErr(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id='booking' className='sec bg-blush/30'>
      <div className='wrap max-w-3xl'>
        <div className='text-center'>
          <p className='eyebrow'>Book your visit</p>
          <h2 className='h2 mt-2'>Request an appointment</h2>
          <p className='mt-3 text-espresso/75'>This is a request, not a confirmed booking. We’ll email you within 24 hours to confirm your time.</p>
          {b.externalUrl && <a href={b.externalUrl} target='_blank' rel='noopener noreferrer' className='btn btn-ghost mt-4'>{b.externalLabel}</a>}
        </div>

        {status === 'done' ? (
          <div className='card mt-10 p-10 text-center' role='status'>
            <CheckCircle2 className='mx-auto text-rose' size={44} />
            <h3 className='mt-4 text-3xl'>Request received, {v.name?.split(' ')[0]}!</h3>
            <p className='mt-3 text-espresso/75'>Thanks for requesting <b>{v.service}</b> on {v.date} around {v.time}. Your appointment is <b>not confirmed yet</b>. We’ll email {v.email} to confirm or suggest another time.</p>
            <button className='btn btn-ghost mt-6' onClick={() => { setV({}); setStatus('idle'); }}>Send another request</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className='card mt-10 grid gap-5 p-6 md:grid-cols-2 md:p-10'>
            <F label='Full name *' name='name' err={errors.name}><input {...bind('name')} autoComplete='name' /></F>
            <F label='Email address *' name='email' err={errors.email}><input type='email' {...bind('email')} autoComplete='email' /></F>
            <F label='Phone number *' name='phone' err={errors.phone}><input type='tel' {...bind('phone')} autoComplete='tel' /></F>
            <F label='Preferred service *' name='service' err={errors.service}>
              <select {...bind('service')}><option value=''>Select a service</option>{site.services.map((s) => <option key={s.name}>{s.name}</option>)}</select>
            </F>
            <F label='Preferred date *' name='date' err={errors.date}><input type='date' min={today} {...bind('date')} /></F>
            <F label='Preferred time *' name='time' err={errors.time}>
              <select {...bind('time')}><option value=''>Select a time</option>{b.times.map((t) => <option key={t}>{t}</option>)}</select>
            </F>
            <F label='Nail length' name='length'><select {...bind('length')}><option value=''>No preference</option>{b.lengths.map((t) => <option key={t}>{t}</option>)}</select></F>
            <F label='Nail shape' name='shape'><select {...bind('shape')}><option value=''>No preference</option>{b.shapes.map((t) => <option key={t}>{t}</option>)}</select></F>
            <div className='md:col-span-2'><F label='Nail art / design description' name='design'><textarea rows={3} {...bind('design')} /></F></div>
            <div className='md:col-span-2'>
              <F label='Upload inspiration photo (optional)' name='file'>
                <input id='file' type='file' accept='image/*' className='field' onChange={(e) => set('file', e.target.files?.[0])} />
              </F>
              <p className='mt-1 text-xs text-espresso/60'>Only the file name is sent with this demo form. Connect storage or email to receive photos.</p>
            </div>
            <div className='md:col-span-2'><F label='Additional notes' name='notes'><textarea rows={3} {...bind('notes')} /></F></div>
            <div className='space-y-2 rounded-xl bg-cream p-4 text-sm md:col-span-2'>
              <p><b>Deposit:</b> {b.deposit}</p>
              <p><b>Cancellation:</b> {b.cancellation}</p>
              <label className='mt-2 flex items-start gap-2'>
                <input type='checkbox' checked={!!v.agree} onChange={(e) => set('agree', e.target.checked)} className='mt-1' />
                <span>I acknowledge the booking, deposit and cancellation policies. *</span>
              </label>
              {errors.agree && <p role='alert' className='text-xs text-red-700'>{errors.agree}</p>}
            </div>
            {status === 'error' && <p role='alert' className='text-sm text-red-700 md:col-span-2'>{serverErr}</p>}
            <button type='submit' disabled={status === 'sending'} className='btn btn-primary md:col-span-2 disabled:opacity-60'>{status === 'sending' ? 'Sending…' : 'Submit Booking Request'}</button>
          </form>
        )}
      </div>
    </section>
  );
}
