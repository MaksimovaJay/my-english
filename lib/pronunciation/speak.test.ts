import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSpeechSupported, speak } from './speak';

describe('isSpeechSupported', () => {
  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
  });

  it('returns false when speechSynthesis is not available', () => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
    expect(isSpeechSupported()).toBe(false);
  });

  it('returns true when speechSynthesis is available', () => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    expect(isSpeechSupported()).toBe(true);
  });
});

describe('speak', () => {
  beforeEach(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    // @ts-expect-error test stub
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({ text, lang: '' }));
  });

  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
  });

  it('cancels any ongoing speech and speaks the given text with correct arguments', () => {
    speak('mother', 'en-US');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'mother', lang: 'en-US' })
    );
  });

  it('calls cancel before speak', () => {
    speak('mother', 'en-US');
    const cancelCallOrder = window.speechSynthesis.cancel.mock.invocationCallOrder[0];
    const speakCallOrder = window.speechSynthesis.speak.mock.invocationCallOrder[0];
    expect(cancelCallOrder).toBeLessThan(speakCallOrder);
  });

  it('uses default language (en-US) when not specified', () => {
    speak('mother');
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'mother', lang: 'en-US' })
    );
  });

  it('does nothing when speech is unsupported', () => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
    expect(() => speak('mother')).not.toThrow();
  });
});
