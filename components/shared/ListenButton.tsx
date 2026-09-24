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
      aria-label="Listen"
      className={cn('inline-flex items-center gap-1 rounded-full p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950', className)}
      onClick={() => speak(text, lang)}
    >
      <Volume2 size={16} />
    </button>
  );
}
