import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExercisesPage from './page';
import { useExercisesStore } from '@/lib/storage/exercisesStore';

describe('ExercisesPage', () => {
  beforeEach(() => {
    useExercisesStore.setState({
      items: [{ id: 'ex1', type: 'fill-blank', instruction: 'Fill the gap.', items: [{ text: 'a ___ b', blanks: [['x']] }] }],
      hydrated: true,
    });
  });

  it('lists each exercise instruction as a link to its attempt page', () => {
    render(<ExercisesPage />);
    const link = screen.getByRole('link', { name: /fill the gap/i });
    expect(link).toHaveAttribute('href', '/exercises/ex1');
  });
});
