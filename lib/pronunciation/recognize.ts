/** Listens once and returns what was heard (several alternatives), or throws with a short reason code. */
export type Recognizer = (lang: string) => Promise<string[]>;

interface SpeechRecognitionLike {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
}

function recognitionClass(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isRecognitionSupported(): boolean {
  return recognitionClass() !== null;
}

export const browserRecognizer: Recognizer = (lang) =>
  new Promise((resolve, reject) => {
    const Ctor = recognitionClass();
    if (!Ctor) return reject(new Error('unsupported'));
    const rec = new Ctor();
    rec.lang = lang;
    rec.maxAlternatives = 3;
    rec.interimResults = false;
    let settled = false;
    rec.onresult = (e) => {
      settled = true;
      const first = e.results[0];
      resolve(Array.from({ length: first.length }, (_, i) => first[i].transcript));
    };
    rec.onerror = (e) => {
      settled = true;
      const reason = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'not-allowed' : e.error === 'no-speech' ? 'no-speech' : 'failed';
      reject(new Error(reason));
    };
    rec.onend = () => {
      if (!settled) reject(new Error('no-speech'));
    };
    rec.start();
  });

/** Lower-case letters, digits and spaces only, so punctuation and apostrophes never decide the result. */
export function normalizeSpoken(text: string): string {
  return text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function isSpokenMatch(heard: string[], target: string): boolean {
  const want = normalizeSpoken(target);
  return heard.some((h) => normalizeSpoken(h) === want);
}
