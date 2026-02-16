"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class" // puts "dark" class on <html>
      defaultTheme="light"
      enableSystem={false} // אתה ביקשת toggle בלבד, לא לפי מערכת
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
