import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Costa-Burger',
  description: 'Monte seu hambúrguer em camadas – Costa-Burger App',
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
