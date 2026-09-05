// No import needed - task is independent
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  columnId: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assigneeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string | null;
}

export interface MoveTaskInput {
  targetColumnId: string;
  targetPosition: number;
}