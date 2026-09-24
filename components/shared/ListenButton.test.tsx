import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListenButton } from './ListenButton';

describe('ListenButton', () => {
  beforeEach(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    // @ts-expect-error test stub
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({ text, lang: '' }));
  });

  it('speaks the given text on click', () => {
    render(<ListenButton text="mother" />);
    fireEvent.click(screen.getByRole('button', { name: /listen/i }));
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('renders nothing when speech is unsupported', () => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
    const { container } = render(<ListenButton text="mother" />);
    expect(container).toBeEmptyDOMElement();
  });
});
