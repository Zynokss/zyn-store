import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { CartProvider } from '@/lib/CartContext';
import { BFCacheFix } from '@/components/providers/BFCacheFix';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZYN.STORE | Premium Apparel',
  description: 'Engineered garments & heavyweight essentials — small-batch independent streetwear studio.',
  keywords: ['streetwear', 'apparel', 'fashion', 'essentials', 'made in Morocco'],
  openGraph: {
    title: 'ZYN.STORE | Premium Apparel',
    description: 'Considered clothing for everyday — engineered garments & heavyweight essentials.',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.className} bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white antialiased transition-colors duration-200`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <IntlProvider>
              <CartProvider>
                <BFCacheFix />
                {children}
                <Analytics />
              </CartProvider>
            </IntlProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}