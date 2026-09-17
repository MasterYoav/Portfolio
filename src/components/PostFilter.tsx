import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';

export type PostSummary = { id: string; title: string; description: string; date: string; tags: string[]; minutes: number };

const fmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const ease = [0.16, 1, 0.3, 1] as const;

export function PostFilter({ posts, tags }: { posts: PostSummary[]; tags: string[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const reduce = useReducedMotion();

  // Deep link: /posts?tag=rust
  useEffect(() => setTag(new URLSearchParams(location.search).get('tag')), []);
  const choose = (next: string | null) => {
    setTag(next);
    const url = new URL(location.href);
    next ? url.searchParams.set('tag', next) : url.searchParams.delete('tag');
    history.replaceState(history.state, '', url);
  };

  const visible = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;
  const years = [...new Set(visible.map((p) => p.date.slice(0, 4)))];

  return (
    <LayoutGroup>
      <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-1.5">
        {[null, ...tags].map((t) => {
          const active = t === tag;
          return (
            <button
              key={t ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => choose(active ? null : t)}
              className="relative rounded-full px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-background"
            >
              {active && (
                <motion.span
                  layoutId="tag-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={reduce ? { duration: 0 } : { duration: 0.5, ease }}
                />
              )}
              <span className="relative">{t ? `#${t}` : 'all'}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 font-mono text-xs text-muted-foreground" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'post' : 'posts'}
        {tag && ` tagged #${tag}`}
      </p>

      <div className="mt-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {years.map((year) => (
            <motion.section
              key={year}
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-x-8 border-t border-border py-6 sm:grid-cols-[5rem_1fr]"
            >
              <h2 className="mb-3 font-mono text-sm text-muted-foreground sm:mb-0 sm:pt-3">{year}</h2>
              <ol>
                <AnimatePresence mode="popLayout" initial={false}>
                  {visible
                    .filter((p) => p.date.startsWith(year))
                    .map((p) => (
                      <motion.li
                        key={p.id}
                        layout={!reduce}
                        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.18 } }}
                        transition={{ duration: reduce ? 0 : 0.55, ease }}
                      >
                        <a
                          href={`/posts/${p.id}`}
                          className="group -mx-3 flex flex-col rounded-xl px-3 py-3 transition-colors hover:bg-card"
                        >
                          <span className="flex items-baseline justify-between gap-4">
                            <span
                              className="text-lg leading-snug transition-colors"
                              style={{ viewTransitionName: `post-title-${p.id}` }}
                            >
                              {p.title}
                            </span>
                            <time dateTime={p.date} className="shrink-0 font-mono text-xs text-muted-foreground">
                              {fmt.format(new Date(p.date))}
                            </time>
                          </span>
                          <span className="mt-1 line-clamp-2 text-[0.95rem] text-muted-foreground">{p.description}</span>
                        </a>
                      </motion.li>
                    ))}
                </AnimatePresence>
              </ol>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
