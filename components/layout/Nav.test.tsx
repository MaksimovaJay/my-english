import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from './Nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Nav', () => {
  it('renders a link for every top-level section', () => {
    render(<Nav />);
    ['Home', 'Vocabulary', 'Phrases', 'Grammar', 'Exercises', 'Homework', 'Review', 'Progress', 'Add New'].forEach((label) => {
      const links = screen.getAllByRole('link', { name: new RegExp(label, 'i') });
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links[0]).toBeInTheDocument();
    });
  });
});
