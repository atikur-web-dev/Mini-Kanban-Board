"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/context/BoardContext";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Column as ColumnComponent } from "@/components/column/Column";
import { Column } from "@/types";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong";
};

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const { isAuthenticated } = useAuth();
  const {
    currentBoard,
    loading,
    fetchBoard,
    createColumn,
    deleteColumn,
    createTask,
    deleteTask,
    moveTask,
  } = useBoard();

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // ✅ Use typeof window check directly - no state needed
  const isClient = typeof window !== "undefined";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [isAuthenticated, router, boardId, fetchBoard]);

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
    } catch (err: unknown) {
      setError(getErrorMessage(err));
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
        newTaskDescription.trim() || undefined
      );
      setShowTaskModal(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setSelectedColumnId(null);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteColumn = async (columnId: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete column "${name}"? All tasks will be deleted.`
      )
    )
      return;
    try {
      await deleteColumn(columnId);
    } catch (err: unknown) {
      alert("Failed to delete column: " + getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = currentBoard?.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);
    
    if (!task) return;
    
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    try {
      await deleteTask(taskId);
    } catch (err: unknown) {
      alert("Failed to delete task: " + getErrorMessage(err));
    }
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string) => {
    try {
      await moveTask(taskId, targetColumnId, 0);
    } catch (err: unknown) {
      alert("Failed to move task: " + getErrorMessage(err));
    }
  };

  // Drag & Drop Handlers
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
          (col) => col.id === targetColumnId
        );
        const taskIndex = column?.tasks.findIndex((t) => t.id === overId) ?? 0;
        targetPosition = taskIndex + 1;
      }
    }

    if (!targetColumnId) return;

    if (activeTask.columnId === targetColumnId) {
      const column = currentBoard?.columns.find(
        (col) => col.id === targetColumnId
      );
      const currentIndex = column?.tasks.findIndex(
        (t) => t.id === activeTaskId
      );
      if (currentIndex === targetPosition - 1) return;
    }

    try {
      await moveTask(activeTaskId, targetColumnId, targetPosition);
    } catch (err: unknown) {
      alert("Failed to move task: " + getErrorMessage(err));
    }
  };

  // ✅ Show loader on server-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (loading && !currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Board not found</p>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:underline mt-4 inline-block"
          >
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allColumns = currentBoard.columns.map((col) => ({
    id: col.id,
    name: col.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentBoard.name}
            </h1>
          </div>
          <Button onClick={() => setShowColumnModal(true)} size="sm">
            + Add Column
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Columns with Drag & Drop */}
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {currentBoard.columns?.length === 0 ? (
              <div className="w-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No columns yet. Add your first column!</p>
              </div>
            ) : (
              currentBoard.columns?.map((column: Column) => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  allColumns={allColumns}
                  onDeleteColumn={handleDeleteColumn}
                  onAddTask={(colId) => {
                    setSelectedColumnId(colId);
                    setShowTaskModal(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onMoveTask={handleMoveTask}
                />
              ))
            )}
          </div>
        </DndContext>

        {/* Create Column Modal */}
        {showColumnModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Column
              </h3>
              <form onSubmit={handleCreateColumn}>
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowColumnModal(false);
                      setNewColumnName("");
                      setError("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Task
              </h3>
              <form onSubmit={handleCreateTask}>
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                  autoFocus
                />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      setNewTaskTitle("");
                      setNewTaskDescription("");
                      setSelectedColumnId(null);
                      setError("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}