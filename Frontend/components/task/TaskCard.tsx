"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import toast from "react-hot-toast";

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, targetColumnId: string) => void;
  columns: { id: string; name: string }[];
}

export function TaskCard({ task, onDelete, onMove, columns }: TaskCardProps) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Delete task &ldquo;{task.title}&rdquo;?</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onDelete(task.id);
              toast.success("Task deleted");
            }}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-800 text-sm">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-red-400 hover:text-red-600 text-sm ml-2 flex-shrink-0"
        >
          Delete
        </button>
      </div>

      {/* Move to other columns */}
      <div className="mt-2 flex gap-1 flex-wrap">
        {columns.map(
          (col) =>
            col.id !== task.columnId && (
              <button
                key={col.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(task.id, col.id);
                  toast.success(`Task moved to "${col.name}"`);
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors"
              >
                Move to {col.name}
              </button>
            ),
        )}
      </div>
    </div>
  );
}
