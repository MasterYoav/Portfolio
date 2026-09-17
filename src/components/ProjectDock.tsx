import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Project } from '@/data/site';

type DockProject = Pick<Project, 'id' | 'name' | 'category' | 'icon' | 'accent'>;

/** macOS-style dock: icons swell toward the pointer. Static row on touch and reduced motion. */
export function ProjectDock({ projects }: { projects: DockProject[] }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <TooltipProvider delayDuration={80}>
      <motion.ul
        onPointerMove={(e) => e.pointerType === 'mouse' && mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        className="flex h-24 w-fit max-w-full items-end gap-3 rounded-2xl border border-border bg-card/60 px-3 pb-3"
      >
        {projects.map((p) => (
          <DockIcon key={p.id} project={p} mouseX={mouseX} />
        ))}
      </motion.ul>
    </TooltipProvider>
  );
}

function DockIcon({ project, mouseX }: { project: DockProject; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - r.left - r.width / 2 : Infinity;
  });
  const size = useSpring(useTransform(distance, [-140, 0, 140], [48, reduce ? 48 : 72, 48]), {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });

  return (
    <li className="flex items-end">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.a
            ref={ref}
            href={`/projects/${project.id}`}
            style={{ width: size, height: size, '--accent': project.accent } as never}
            className="group relative grid place-items-center rounded-[22%] outline-offset-4"
            aria-label={`${project.name}, ${project.category}`}
          >
            <img
              src={project.icon}
              alt=""
              draggable={false}
              className="size-full rounded-[22%] object-cover shadow-[0_6px_18px_-6px_var(--accent)] transition-shadow duration-300 group-hover:shadow-[0_10px_30px_-6px_var(--accent)]"
              style={{ viewTransitionName: `project-icon-${project.id}` }}
            />
          </motion.a>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={10} className="font-sans text-sm">
          {project.name}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
