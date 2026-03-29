"use client";

import { ToastProvider } from "@heroui/react";
import { AuthProvider } from "../providers/AuthProvider";
import { ChatProvider } from "../providers/ChatProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <ToastProvider maxVisibleToasts={5} placement="top end" />
        {children}
      </ChatProvider>
    </AuthProvider>
  );
}
