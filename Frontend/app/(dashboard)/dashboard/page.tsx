"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/context/BoardContext";
import { Loader } from "@/components/ui/Loader";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String((error as { message: unknown }).message);
  }

  return "Something went wrong";
};

function LogoIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 8h3v3H8z" />
      <path d="M13 8h3v8h-3z" />
      <path d="M8 13h3v3H8z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M8 4v16" />
      <path d="M8 9h13" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function ArrowRightIcon() {
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
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function TrashIcon() {
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

function LogoutIcon() {
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
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();

  const {
    boards,
    loading,
    fetchBoards,
    createBoard,
    deleteBoard,
  } = useBoard();

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

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewBoardName("");
    setError("");
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBoardName.trim()) {
      setError("Board name is required");
      return;
    }

    try {
      await createBoard(newBoardName.trim());

      closeCreateModal();

      toast.success("Board created successfully");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);

      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteBoard = async (
    id: string,
    name: string,
  ) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-200">
            Delete board &ldquo;{name}&rdquo;?
          </span>

          <button
            type="button"
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                await deleteBoard(id);
                toast.success("Board deleted successfully");
              } catch (err: unknown) {
                toast.error(getErrorMessage(err));
              }
            }}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
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

  if (loading && boards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <LogoIcon />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight text-slate-900">
                Mini Kanban
              </p>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="hidden md:block">
                <p className="max-w-45 truncate text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>

                <p className="text-[11px] text-slate-400">
                  Workspace member
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              My Boards
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Organize your work, track progress, and keep every task moving forward.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setNewBoardName("");
              setShowCreateModal(true);
            }}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <PlusIcon />
            New Board
          </button>
        </section>

        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <LayersIcon />

            <span className="text-sm font-semibold text-slate-700">
              {boards.length}{" "}
              {boards.length === 1 ? "board" : "boards"}
            </span>
          </div>

          {boards.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              Select a board to continue
            </span>
          )}
        </div>

        {boards.length === 0 ? (
          <section className="flex min-h-105 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 shadow-sm">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BoardIcon />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                No boards yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create your first board and start organizing your projects and tasks in one place.
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNewBoardName("");
                  setShowCreateModal(true);
                }}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <PlusIcon />
                Create your first board
              </button>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
              >
                <div className="h-1 bg-blue-600" />

                <div className="p-5">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <Link
                      href={`/board/${board.id}`}
                      className="flex min-w-0 flex-1 items-start gap-3"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <BoardIcon />
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <h2 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-700">
                          {board.name}
                        </h2>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {board._count?.columns || 0}{" "}
                          {board._count?.columns === 1
                            ? "column"
                            : "columns"}
                        </p>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteBoard(
                          board.id,
                          board.name,
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      title="Delete board"
                      aria-label={`Delete ${board.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Owner
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-slate-700">
                      {board.owner?.name || "Unknown"}
                    </p>
                  </div>

                  <Link
                    href={`/board/${board.id}`}
                    className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Open board
                    <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeCreateModal();
              }
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BoardIcon />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Create new board
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Give your board a clear name to get started.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <form
                onSubmit={handleCreateBoard}
                className="px-6 py-6"
              >
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="board-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Board name
                  </label>

                  <input
                    id="board-name"
                    type="text"
                    value={newBoardName}
                    onChange={(e) => {
                      setNewBoardName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. Product Development"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    autoFocus
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    Create board
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