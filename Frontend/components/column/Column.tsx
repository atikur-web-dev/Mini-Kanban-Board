"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column as ColumnType, Task } from "@/types";
import { TaskCard } from "../task/TaskCard";
import toast from "react-hot-toast";

interface ColumnProps {
  column: ColumnType;
  allColumns: { id: string; name: string }[];
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, name: string) => Promise<void>;
  onAddTask: (columnId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateTask: (
    taskId: string,
    title?: string,
    description?: string,
  ) => Promise<Task>;
  onMoveTask: (
    taskId: string,
    targetColumnId: string,
  ) => Promise<void>;
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="4" cy="10" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="16" cy="10" r="1.4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m13.8 3.2 3 3M4.2 15.8l.7-3.1L13.9 3.7a1.7 1.7 0 0 1 2.4 2.4l-8.9 8.9-3.2.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M4.5 6.2h11M8 3.8h4M7 6.2v8.5m6-8.5v8.5M5.8 6.2l.5 10h7.4l.5-10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m4.5 10.2 3.4 3.4 7.6-7.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Column({
  column,
  allColumns,
  onDeleteColumn,
  onUpdateColumn,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onMoveTask,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const taskIds = column.tasks.map((task) => task.id);

  const handleUpdateColumn = async () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      setEditName(column.name);
      setIsEditing(false);
      return;
    }

    if (trimmedName !== column.name) {
      try {
        await onUpdateColumn(column.id, trimmedName);
        toast.success("Column updated successfully");
      } catch {
        toast.error("Failed to update column");
        setEditName(column.name);
      }
    }

    setIsEditing(false);
  };

  const handleDeleteColumn = () => {
    toast(
      (t) => (
        <div className="flex min-w-70 items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-800">Delete column?</p>
            <p className="mt-0.5 text-xs text-slate-500">
              “{column.name}” will be removed.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  await onDeleteColumn(column.id);
                  toast.success("Column deleted");
                } catch {
                  toast.error("Failed to delete column");
                }
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        style: {
          background: "#ffffff",
          border: "1px solid #dbeafe",
          borderRadius: "12px",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
          padding: "12px 14px",
        },
      },
    );
  };

  return (
    <section
      ref={setNodeRef}
      className={`flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
        isOver
          ? "border-blue-400 shadow-lg shadow-blue-100 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="border-b border-slate-100 bg-linear-to-b from-white to-slate-50/70 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500 ring-4 ring-blue-50" />

            {isEditing ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleUpdateColumn}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleUpdateColumn();
                    }

                    if (e.key === "Escape") {
                      setEditName(column.name);
                      setIsEditing(false);
                    }
                  }}
                  className="min-w-0 w-full rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 outline-none ring-2 ring-transparent transition focus:border-blue-400 focus:ring-blue-100"
                  autoFocus
                />

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void handleUpdateColumn()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
                  title="Save column name"
                  aria-label="Save column name"
                >
                  <CheckIcon />
                </button>
              </div>
            ) : (
              <>
                <h3
                  className="min-w-0 cursor-pointer truncate text-sm font-semibold text-slate-800 transition hover:text-blue-600"
                  onDoubleClick={() => setIsEditing(true)}
                  title={column.name}
                >
                  {column.name}
                </h3>

                <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                  {column.tasks.length}
                </span>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="group relative shrink-0">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                title="Column actions"
                aria-label="Column actions"
              >
                <MoreIcon />
              </button>

              <div className="invisible absolute right-0 top-9 z-20 w-36 translate-y-1 rounded-xl border border-slate-200 bg-white p-1.5 opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <EditIcon />
                  Edit column
                </button>

                <button
                  onClick={handleDeleteColumn}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <TrashIcon />
                  Delete column
                </button>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => onAddTask(column.id)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700"
          >
            <PlusIcon />
            Add task
          </button>
        )}
      </div>

      <div
        className={`min-h-55 flex-1 p-3 transition-colors ${
          isOver ? "bg-blue-50/40" : "bg-slate-50/60"
        }`}
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.length === 0 ? (
            <div
              className={`flex min-h-47.5 flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center transition-colors ${
                isOver
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white/60"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-400">
                <PlusIcon />
              </div>

              <p className="text-sm font-medium text-slate-500">
                No tasks yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add a task to get started
              </p>

              <button
                onClick={() => onAddTask(column.id)}
                className="mt-3 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Create task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={onDeleteTask}
                  onUpdate={onUpdateTask}
                  onMove={onMoveTask}
                  columns={allColumns}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {column.tasks.length === 1
            ? "1 task"
            : `${column.tasks.length} tasks`}
        </p>
      </div>
    </section>
  );
}