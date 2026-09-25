'use client';

import { Verdict } from '@/types/models';
import { cn } from '@/lib/utils';

interface ItemReviewProps {
  verdict: Verdict;
  comment: string;
  teacher: boolean;
  onVerdict: (verdict: 'correct' | 'incorrect') => void;
  onComment: (comment: string) => void;
}

/** Under each homework item: the teacher sets ✔/✘ and a comment; the student sees them read-only. */
export function ItemReview({ verdict, comment, teacher, onVerdict, onComment }: ItemReviewProps) {
  if (!teacher) {
    if (!verdict && !comment.trim()) return null;
    return (
      <div className={cn('mt-2 rounded-md px-2 py-1 text-sm', verdict === 'incorrect' ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300' : 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300')}>
        {verdict === 'correct' && <span className="font-medium">✔ Верно</span>}
        {verdict === 'incorrect' && <span className="font-medium">✘ Есть ошибка</span>}
        {comment.trim() && <span>{verdict ? ' — ' : '💬 '}{comment}</span>}
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-amber-50 p-2 dark:bg-amber-950/30">
      <button
        type="button"
        aria-pressed={verdict === 'correct'}
        className={cn('rounded border px-2 py-0.5 text-sm', verdict === 'correct' && 'border-green-600 bg-green-600 text-white')}
        onClick={() => onVerdict('correct')}
      >
        ✔ Верно
      </button>
      <button
        type="button"
        aria-pressed={verdict === 'incorrect'}
        className={cn('rounded border px-2 py-0.5 text-sm', verdict === 'incorrect' && 'border-red-600 bg-red-600 text-white')}
        onClick={() => onVerdict('incorrect')}
      >
        ✘ Ошибка
      </button>
      <input
        aria-label="Комментарий учителя"
        className="min-w-40 flex-1 rounded border bg-white px-2 py-0.5 text-sm dark:bg-gray-900"
        placeholder="комментарий…"
        value={comment}
        onChange={(e) => onComment(e.target.value)}
      />
    </div>
  );
}
