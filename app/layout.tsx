import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' // iOS safe area support
};

export const metadata: Metadata = {
  title: 'Costa-Burger',
  description: 'Monte seu hambúrguer em camadas – Costa-Burger App',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Costa-Burger'
  },
  formatDetection: {
    telephone: true,
    email: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="page-shell">
            <Header />
            <main id="app">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
