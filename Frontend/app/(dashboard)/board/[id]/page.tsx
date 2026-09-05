"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter }from "next/navigation";
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
    updateColumn,
    createTask,
    deleteTask,
    moveTask,
    shareBoard,
    removeMember,
    getBoardMembers,
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
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Remove &ldquo;{name}&rdquo; from board?</span>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            removeMember(boardId, userId);
            fetchMembers();
            toast.success("Member removed");
          }}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Remove
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
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
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
      toast.success("Task created successfully");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
      toast.success("Column deleted successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
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

  const handleMoveTask = async (taskId: string, targetColumnId: string): Promise<void> => {
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
      toast.success("Task moved successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  // ✅ KEY FIX: Always show loader until data is ready
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // ✅ KEY FIX: Only show "Board not found" when loading is complete AND no board
  if (!loading && !currentBoard) {
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

  // ✅ currentBoard is guaranteed to exist here
  const allColumns = currentBoard!.columns.map((col) => ({
    id: col.id,
    name: col.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentBoard!.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowMembersModal(true);
                fetchMembers();
              }}
              size="sm"
              variant="outline"
            >
              Members
            </Button>
            <Button onClick={() => setShowColumnModal(true)} size="sm">
              Add Column
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {currentBoard!.columns?.length === 0 ? (
              <div className="w-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No columns yet. Add your first column!</p>
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
                    setShowTaskModal(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onMoveTask={handleMoveTask}
                />
              ))
            )}
          </div>
        </DndContext>

        {/* Modals remain the same */}
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

        {showMembersModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Board Members</h3>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleShareBoard} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email to share"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Share
                  </button>
                </div>
                {shareError && (
                  <p className="text-sm text-red-600 mt-1">{shareError}</p>
                )}
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{currentBoard!.owner.name}</p>
                    <p className="text-sm text-gray-500">{currentBoard!.owner.email}</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Owner</span>
                </div>

                {boardMembers.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{member.user.name}</p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                    {member.user.id !== currentBoard!.ownerId && (
                      <button
                        onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {boardMembers.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No members yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}