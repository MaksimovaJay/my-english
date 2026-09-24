import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from './Nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Nav', () => {
  it('renders a link for every top-level section with correct href', () => {
    render(<Nav />);

    const links = [
      { href: '/', label: 'Home' },
      { href: '/vocabulary', label: 'Vocabulary' },
      { href: '/phrases', label: 'Phrases' },
      { href: '/grammar', label: 'Grammar' },
      { href: '/exercises', label: 'Exercises' },
      { href: '/homework', label: 'Homework' },
      { href: '/review', label: 'Review' },
      { href: '/progress', label: 'Progress' },
      { href: '/add', label: 'Add New' },
    ];

    links.forEach(({ href, label }) => {
      const renderedLinks = screen.getAllByRole('link', { name: label });
      expect(renderedLinks.length).toBeGreaterThanOrEqual(1);
      renderedLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', href);
      });
    });
  });
});
