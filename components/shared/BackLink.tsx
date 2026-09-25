import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ href, label = 'Назад' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="mb-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">
      <ArrowLeft size={16} /> {label}
    </Link>
  );
}
