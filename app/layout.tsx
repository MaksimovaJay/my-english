import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Nunito } from 'next/font/google';
import { StoreHydrator } from '@/components/layout/StoreHydrator';
import { Nav } from '@/components/layout/Nav';
import { SyncBanner } from '@/components/layout/SyncBanner';
import { PlanWatcher } from '@/components/layout/PlanWatcher';

const nunito = Nunito({ subsets: ['latin', 'cyrillic'], display: 'swap' });

export const metadata: Metadata = {
  title: 'MJay English',
  applicationName: 'MJay English',
  icons: {
    icon: [{ url: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  // Opened from the iPhone home screen it runs full-screen like an app (also required for reminders on iOS).
  appleWebApp: { capable: true, title: 'MJay English', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${nunito.className} text-gray-900 dark:text-gray-100`}>
        <StoreHydrator />
        <PlanWatcher />
        <div className="flex min-h-screen flex-col md:flex-row">
          <Nav />
          <main className="flex-1 overflow-x-hidden p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
            <SyncBanner />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
