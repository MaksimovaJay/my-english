import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignHomeworkForm } from './AssignHomeworkForm';

describe('AssignHomeworkForm', () => {
  it('adds and removes number rows and saves the filled ones with notes', () => {
    const onSave = vi.fn();
    render(<AssignHomeworkForm onSave={onSave} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '+ ещё номер' }));
    expect(screen.getAllByRole('textbox', { name: /^Номер/ })).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Убрать номер 3' }));
    fireEvent.change(screen.getByLabelText('Номер 1'), { target: { value: '12.1' } });
    fireEvent.change(screen.getByLabelText('Номер 2'), { target: { value: '12.3' } });
    fireEvent.change(screen.getByLabelText('Заметки учителя'), { target: { value: 'письменно' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ bookNumbers: ['12.1', '12.3'], teacherNotes: 'письменно', images: [] }));
  });

  it('does not save without any book number', () => {
    const onSave = vi.fn();
    render(<AssignHomeworkForm onSave={onSave} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Добавьте хотя бы один номер из книги.')).toBeInTheDocument();
  });

  it('attaches a picked screenshot', async () => {
    const compress = vi.fn(async () => 'data:image/jpeg;base64,abc');
    render(<AssignHomeworkForm onSave={vi.fn()} onCancel={vi.fn()} compress={compress} />);
    await userEvent.upload(screen.getByLabelText('Выбрать фото'), new File(['x'], 'page.png', { type: 'image/png' }));
    await waitFor(() => expect(screen.getByAltText('Скриншот 1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Удалить скриншот 1' }));
    expect(screen.queryByAltText('Скриншот 1')).not.toBeInTheDocument();
  });
});
