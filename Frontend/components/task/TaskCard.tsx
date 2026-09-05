
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
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description || "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Delete task
  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>
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
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
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
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
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

  // Update task
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

  // Cancel edit
  const handleCancelEdit = (
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    setTitle(task.title);
    setDescription(task.description || "");
    setIsEditing(false);
  };

  // Move task
  const handleMove = async (targetColumnId: string) => {
    try {
      await onMove(task.id, targetColumnId);

      const column = columns.find(
        (c) => c.id === targetColumnId,
      );

      toast.success(
        `Task moved to "${column?.name || "new column"}"`,
      );
    } catch {
      toast.error("Failed to move task");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white p-3 rounded border border-gray-200 hover:shadow-md transition-shadow"
    >
      {isEditing ? (
        // Edit Mode
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            {/* Save */}
            <button
              type="button"
              disabled={isSaving}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleUpdate}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            {/* Cancel */}
            <button
              type="button"
              disabled={isSaving}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Normal Mode
        <>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">
                {task.title}
              </p>

              {task.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {new Date(
                  task.createdAt,
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {/* Drag Handle */}
              <button
                type="button"
                {...listeners}
                onPointerDown={(e) => {
                  listeners?.onPointerDown?.(e);
                }}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-grab active:cursor-grabbing"
                title="Drag task"
              >
                ⠿
              </button>

              {/* Edit */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-blue-400 hover:text-blue-600 text-sm"
              >
                Edit
              </button>

              {/* Delete */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Move Buttons */}
          <div className="mt-2 flex gap-1 flex-wrap">
            {columns.map(
              (col) =>
                col.id !== task.columnId && (
                  <button
                    key={col.id}
                    type="button"
                    onPointerDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(col.id);
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors"
                  >
                    Move to {col.name}
                  </button>
                ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
