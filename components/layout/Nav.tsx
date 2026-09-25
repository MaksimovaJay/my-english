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
      <nav className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:bg-white/50 md:p-4 md:backdrop-blur dark:md:bg-black/30">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-gradient text-xl font-extrabold">MJay English</span>
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
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-violet-100/60 dark:hover:bg-violet-500/10',
                active && 'bg-gradient-to-r from-violet-600 to-pink-500 font-semibold text-white shadow-md shadow-pink-500/20 hover:bg-none'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-white/90 px-1 pt-1 backdrop-blur md:hidden dark:bg-black/80">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[11px]', active && 'text-violet-600 dark:text-pink-300')}
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
