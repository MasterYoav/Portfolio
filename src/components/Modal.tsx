"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  // Lock scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60]"
      aria-modal="true"
      role="dialog"
      onMouseDown={(e) => {
        // click outside -> close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="relative w-full max-w-5xl rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4 dark:border-white/10">
            <div className="min-w-0">
              {title ? (
                <h2 className="truncate text-base font-semibold text-black dark:text-white">
                  {title}
                </h2>
              ) : (
                <span />
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:bg-black/5 hover:text-black focus:outline-none dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[80vh] overflow-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
