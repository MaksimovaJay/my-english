'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageSquare, GraduationCap, PenLine, ClipboardList, RotateCcw, BarChart3, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/vocabulary', label: 'Vocabulary', icon: BookOpen },
  { href: '/phrases', label: 'Phrases', icon: MessageSquare },
  { href: '/grammar', label: 'Grammar', icon: GraduationCap },
  { href: '/exercises', label: 'Exercises', icon: PenLine },
  { href: '/homework', label: 'Homework', icon: ClipboardList },
  { href: '/review', label: 'Review', icon: RotateCcw },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/add', label: 'Add New', icon: PlusCircle },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:p-4">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-lg font-bold">MJay English</span>
          <ThemeToggle />
        </div>
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10',
              pathname === href && 'bg-black/10 font-medium dark:bg-white/15'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-white/95 p-1 backdrop-blur md:hidden dark:bg-gray-950/95">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn('flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px]', pathname === href && 'text-blue-600 dark:text-blue-400')}
          >
            <Icon size={18} />
          </Link>
        ))}
      </nav>
    </>
  );
}
