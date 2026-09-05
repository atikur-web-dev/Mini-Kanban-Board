"use client";

import { useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Task } from "@/types";

import toast from "react-hot-toast";

interface TaskCardProps {
  task: Task;

  onDelete: (taskId: string) => Promise<void>;

  onUpdate: (
    taskId: string,
    title?: string,
    description?: string,
  ) => Promise<Task>;

  onMove: (
    taskId: string,
    targetColumnId: string,
  ) => Promise<void>;

  columns: { id: string; name: string }[];
}

function ViewIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
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

function ArrowDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function TaskCard({
  task,
  onDelete,
  onUpdate,
  onMove,
  columns,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description || "",
  );

  const [isSaving, setIsSaving] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">
            Delete task &ldquo;{task.title}&rdquo;?
          </span>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={async (e) => {
              e.stopPropagation();
              toast.dismiss(t.id);

              try {
                await onDelete(task.id);
                toast.success("Task deleted successfully");
              } catch {
                toast.error("Failed to delete task");
              }
            }}
            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Delete
          </button>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
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

  const handleUpdate = async (
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!title.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      await onUpdate(
        task.id,
        title.trim(),
        description.trim() || undefined,
      );

      toast.success("Task updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("UPDATE TASK ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update task",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    setTitle(task.title);
    setDescription(task.description || "");
    setIsEditing(false);
  };

  const handleMove = async (targetColumnId: string) => {
    setIsMoveOpen(false);

    try {
      await onMove(task.id, targetColumnId);

      const column = columns.find(
        (item) => item.id === targetColumnId,
      );

      toast.success(
        `Task moved to "${column?.name || "new column"}"`,
      );
    } catch {
      toast.error("Failed to move task");
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group relative overflow-visible rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
          isDragging
            ? "z-50 cursor-grabbing shadow-xl ring-2 ring-blue-200"
            : "cursor-grab"
        }`}
      >
        {isEditing ? (
          <div
            className="space-y-3 cursor-default"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Task title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a short description"
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isSaving}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleCancelEdit}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="wrap-break-words text-sm font-semibold leading-5 text-slate-900">
                  {task.title}
                </h3>

                {task.description ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                    {task.description}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs italic text-slate-400">
                    No description added
                  </p>
                )}

                <p className="mt-3 text-[11px] font-medium text-slate-400">
                  Created{" "}
                  {new Date(
                    task.createdAt,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div
              className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMoveOpen((value) => !value);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  Move
                  <ArrowDownIcon />
                </button>

                {isMoveOpen && (
                  <div className="absolute bottom-full left-0 z-30 mb-2 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
                    <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Move to
                    </p>

                    {columns
                      .filter(
                        (column) =>
                          column.id !== task.columnId,
                      )
                      .map((column) => (
                        <button
                          key={column.id}
                          type="button"
                          onPointerDown={(e) =>
                            e.stopPropagation()
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleMove(column.id);
                          }}
                          className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          {column.name}
                        </button>
                      ))}

                    {columns.filter(
                      (column) =>
                        column.id !== task.columnId,
                    ).length === 0 && (
                      <p className="px-2.5 py-2 text-xs text-slate-400">
                        No other columns
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewing(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  title="View task"
                  aria-label="View task"
                >
                  <ViewIcon />
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <EditIcon />
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isViewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsViewing(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div className="min-w-0 pr-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  Task details
                </p>

                <h2 className="wrap-break-words text-lg font-semibold leading-6 text-slate-900">
                  {task.title}
                </h2>
              </div>

              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsViewing(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </p>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                  {task.description ||
                    "No description added for this task."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">
                  Created
                </span>

                <span className="font-medium text-slate-600">
                  {new Date(
                    task.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsViewing(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}