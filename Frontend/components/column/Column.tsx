"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column as ColumnType } from "@/types";
import { TaskCard } from "../task/TaskCard";
import toast from "react-hot-toast";

interface ColumnProps {
  column: ColumnType;
  allColumns: { id: string; name: string }[];
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, name: string) => Promise<void>;
  onAddTask: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
}

export function Column({
  column,
  allColumns,
  onDeleteColumn,
  onUpdateColumn,
  onAddTask,
  onDeleteTask,
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
    if (editName.trim() && editName !== column.name) {
      try {
        await onUpdateColumn(column.id, editName.trim());
        toast.success("Column updated successfully");
      } catch {
        toast.error("Failed to update column");
      }
    }
    setIsEditing(false);
  };

const handleDeleteColumn = () => {
  toast((t) => (
    <div className="flex items-center gap-3">
      <span>Delete column &ldquo;{column.name}&rdquo;?</span>
      <button
        onClick={() => {
          toast.dismiss(t.id);
          onDeleteColumn(column.id);
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
  ), {
    duration: 5000,
  });
};

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg shadow flex-shrink-0 w-80 transition-colors ${
        isOver ? "bg-indigo-50 ring-2 ring-indigo-300" : ""
      }`}
    >
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleUpdateColumn}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateColumn()}
              className="font-semibold text-gray-900 bg-white border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                onDoubleClick={() => setIsEditing(true)}
              >
                {column.name}
              </h3>
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              title="Edit column name"
            >
              Edit
            </button>
            <button
              onClick={() => onAddTask(column.id)}
              className="text-sm text-indigo-600 hover:text-indigo-800 px-2 py-1"
            >
              Add Task
            </button>
            <button
              onClick={handleDeleteColumn}
              className="text-sm text-red-500 hover:text-red-700 px-2 py-1"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 min-h-[200px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No tasks</p>
              <button
                onClick={() => onAddTask(column.id)}
                className="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
              >
                Add a task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={onDeleteTask}
                  onMove={onMoveTask}
                  columns={allColumns}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}