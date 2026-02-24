"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import GooeyNav from "@/components/GooeyNav";
import LogoLoop from "@/components/LogoLoop";
import ProjectsModal from "@/components/ProjectsModal";
import ContactModal from "@/components/ContactModal";

const navItems = [
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // ✅ single source of truth for the modal
  const [openModal, setOpenModal] = useState<null | "projects" | "contact">(
    null,
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const sysDark =
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;

      const next =
        saved === "dark"
          ? "dark"
          : saved === "light"
            ? "light"
            : sysDark
              ? "dark"
              : "light";

      setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    } finally {
      setMounted(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  };

  const isDark = theme === "dark";

  const themeIcon = useMemo(
    () => (mounted ? (isDark ? "🌙" : "☀️") : ""),
    [mounted, isDark],
  );

  return (
    <section className="relative min-h-screen w-full">
      {/* Toggle (top-right) */}
      <div className="absolute right-6 top-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="
            inline-flex items-center gap-2
            rounded-full px-4 py-2 text-sm
            border
            backdrop-blur-xl
            transition
          "
          style={{
            borderColor: "rgb(var(--border))",
            background: "rgba(var(--card))",
            color: "rgb(var(--fg))",
          }}
        >
          <span className="select-none">{themeIcon}</span>
        </button>
      </div>

      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        {/* Logo (no frame) */}
        <div className="mb-10 flex items-center justify-center">
          <Image
            src={isDark ? "/logolight.png" : "/logodark.png"}
            alt="Yoav logo"
            width={110}
            height={110}
            priority
            className="block h-auto w-[70px] select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Hey */}
        <div
          className="text-lg md:text-xl font-medium"
          style={{ color: "rgba(var(--muted))" }}
        >
          Hey, I&apos;m Yoav <span aria-hidden="true">👋</span>
        </div>

        {/* Title */}
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight md:text-6xl">
          Software Engineer
        </h1>

        <div className="mt-10 md:mt-1" />

        {/* Memoji + Textbar stack */}
        <div className="mt-1 w-full max-w-4xl">
          <div className="flex flex-col items-center gap-7">
            {/* Memoji (NO frame) */}
            <div className="w-full flex justify-center">
              <Image
                src="/memoji.png"
                alt="Yoav memoji"
                width={420}
                height={420}
                priority
                className="block h-auto w-[340px] md:w-[420px] select-none [clip-path:inset(2px)]"
              />
            </div>

            {/* iPhone-y text bar */}
            <div className="relative z-0 -mt-8 w-full">
              <div className="mx-auto flex w-full items-center gap-4 rounded-full border border-black/10 bg-white/70 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur dark:border-white/15 dark:bg-black/35 dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                <span className="flex-1 select-none text-left text-base text-black/45 dark:text-white/35">
                  Ask me anything...
                </span>

                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-full bg-black text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                  aria-label="Submit"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gooey nav */}
        <div className="mt-14">
          <GooeyNav
            items={navItems}
            particleCount={44}
            timeVariance={1200}
            initialActiveIndex={0}
            theme={theme}
            // ✅ open modal instead of scrolling
            onSelect={(_, item) => {
              if (item.href === "#projects") setOpenModal("projects");
              if (item.href === "#contact") setOpenModal("contact");
            }}
          />
        </div>

        {/* Tech Logo Loop (below nav) */}
        <div className="mt-20 w-full">
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl">
            <div className="relative h-[120px] w-full">
              <LogoLoop
                logos={[
                  { src: "logos/python.png", alt: "Python" },
                  { src: "logos/java.png", alt: "Java" },
                  { src: "logos/cpp.png", alt: "cpp" },
                  { src: "logos/git.png", alt: "Git" },
                  { src: "logos/jenkins.png", alt: "Jenkins" },
                  { src: "logos/Docker.png", alt: "Docker" },
                  { src: "logos/mongoDB.png", alt: "MongoDB" },
                  { src: "logos/mysql.png", alt: "MySQL" },
                  { src: "logos/nextjs.png", alt: "Next.js" },
                ]}
                speed={100}
                direction="right"
                logoHeight={40}
                gap={70}
                hoverSpeed={60}
                scaleOnHover
                pauseOnHover={false}
                fadeOutColor={isDark ? "#000000" : "#ffffff"}
                ariaLabel="Technology stack"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Modals (no scrolling pages) */}
      <ProjectsModal
        open={openModal === "projects"}
        onClose={() => setOpenModal(null)}
        theme={theme}
      />
      <ContactModal
        open={openModal === "contact"}
        onClose={() => setOpenModal(null)}
        theme={theme}
      />
    </section>
  );
}
