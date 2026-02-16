"use client";

export default function ContactModalContent() {
  return (
    <div className="text-black dark:text-white">
      <h3 className="text-xl font-semibold">Contact</h3>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          className="rounded-xl border border-black/10 px-4 py-3 text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          href="mailto:realyoavperetz@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          realyoavperetz@gmail.com
        </a>

        <a
          className="rounded-xl border border-black/10 px-4 py-3 text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          href="https://instagram.com/yoavperetz"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>

        <a
          className="rounded-xl border border-black/10 px-4 py-3 text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          href="https://www.linkedin.com/in/yoav-peretz-320056376/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>

        <a
          className="rounded-xl border border-black/10 px-4 py-3 text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          href="https://github.com/MasterYoav"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
