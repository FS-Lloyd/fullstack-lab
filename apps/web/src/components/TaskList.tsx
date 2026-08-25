import { useEffect, useState } from 'react';
import {
  deleteTask,
  listTasks,
  updateTask,
  type Task,
  type TaskStatus,
} from '../api/tasks';

interface TaskListProps {
  refreshKey: number;
}

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in_progress', 'done'];

interface TaskItemProps {
  task: Task;
  onChanged: (updated: Task) => void;
  onDeleted: (id: number) => void;
}

function TaskItem({ task, onChanged, onDeleted }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(status: TaskStatus) {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateTask(task.id, { status });
      onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateTask(task.id, {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
      });
      onChanged(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDueDate(task.dueDate ?? '');
    setError(null);
    setEditing(false);
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteTask(task.id);
      onDeleted(task.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li className="task-item">
        <div className="field">
          <label htmlFor={`title-${task.id}`}>Title</label>
          <input
            id={`title-${task.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={2}
          />
        </div>
        <div className="field">
          <label htmlFor={`description-${task.id}`}>Description</label>
          <textarea
            id={`description-${task.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`dueDate-${task.id}`}>Due date</label>
          <input
            id={`dueDate-${task.id}`}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="task-item-actions">
          <button type="button" onClick={handleSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={handleCancel} disabled={busy}>
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="task-item">
      <div className="task-item-header">
        <strong>{task.title}</strong>
        <select
          aria-label={`Status for ${task.title}`}
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          disabled={busy}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      {task.description && <p>{task.description}</p>}
      {task.dueDate && <p className="due-date">Due {task.dueDate}</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="task-item-actions">
        <button type="button" onClick={() => setEditing(true)} disabled={busy}>
          Edit
        </button>
        <button type="button" onClick={handleDelete} disabled={busy}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  );
}

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

  function handleChanged(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDeleted(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

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
        <TaskItem
          key={task.id}
          task={task}
          onChanged={handleChanged}
          onDeleted={handleDeleted}
        />
      ))}
    </ul>
  );
}
