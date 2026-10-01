import { SentenceOrderItem } from '@/types/models';
import { shuffleTokens, splitSentence } from './games';

/** Teacher input: one sentence per line, optional translation after «=». Lines with fewer than 2 words are skipped. */
export function parseSentenceLines(text: string): SentenceOrderItem[] {
  return text
    .split('\n')
    .map((line) => {
      const [sentence, ...rest] = line.split('=');
      const translation = rest.join('=').trim();
      return translation ? { sentence: sentence.trim(), translation } : { sentence: sentence.trim() };
    })
    .filter((item) => item.sentence.split(/\s+/).filter(Boolean).length >= 2);
}

/** Deterministic pseudo-random numbers from a string (mulberry32 over an FNV hash). */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The words of a homework sentence, shuffled the same way every time it is shown (on every device),
 * so the saved answer — indices into `chips` — stays valid.
 */
export function sentenceChips(item: SentenceOrderItem): { tokens: string[]; ending: string; chips: string[] } {
  const { tokens, ending } = splitSentence(item.sentence);
  return { tokens, ending, chips: shuffleTokens(tokens, seededRandom(item.sentence)) };
}
