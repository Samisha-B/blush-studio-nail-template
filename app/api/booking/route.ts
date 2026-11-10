import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !b.name || !/^\S+@\S+\.\S+$/.test(b.email || '') || !b.service || !b.date || !b.time || !b.agree) {
    return NextResponse.json({ ok: false, error: 'Please complete all required fields.' }, { status: 400 });
  }
  const hook = process.env.BOOKING_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
      if (!r.ok) throw new Error('webhook failed');
    } catch {
      return NextResponse.json({ ok: false, error: 'Could not send your request. Please try again.' }, { status: 502 });
    }
  } else {
    console.log('Booking request (no BOOKING_WEBHOOK_URL set):', b);
  }
  return NextResponse.json({ ok: true });
}
