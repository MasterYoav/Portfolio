"use client";

import Image from "next/image";
import React, { useMemo } from "react";

type ContactItem = {
  title: string;
  subtitle: string;
  iconSrc: string; // must start with "/"
  href: string;
};

export default function ContactModal({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}) {
  const isDark = theme === "dark";

  const panelStyle = useMemo(
    () => ({
      background: isDark ? "rgba(20,20,20,0.78)" : "rgba(255,255,255,0.72)",
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
      color: isDark ? "white" : "black",
    }),
    [isDark],
  );

  const items: ContactItem[] = [
    {
      title: "Gmail",
      subtitle: "realyoavperetz@gmail.com",
      iconSrc: "/logos/gmail.png",
      href: "mailto:realyoavperetz@gmail.com",
    },
    {
      title: "WhatsApp",
      subtitle: "",
      iconSrc: "/logos/whatsapp.png",
      href: "https://wa.me/972544408619",
    },
    {
      title: "LinkedIn",
      subtitle: "",
      iconSrc: "/logos/linkedin.png",
      href: "https://www.linkedin.com/in/yoav-peretz-320056376/",
    },
    {
      title: "GitHub",
      subtitle: "",
      iconSrc: "/logos/github.png",
      href: "https://github.com/MasterYoav",
    },
  ];

  const openLink = (href: string) => {
    // ✅ אין window.location.href = ... (זה מה שנתקע לך ב-ESLint)
    if (href.startsWith("mailto:") || href.startsWith("tel:")) {
      window.location.assign(href);
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />

      {/* panel */}
      <div className="absolute left-1/2 top-1/2 w-[min(900px,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-3xl border px-8 py-7 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          style={panelStyle}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-2xl font-semibold">Contact</div>
              <div className="mt-1 text-sm opacity-70">Find me here</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-black/5 text-lg transition hover:bg-black/10 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((it) => (
              <button
                key={it.title}
                type="button"
                onClick={() => openLink(it.href)}
                className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-black/5 p-5 text-left transition hover:bg-black/10 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
                aria-label={`Open ${it.title}`}
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-black/10 bg-white/60 dark:border-white/15 dark:bg-white/10">
                  <Image
                    src={it.iconSrc}
                    alt={`${it.title} icon`}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-sm opacity-70">{it.subtitle}</div>
                </div>

                <div className="text-sm opacity-60 transition group-hover:opacity-100">
                  ↗
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
