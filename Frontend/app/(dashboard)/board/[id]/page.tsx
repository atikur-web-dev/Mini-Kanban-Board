"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/context/BoardContext";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Column as ColumnComponent } from "@/components/column/Column";

import { Column } from "@/types";
import { BoardMember } from "@/lib/api/board";

import toast from "react-hot-toast";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Something went wrong";
};

function ArrowLeftIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18" />
      <path d="M9 9v12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const { isAuthenticated } = useAuth();

  const {
    currentBoard,
    loading,
    fetchBoard,
    createColumn,
    deleteColumn,
    updateColumn,
    createTask,
    deleteTask,
    moveTask,
    shareBoard,
    removeMember,
    getBoardMembers,
    updateTask,
  } = useBoard();

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (boardId) {
      fetchBoard(boardId);
    }
  }, [isAuthenticated, router, boardId, fetchBoard]);

  const fetchMembers = async () => {
    try {
      const members = await getBoardMembers(boardId);
      setBoardMembers(members);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  const handleShareBoard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shareEmail.trim()) {
      setShareError("Email is required");
      return;
    }

    try {
      await shareBoard(boardId, shareEmail.trim());

      setShareEmail("");
      setShareError("");

      await fetchMembers();

      toast.success("Board shared successfully");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      if (errorMsg.includes("User not found")) {
        setShareError("User not found. Please ask them to register first.");
      } else {
        setShareError(errorMsg);
      }

      toast.error(errorMsg);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">
            Remove &ldquo;{name}&rdquo; from board?
          </span>

          <button
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                await removeMember(boardId, userId);
                await fetchMembers();
                toast.success("Member removed");
              } catch (err: unknown) {
                toast.error(getErrorMessage(err));
              }
            }}
            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Remove
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      ),
      {
        duration: 5000,
      },
    );
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newColumnName.trim()) {
      setError("Column name is required");
      return;
    }

    try {
      await createColumn(boardId, newColumnName.trim());

      setShowColumnModal(false);
      setNewColumnName("");
      setError("");

      toast.success("Column created successfully");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim() || !selectedColumnId) {
      setError("Task title is required");
      return;
    }

    try {
      await createTask(
        selectedColumnId,
        newTaskTitle.trim(),
        newTaskDescription.trim() || undefined,
      );

      setShowTaskModal(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setSelectedColumnId(null);
      setError("");

      toast.success("Task created successfully");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
      toast.success("Column deleted successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleUpdateColumn = async (columnId: string, name: string) => {
    try {
      await updateColumn(columnId, name);
      toast.success("Column updated successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    title?: string,
    description?: string,
  ) => {
    try {
      const updatedTask = await updateTask(taskId, title, description);

      return updatedTask;
    } catch (err: unknown) {
      console.error("UPDATE TASK ERROR:", err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    const task = currentBoard?.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);

    if (!task) return;

    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleMoveTask = async (
    taskId: string,
    targetColumnId: string,
  ): Promise<void> => {
    try {
      await moveTask(taskId, targetColumnId, 0);
      toast.success("Task moved successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTask = currentBoard?.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === activeTaskId);

    if (!activeTask) return;

    let targetColumnId: string | null = null;
    let targetPosition = 0;

    const targetColumn = currentBoard?.columns.find((col) => col.id === overId);

    if (targetColumn) {
      targetColumnId = targetColumn.id;
      targetPosition = targetColumn.tasks.length;
    } else {
      const targetTask = currentBoard?.columns
        .flatMap((col) => col.tasks)
        .find((t) => t.id === overId);

      if (targetTask) {
        targetColumnId = targetTask.columnId;

        const column = currentBoard?.columns.find(
          (col) => col.id === targetColumnId,
        );

        const taskIndex = column?.tasks.findIndex((t) => t.id === overId) ?? 0;

        targetPosition = taskIndex + 1;
      }
    }

    if (!targetColumnId) return;

    if (activeTask.columnId === targetColumnId) {
      const column = currentBoard?.columns.find(
        (col) => col.id === targetColumnId,
      );

      const currentIndex = column?.tasks.findIndex(
        (t) => t.id === activeTaskId,
      );

      if (currentIndex === targetPosition - 1) return;
    }

    try {
      await moveTask(activeTaskId, targetColumnId, targetPosition);

      toast.success("Task moved successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (!loading && !currentBoard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">
            Board not found
          </p>

          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeftIcon />
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allColumns = currentBoard!.columns.map((col) => ({
    id: col.id,
    name: col.name,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="h-7 w-px bg-slate-200" />

            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <LayoutIcon />
              </div>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600 sm:block">
                  Board
                </p>

                <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  {currentBoard!.name}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowMembersModal(true);
                fetchMembers();
              }}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <UsersIcon />
              <span className="hidden sm:inline">Members</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowColumnModal(true);
              }}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Add Column</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-5">
            {currentBoard!.columns?.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LayoutIcon />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  No columns yet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Add your first column to start organizing tasks.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setShowColumnModal(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <PlusIcon />
                  Add Column
                </button>
              </div>
            ) : (
              currentBoard!.columns?.map((column: Column) => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  allColumns={allColumns}
                  onDeleteColumn={handleDeleteColumn}
                  onUpdateColumn={handleUpdateColumn}
                  onAddTask={(colId) => {
                    setSelectedColumnId(colId);
                    setError("");
                    setShowTaskModal(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  onMoveTask={handleMoveTask}
                />
              ))
            )}
          </div>
        </DndContext>

        {showColumnModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowColumnModal(false);
                setNewColumnName("");
                setError("");
              }
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <LayoutIcon />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Create new column
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Add a new stage to your workflow.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowColumnModal(false);
                    setNewColumnName("");
                    setError("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleCreateColumn}>
                <div className="px-6 py-5">
                  {error && (
                    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
                      <p className="text-sm font-medium text-red-700">
                        {error}
                      </p>
                    </div>
                  )}

                  <label
                    htmlFor="column-name"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Column name
                  </label>

                  <input
                    id="column-name"
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="e.g. In Progress"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowColumnModal(false);
                      setNewColumnName("");
                      setError("");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    Create column
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTaskModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowTaskModal(false);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setSelectedColumnId(null);
                setError("");
              }
            }}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <PlusIcon />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Create new task
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Add a task to your board.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setNewTaskTitle("");
                    setNewTaskDescription("");
                    setSelectedColumnId(null);
                    setError("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="space-y-5 px-6 py-5">
                  {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
                      <p className="text-sm font-medium text-red-700">
                        {error}
                      </p>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="task-title"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Task title
                    </label>

                    <input
                      id="task-title"
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task-description"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Description
                      <span className="ml-1 font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      id="task-description"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Add some context about this task..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      setNewTaskTitle("");
                      setNewTaskDescription("");
                      setSelectedColumnId(null);
                      setError("");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <PlusIcon />
                    Create task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMembersModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowMembersModal(false);
              }
            }}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UsersIcon />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Board members
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage who can access this board.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMembersModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="px-6 py-5">
                <form onSubmit={handleShareBoard} className="mb-5">
                  <label
                    htmlFor="share-email"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Invite member
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MailIcon />

                      <input
                        id="share-email"
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter member email"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />

                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <MailIcon />
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Share
                    </button>
                  </div>

                  {shareError && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {shareError}
                    </p>
                  )}
                </form>

                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    People with access
                  </p>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    {boardMembers.length + 1}
                  </span>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                        <UserIcon />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {currentBoard!.owner.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {currentBoard!.owner.email}
                        </p>
                      </div>
                    </div>

                    <span className="ml-3 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                      Owner
                    </span>
                  </div>

                  {boardMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <UserIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {member.user.name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      {member.user.id !== currentBoard!.ownerId && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(member.user.id, member.user.name)
                          }
                          className="ml-3 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}

                  {boardMembers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-7 text-center">
                      <p className="text-sm font-medium text-slate-500">
                        No additional members yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Invite someone using their email address.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
