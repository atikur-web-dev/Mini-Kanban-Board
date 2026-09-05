"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column as ColumnType } from "@/types";
import { TaskCard } from "../task/TaskCard";

interface ColumnProps {
  column: ColumnType;
  allColumns: { id: string; name: string }[];
  onDeleteColumn: (columnId: string, name: string) => void;
  onAddTask: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;  // ✅ Only taskId
  onMoveTask: (taskId: string, targetColumnId: string) => void;
}

export function Column({
  column,
  allColumns,
  onDeleteColumn,
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

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg shadow flex-shrink-0 w-80 transition-colors ${
        isOver ? "bg-indigo-50 ring-2 ring-indigo-300" : ""
      }`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{column.name}</h3>
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddTask(column.id)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add Task
          </button>
          <button
            onClick={() => onDeleteColumn(column.id, column.name)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            ×
          </button>
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
                + Add a task
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