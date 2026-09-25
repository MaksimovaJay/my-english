'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, RotateCcw, Gamepad2, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/topics', label: 'Темы', icon: BookOpen },
  { href: '/review', label: 'Повторение', icon: RotateCcw },
  { href: '/games', label: 'Игры', icon: Gamepad2 },
  { href: '/homework', label: 'Домашка', icon: ClipboardList },
  { href: '/progress', label: 'Прогресс', icon: BarChart3 },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:p-4">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-lg font-bold">MJay English</span>
          <ThemeToggle />
        </div>
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10',
                active && 'bg-black/10 font-medium dark:bg-white/15'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-white/95 p-1 backdrop-blur md:hidden dark:bg-gray-950/95">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[11px]', active && 'text-blue-600 dark:text-blue-400')}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
