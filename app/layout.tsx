import './globals.css';
import { StoreHydrator } from '@/components/layout/StoreHydrator';

export const metadata = { title: 'MJay English' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
