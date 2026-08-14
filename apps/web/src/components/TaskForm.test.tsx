import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TaskForm } from './TaskForm';
import * as tasksApi from '../api/tasks';
import { ApiError } from '../api/tasks';

vi.mock('../api/tasks', async () => {
  const actual =
    await vi.importActual<typeof import('../api/tasks')>('../api/tasks');
  return { ...actual, createTask: vi.fn() };
});

const createTaskMock = vi.mocked(tasksApi.createTask);

describe('TaskForm', () => {
  beforeEach(() => {
    createTaskMock.mockReset();
  });

  it('submits the entered values and notifies the parent on success', async () => {
    const user = userEvent.setup();
    createTaskMock.mockResolvedValue({
      id: 1,
      title: 'Write report',
      status: 'todo',
      createdAt: '',
      updatedAt: '',
    });
    const onCreated = vi.fn();

    render(<TaskForm onCreated={onCreated} />);

    await user.type(screen.getByLabelText('Title'), 'Write report');
    await user.type(screen.getByLabelText('Description'), 'Q3 summary');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(createTaskMock).toHaveBeenCalledWith({
      title: 'Write report',
      description: 'Q3 summary',
      status: 'todo',
      dueDate: undefined,
    });
  });

  it('shows an error message when the API call fails', async () => {
    const user = userEvent.setup();
    createTaskMock.mockRejectedValue(new ApiError('Title is required', 400));
    const onCreated = vi.fn();

    render(<TaskForm onCreated={onCreated} />);

    await user.type(screen.getByLabelText('Title'), 'ab');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title is required',
    );
    expect(onCreated).not.toHaveBeenCalled();
  });
});
