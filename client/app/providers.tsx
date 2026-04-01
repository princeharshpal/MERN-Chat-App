"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "@/src/store";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <Provider store={store}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Toaster position="bottom-right" reverseOrder={false} />
          {children}
        </NextThemesProvider>
      </Provider>
    </RouterProvider>
  );
}
