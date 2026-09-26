import { VocabItem } from '@/types/models';

export function shuffled<T>(arr: T[], random: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Собери предложение ───────────────────────────────────────────

export interface SentenceTask {
  id: string;
  english: string;
  translation: string;
  tokens: string[];
  ending: string;
}

export function splitSentence(sentence: string): { tokens: string[]; ending: string } {
  const trimmed = sentence.trim();
  const ending = trimmed.match(/[.?!]+$/)?.[0] ?? '';
  const body = ending ? trimmed.slice(0, -ending.length) : trimmed;
  return { tokens: body.split(/\s+/).filter(Boolean), ending };
}

/** Phrases, plus word examples that have a translation; 3–9 words so the puzzle is neither trivial nor tiring. */
export function sentencePool(items: VocabItem[]): SentenceTask[] {
  const candidates = items.flatMap((i) => {
    const out: { id: string; english: string; translation: string }[] = [];
    if (/\s/.test(i.english.trim())) out.push({ id: i.id, english: i.english, translation: i.translation });
    if (i.example && i.exampleTranslation) out.push({ id: `${i.id}-example`, english: i.example, translation: i.exampleTranslation });
    return out;
  });
  const seen = new Set<string>();
  return candidates
    .map((c) => ({ ...c, ...splitSentence(c.english) }))
    .filter((c) => c.tokens.length >= 3 && c.tokens.length <= 9)
    .filter((c) => (seen.has(c.english) ? false : (seen.add(c.english), true)));
}

export function isSentenceCorrect(answer: string[], tokens: string[]): boolean {
  return answer.length === tokens.length && answer.every((t, i) => t.toLowerCase() === tokens[i].toLowerCase());
}

/** Shuffled chips that are never already in the correct order. */
export function shuffleTokens(tokens: string[], random: () => number = Math.random): string[] {
  if (tokens.length < 2) return [...tokens];
  let result = shuffled(tokens, random);
  if (isSentenceCorrect(result, tokens)) result = [...tokens.slice(1), tokens[0]];
  return result;
}

// ── Буквы ────────────────────────────────────────────────────────

export const LETTER_LIVES = 6;

export function letterWords(items: VocabItem[]): VocabItem[] {
  return items.filter((i) => {
    const letters = i.english.replace(/[^a-z]/gi, '');
    return /^[a-z' -]+$/i.test(i.english) && letters.length >= 3 && letters.length <= 14 && i.english !== i.english.toUpperCase();
  });
}

/** 'living room', {i,o} → '_ i _ i _ _   _ o o _' (letters spaced out; a word gap is three spaces). */
export function maskWord(word: string, guessed: Set<string>): string {
  return [...word].map((ch) => (/[a-z]/i.test(ch) ? (guessed.has(ch.toLowerCase()) ? ch : '_') : ch)).join(' ');
}

export function isWordSolved(word: string, guessed: Set<string>): boolean {
  return [...word.toLowerCase()].every((ch) => !/[a-z]/.test(ch) || guessed.has(ch));
}

// ── На время ─────────────────────────────────────────────────────

export function timedQuestion(items: VocabItem[], random: () => number = Math.random): { target: VocabItem; options: string[] } | null {
  const distinct = items.filter((item, i) => items.findIndex((o) => o.translation === item.translation) === i);
  if (distinct.length < 2) return null;
  const [target, ...rest] = shuffled(distinct, random);
  const options = shuffled([target.translation, ...rest.slice(0, 3).map((r) => r.translation)], random);
  return { target, options };
}
