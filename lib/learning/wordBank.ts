import { FillBlankItem, VocabItem } from '@/types/models';
import { shuffled } from './games';
import { seededRandom } from './sentenceOrder';
import { pickWeighted } from './weighting';

/** Teacher input: one sentence per line, answers in square brackets, alternatives with «/»: «This car [is/was] red.» */
export function parseBankSentences(text: string): FillBlankItem[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /\[[^\]]+\]/.test(line))
    .map((line) => {
      const blanks: string[][] = [];
      const withBlanks = line.replace(/\[([^\]]+)\]/g, (_, answer: string) => {
        blanks.push(answer.split('/').map((a) => a.trim()).filter(Boolean));
        return '___';
      });
      return { text: withBlanks, blanks };
    });
}

/** The word list: each answer once (its first form) plus extra words, in an order that is the same on every device. */
export function buildBank(items: FillBlankItem[], extra = ''): string[] {
  const words = [...items.flatMap((i) => i.blanks.map((b) => b[0])), ...extra.split(',').map((w) => w.trim())].filter(Boolean);
  const unique = words.filter((w, i) => words.findIndex((o) => o.toLowerCase() === w.toLowerCase()) === i);
  return shuffled(unique, seededRandom(unique.join('|')));
}

const BANK_SIZE = 5;

/** Game round: a word's example with the word blanked out, and a list of 5 words to choose from. */
export function wordBankRound(items: VocabItem[], random: () => number = Math.random, weight?: (item: VocabItem) => number): { text: string; answer: string; bank: string[] } | null {
  const candidates = items.filter((i) => {
    if (!i.example) return false;
    return new RegExp(`\\b${escape(i.english)}\\b`, 'i').test(i.example);
  });
  if (candidates.length === 0) return null;
  const target = weight ? pickWeighted(candidates, weight, random)! : candidates[Math.floor(random() * candidates.length)];
  const text = target.example!.replace(new RegExp(`\\b${escape(target.english)}\\b`, 'i'), '___');
  const others = shuffled(
    items.map((i) => i.english).filter((e, idx, all) => e.toLowerCase() !== target.english.toLowerCase() && all.indexOf(e) === idx),
    random
  ).slice(0, BANK_SIZE - 1);
  return { text, answer: target.english, bank: shuffled([target.english, ...others], random) };
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
