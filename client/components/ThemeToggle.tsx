"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { HiSun, HiMoon } from "react-icons/hi2";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
    setThemeState(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
  };

  if (!mounted) return null;

  return (
    <Button
      isIconOnly
      variant="ghost"
      aria-label="Toggle theme"
      size="sm"
      className="text-default-500 hover:text-default-900 transition-colors"
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <HiSun className="w-5 h-5" />
      ) : (
        <HiMoon className="w-5 h-5" />
      )}
    </Button>
  );
}
