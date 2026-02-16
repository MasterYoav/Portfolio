import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SplashCursor from "@/components/SplashCursor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" suppressHydrationWarning>
      <body>
        <div className="pointer-events-none fixed inset-0 -z-10">
          <SplashCursor />
        </div>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
