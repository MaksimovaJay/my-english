import './globals.css';
import { StoreHydrator } from '@/components/layout/StoreHydrator';
import { Nav } from '@/components/layout/Nav';

export const metadata = { title: 'MJay English' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <StoreHydrator />
        <div className="flex min-h-screen flex-col md:flex-row">
          <Nav />
          <main className="flex-1 overflow-x-hidden p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
