"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/context/BoardContext";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Column } from "@/types";

// Type guard for error
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
  const { currentBoard, loading, fetchBoard, createColumn, deleteColumn, createTask, deleteTask, moveTask } = useBoard();
  
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [isAuthenticated, router, boardId, fetchBoard]);

    // Debug: Log currentBoard changes
  useEffect(() => {
    console.log("Current Board:", currentBoard); 
  }, [currentBoard]);

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
      await createTask(selectedColumnId, newTaskTitle.trim(), newTaskDescription.trim() || undefined);
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
    if (!confirm(`Are you sure you want to delete column "${name}"? All tasks will be deleted.`)) return;
    try {
      await deleteColumn(columnId);
    } catch (err: unknown) {
      alert("Failed to delete column: " + getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete task "${title}"?`)) return;
    try {
      await deleteTask(taskId);
    } catch (err: unknown) {
      alert("Failed to delete task: " + getErrorMessage(err));
    }
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string, targetPosition: number) => {
    try {
      await moveTask(taskId, targetColumnId, targetPosition);
    } catch (err: unknown) {
      alert("Failed to move task: " + getErrorMessage(err));
    }
  };

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
          <Link href="/dashboard" className="text-indigo-600 hover:underline mt-4 inline-block">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{currentBoard.name}</h1>
          </div>
          <Button onClick={() => setShowColumnModal(true)} size="sm">
            + Add Column
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Columns */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {currentBoard.columns?.length === 0 ? (
            <div className="w-full text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No columns yet. Add your first column!</p>
            </div>
          ) : (
            currentBoard.columns?.map((column: Column) => (
              <div
                key={column.id}
                className="bg-white rounded-lg shadow flex-shrink-0 w-80"
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{column.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedColumnId(column.id);
                        setShowTaskModal(true);
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Task
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column.id, column.name)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {column.tasks?.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No tasks</p>
                  ) : (
                    column.tasks?.map((task) => (
                      <div
                        key={task.id}
                        className="bg-gray-50 p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="text-red-400 hover:text-red-600 text-sm"
                          >
                            ×
                          </button>
                        </div>
                        {/* Simple move buttons - for demo */}
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {currentBoard.columns?.map((col) => (
                            col.id !== column.id && (
                              <button
                                key={col.id}
                                onClick={() => handleMoveTask(task.id, col.id, 0)}
                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded"
                              >
                                Move to {col.name}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Column Modal */}
        {showColumnModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Column</h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
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