"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/context/BoardContext";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";

// Type guard for error
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong";
};

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { boards, loading, fetchBoards, createBoard, deleteBoard } = useBoard();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchBoards();
  }, [isAuthenticated, router, fetchBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) {
      setError("Board name is required");
      return;
    }

    try {
      await createBoard(newBoardName.trim());
      setShowCreateModal(false);
      setNewBoardName("");
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteBoard = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteBoard(id);
    } catch (err: unknown) {
      alert("Failed to delete board: " + getErrorMessage(err));
    }
  };

  if (loading && boards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Board Button */}
        <div className="mb-6">
          <Button onClick={() => setShowCreateModal(true)}>
            + New Board
          </Button>
        </div>

        {/* Board Grid */}
        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No boards yet. Create your first board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <Link
                    href={`/board/${board.id}`}
                    className="flex-1 hover:underline"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {board._count?.columns || 0} columns
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Created by {board.owner?.name || "Unknown"}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteBoard(board.id, board.name)}
                    className="text-red-500 hover:text-red-700 text-sm ml-4 flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Board</h3>
              <form onSubmit={handleCreateBoard}>
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewBoardName("");
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