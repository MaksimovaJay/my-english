export interface CharDiff {
  char: string;
  correct: boolean;
}

export function diffTyped(userInput: string, correct: string): CharDiff[] {
  const typed = userInput.trim().toLowerCase();
  const target = correct.trim().toLowerCase();
  return typed.split('').map((char, i) => ({ char, correct: char === target[i] }));
}
