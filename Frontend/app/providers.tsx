"use client";

import { AuthProvider } from "@/context/AuthContext";
import { BoardProvider } from "@/context/BoardContext";
import { TaskProvider } from "@/context/TaskContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BoardProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </BoardProvider>
    </AuthProvider>
  );
}