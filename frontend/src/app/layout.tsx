import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Geist } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ops Dashboard',
  description: 'Mini Operational Dashboard untuk monitoring aset dan stok gudang',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
