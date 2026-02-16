"use client";

import Reveal from "@/components/Reveal";

export default function Section({
  id,
  title,
  children,
  delay = 0,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section id={id} className="py-16">
      <Reveal delay={delay}>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-4">{children}</div>
      </Reveal>
    </section>
  );
}
