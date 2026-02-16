"use client";

import React, { useEffect, useMemo, useState } from "react";

type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string | null } | null;
};

export default function ProjectsModal({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Repo[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch("/api/github/pinned", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          const details =
            typeof json?.error === "string"
              ? json.error
              : "Couldn't load projects";
          throw new Error(details);
        }

        if (!cancelled) {
          setItems(json.items ?? []);
        }
      } catch (e: any) {
        if (!cancelled) setErr(String(e?.message ?? "Couldn't load projects"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const isDark = theme === "dark";

  const panelStyle = useMemo(
    () => ({
      background: isDark ? "rgba(20,20,20,0.78)" : "rgba(255,255,255,0.72)",
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
      color: isDark ? "white" : "black",
    }),
    [isDark],
  );

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
              <div className="text-2xl font-semibold">Projects</div>
              <div className="mt-1 text-sm opacity-70">
                Pinned repositories from GitHub
              </div>
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

          <div className="mt-6">
            {loading && (
              <div className="rounded-2xl border border-black/10 bg-black/5 p-5 text-sm opacity-80 dark:border-white/15 dark:bg-white/10">
                Loading pinned projects…
              </div>
            )}

            {!loading && err && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm">
                <div className="font-semibold">Couldn’t load projects</div>
                <div className="mt-1 opacity-80">{err}</div>
                <div className="mt-2 opacity-70">
                  Tip: make sure <code>GITHUB_TOKEN</code> and{" "}
                  <code>GITHUB_USERNAME</code> exist in <code>.env.local</code>{" "}
                  (בלי גרשיים).
                </div>
              </div>
            )}

            {!loading && !err && (
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((r) => (
                  <button
                    key={r.url}
                    type="button"
                    onClick={() =>
                      window.open(r.url, "_blank", "noopener,noreferrer")
                    }
                    className="group text-left rounded-2xl border border-black/10 bg-black/5 p-5 transition hover:bg-black/10 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
                    aria-label={`Open ${r.name} on GitHub`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-semibold">{r.name}</div>
                      <div className="text-sm opacity-60 transition group-hover:opacity-100">
                        ↗
                      </div>
                    </div>

                    {r.description && (
                      <div className="mt-2 text-sm opacity-80 line-clamp-2">
                        {r.description}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs opacity-75">
                      <span>★ {r.stargazerCount}</span>
                      <span>⑂ {r.forkCount}</span>
                      {r.primaryLanguage?.name && (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background:
                                r.primaryLanguage.color ??
                                (isDark ? "#fff" : "#000"),
                              opacity: 0.9,
                            }}
                          />
                          {r.primaryLanguage.name}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && !err && items.length === 0 && (
              <div className="rounded-2xl border border-black/10 bg-black/5 p-5 text-sm opacity-80 dark:border-white/15 dark:bg-white/10">
                No pinned repositories found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
