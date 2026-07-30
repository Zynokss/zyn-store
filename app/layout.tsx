import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZYN.STORE | Premium Apparel',
  description: 'Engineered garments & heavyweight essentials',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-zinc-900 antialiased`}>
        <AuthProvider>
          <IntlProvider>
            {children}
          </IntlProvider>
        </AuthProvider>
      </body>
    </html>
  );
}