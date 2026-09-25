import './globals.css';
import { Nunito } from 'next/font/google';
import { StoreHydrator } from '@/components/layout/StoreHydrator';
import { Nav } from '@/components/layout/Nav';
import { SyncBanner } from '@/components/layout/SyncBanner';

const nunito = Nunito({ subsets: ['latin', 'cyrillic'], display: 'swap' });

export const metadata = { title: 'MJay English' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${nunito.className} text-gray-900 dark:text-gray-100`}>
        <StoreHydrator />
        <div className="flex min-h-screen flex-col md:flex-row">
          <Nav />
          <main className="flex-1 overflow-x-hidden p-4 pb-20 md:p-6 md:pb-6">
            <SyncBanner />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
