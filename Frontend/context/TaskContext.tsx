"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { taskApi } from "@/lib/api";  
import { Task } from "@/types";       

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasksByColumn: (columnId: string) => Promise<Task[]>;
  createTask: (columnId: string, title: string, description?: string, assigneeId?: string) => Promise<Task>;
  updateTask: (taskId: string, title?: string, description?: string, assigneeId?: string) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, targetColumnId: string, targetPosition: number) => Promise<Task>;
  getTaskById: (taskId: string) => Promise<Task>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksByColumn = useCallback(async (columnId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Note: We'll get tasks from column API or board API
      // For now, we'll rely on board context
      return [];
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch tasks"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (columnId: string, title: string, description?: string, assigneeId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.create(columnId, { title, description, assigneeId });
      setTasks((prev) => [...prev, task]);
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create task"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, title?: string, description?: string, assigneeId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.update(taskId, { title, description, assigneeId });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update task"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      await taskApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete task"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, targetColumnId: string, targetPosition: number) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.move(taskId, { targetColumnId, targetPosition });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to move task"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTaskById = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskApi.getById(taskId);
      return task;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to get task"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasksByColumn,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within TaskProvider");
  }
  return context;
}