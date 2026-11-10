import type { Metadata } from 'next';
import { Bodoni_Moda, Jost, Pinyon_Script } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';

const serif = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-serif' });
const script = Pinyon_Script({ subsets: ['latin'], weight: '400', variable: '--font-script' });
const sans = Jost({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: site.seo.title,
  description: site.seo.description,
  metadataBase: new URL(site.seo.url),
  openGraph: { title: site.seo.title, description: site.seo.description, type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${serif.variable} ${script.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
