import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskList } from './TaskList';
import * as tasksApi from '../api/tasks';
import { ApiError } from '../api/tasks';

vi.mock('../api/tasks', async () => {
  const actual =
    await vi.importActual<typeof import('../api/tasks')>('../api/tasks');
  return { ...actual, listTasks: vi.fn() };
});

const listTasksMock = vi.mocked(tasksApi.listTasks);

describe('TaskList', () => {
  it('renders tasks once loaded', async () => {
    listTasksMock.mockResolvedValue([
      {
        id: 1,
        title: 'Write report',
        status: 'todo',
        createdAt: '',
        updatedAt: '',
      },
    ]);

    render(<TaskList refreshKey={0} />);

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    expect(await screen.findByText('Write report')).toBeInTheDocument();
  });

  it('renders an empty state when there are no tasks', async () => {
    listTasksMock.mockResolvedValue([]);

    render(<TaskList refreshKey={0} />);

    expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders an error state when the request fails', async () => {
    listTasksMock.mockRejectedValue(new ApiError('Network error', 0));

    render(<TaskList refreshKey={0} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Network error',
    );
  });
});
