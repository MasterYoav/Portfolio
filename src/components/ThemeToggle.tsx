"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // מונע hydration mismatch

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        fixed top-5 right-5 z-50
        h-10 w-10 rounded-full
        border border-black/10 bg-white text-black
        shadow-sm
        dark:border-white/15 dark:bg-black dark:text-white
      "
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
