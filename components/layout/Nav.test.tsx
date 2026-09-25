import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from './Nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/topics/home',
}));

const LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/topics', label: 'Темы' },
  { href: '/review', label: 'Повторение' },
  { href: '/homework', label: 'Домашка' },
  { href: '/progress', label: 'Прогресс' },
];

describe('Nav', () => {
  it('renders the five sections in desktop and mobile bars', () => {
    render(<Nav />);
    expect(screen.getAllByRole('link')).toHaveLength(LINKS.length * 2);
    LINKS.forEach(({ href, label }) => {
      screen.getAllByRole('link', { name: label }).forEach((link) => expect(link).toHaveAttribute('href', href));
    });
  });

  it('highlights Темы on a topic page', () => {
    render(<Nav />);
    screen.getAllByRole('link', { name: 'Темы' }).forEach((link) => expect(link).toHaveAttribute('aria-current', 'page'));
    screen.getAllByRole('link', { name: 'Главная' }).forEach((link) => expect(link).not.toHaveAttribute('aria-current'));
  });
});
