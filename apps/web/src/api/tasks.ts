export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "description" | "status" | "dueDate">>;

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "dueDate">
>;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  statusCode: number;
  timestamp: string;
  data: T;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // response had no JSON body
  }
  return res.statusText || `Request failed with status ${res.status}`;
}

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

export async function listTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
  return unwrap<Task[]>(res);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
  return unwrap<Task>(res);
}

export async function updateTask(
  id: number,
  input: UpdateTaskInput,
): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
  return unwrap<Task>(res);
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
}
