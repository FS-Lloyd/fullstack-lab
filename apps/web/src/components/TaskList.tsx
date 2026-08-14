import { useEffect, useState } from 'react';
import { listTasks, type Task } from '../api/tasks';

interface TaskListProps {
  refreshKey: number;
}

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export function TaskList({ refreshKey }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listTasks();
        if (cancelled) return;
        setTasks(data);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setStatus('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (status === 'loading') {
    return <p role="status">Loading tasks…</p>;
  }

  if (status === 'error') {
    return (
      <p role="alert" className="error">
        {error}
      </p>
    );
  }

  if (tasks.length === 0) {
    return <p>No tasks yet. Create one above to get started.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-item">
          <div className="task-item-header">
            <strong>{task.title}</strong>
            <span className={`badge badge-${task.status}`}>
              {STATUS_LABELS[task.status]}
            </span>
          </div>
          {task.description && <p>{task.description}</p>}
          {task.dueDate && <p className="due-date">Due {task.dueDate}</p>}
        </li>
      ))}
    </ul>
  );
}
