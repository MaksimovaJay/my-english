'use client';

import { Volume2 } from 'lucide-react';
import { isSpeechSupported, speak } from '@/lib/pronunciation/speak';
import { cn } from '@/lib/utils';

interface ListenButtonProps {
  text: string;
  lang?: string;
  className?: string;
}

export function ListenButton({ text, lang = 'en-US', className }: ListenButtonProps) {
  if (!isSpeechSupported()) return null;

  return (
    <button
      type="button"
      aria-label="Послушать"
      className={cn('inline-flex items-center gap-1 rounded-full p-1.5 text-violet-600 hover:bg-violet-50 dark:text-pink-300 dark:hover:bg-violet-500/15', className)}
      onClick={() => speak(text, lang)}
    >
      <Volume2 size={16} />
    </button>
  );
}
