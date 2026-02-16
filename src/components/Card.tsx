"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      // If reduced motion: no hover animation (but SAME DOM/classes)
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={
        "rounded-2xl border border-neutral-800/70 bg-neutral-900/30 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] " +
        className
      }
    >
      {children}
    </motion.div>
  );
}
