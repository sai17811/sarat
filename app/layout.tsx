import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Inter_Tight, JetBrains_Mono, Noto_Serif_Telugu } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';

// Self-hosted at build time by next/font: no layout shift, no third-party request.
const serif = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--f-serif', display: 'swap' });
const sans = Inter_Tight({ subsets: ['latin'], variable: '--f-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--f-mono', display: 'swap' });
const te = Noto_Serif_Telugu({ subsets: ['telugu'], weight: ['500', '800'], variable: '--f-te', display: 'swap' });

export const metadata: Metadata = {
  title: 'Sarathi Cinemas · Prasaditya Mall, Rajahmundry',
  description: 'Six laser screens with Dolby Atmos and recliners at Prasaditya Mall, Rajahmundry. Book direct with no booking fee.',
};

export const viewport: Viewport = { themeColor: '#0B0908', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} ${te.variable}`}>
      <body>{children}</body>
    </html>
  );
}
