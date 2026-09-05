"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { boardApi, columnApi, taskApi } from "@/lib/api";
import { Board, Column, Task } from "@/types";
import { BoardMember } from "@/lib/api/board";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong";
};

interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (name: string) => Promise<Board>;
  updateBoard: (id: string, name: string) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  shareBoard: (boardId: string, email: string) => Promise<void>;
  removeMember: (boardId: string, userId: string) => Promise<void>;
  getBoardMembers: (boardId: string) => Promise<BoardMember[]>;
  createColumn: (boardId: string, name: string) => Promise<Column>;
  updateColumn: (columnId: string, name: string) => Promise<Column>;
  deleteColumn: (columnId: string) => Promise<void>;
  createTask: (columnId: string, title: string, description?: string) => Promise<Task>;
  updateTask: (taskId: string, title?: string, description?: string) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, targetColumnId: string, targetPosition: number) => Promise<Task>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardApi.getAll();
      setBoards(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardApi.getById(id);
      setCurrentBoard(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const board = await boardApi.create({ name });
      setBoards((prev) => [board, ...prev]);
      return board;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBoard = useCallback(async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const board = await boardApi.update(id, { name });
      setBoards((prev) => prev.map((b) => (b.id === id ? board : b)));
      if (currentBoard?.id === id) {
        setCurrentBoard(board);
      }
      return board;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard]);

  const deleteBoard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await boardApi.delete(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
      if (currentBoard?.id === id) {
        setCurrentBoard(null);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard]);

  const shareBoard = useCallback(async (boardId: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      await boardApi.share(boardId, { email });
      await fetchBoard(boardId);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBoard]);

  const removeMember = useCallback(async (boardId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await boardApi.removeMember(boardId, userId);
      await fetchBoard(boardId);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBoard]);

  const getBoardMembers = useCallback(async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const members = await boardApi.getMembers(boardId);
      return members;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createColumn = useCallback(async (boardId: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const column = await columnApi.create(boardId, { name });
      await fetchBoard(boardId);
      return column;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBoard]);

  const updateColumn = useCallback(async (columnId: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const column = await columnApi.update(columnId, { name });
      if (currentBoard) {
        await fetchBoard(currentBoard.id);
      }
      return column;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard, fetchBoard]);

  // ✅ Only ONE deleteColumn function
  const deleteColumn = useCallback(async (columnId: string) => {
    setLoading(true);
    setError(null);
    try {
      await columnApi.delete(columnId);
      if (currentBoard) {
        await fetchBoard(currentBoard.id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard, fetchBoard]);

  const createTask = useCallback(async (columnId: string, title: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.create(columnId, { title, description });
      if (currentBoard) {
        await fetchBoard(currentBoard.id);
      }
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard, fetchBoard]);

  const updateTask = useCallback(async (taskId: string, title?: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.update(taskId, { title, description });
      if (currentBoard) {
        await fetchBoard(currentBoard.id);
      }
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard, fetchBoard]);

  const deleteTask = useCallback(async (taskId: string) => {
  setLoading(true);
  setError(null);
  try {
    await taskApi.delete(taskId);
    if (currentBoard) {
      await fetchBoard(currentBoard.id);
    }
  } catch (err: unknown) {
    setError(getErrorMessage(err));
    throw err;
  } finally {
    setLoading(false);
  }
}, [currentBoard, fetchBoard]);

  const moveTask = useCallback(async (taskId: string, targetColumnId: string, targetPosition: number) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.move(taskId, { targetColumnId, targetPosition });
      if (currentBoard) {
        await fetchBoard(currentBoard.id);
      }
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard, fetchBoard]);

  const value = {
    boards,
    currentBoard,
    loading,
    error,
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    shareBoard,
    removeMember,
    getBoardMembers,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within BoardProvider");
  }
  return context;
}