import { useEffect, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { ArrowUpRight, FileText, Hash, Package, SearchIcon } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';

type Item = { group: string; label: string; href: string; hint: string };

const icons: Record<string, typeof FileText> = { Writing: FileText, Projects: Package, Pages: Hash, Elsewhere: ArrowUpRight };

export function CommandMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === '/' && !(e.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setOpen(true);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (/^(https?:|mailto:)/.test(href)) window.open(href, href.startsWith('mailto:') ? '_self' : '_blank', 'noreferrer');
    else navigate(href);
  };

  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Search posts, projects and links"
      >
        <SearchIcon className="size-4" />
        <span className="hidden items-center gap-0.5 md:flex [&_kbd]:font-mono">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to a post, project or page">
        <Command>
          <CommandInput placeholder="Search writing, projects, pages…" />
          <CommandList className="max-h-[min(60vh,26rem)]">
            <CommandEmpty>Nothing matches that. Try a project name or a tag.</CommandEmpty>
            {groups.map((group) => {
              const Icon = icons[group] ?? Hash;
              return (
                <CommandGroup key={group} heading={group}>
                  {items
                    .filter((i) => i.group === group)
                    .map((i) => (
                      <CommandItem key={i.href} value={`${i.label} ${i.hint}`} onSelect={() => go(i.href)}>
                        <Icon className="text-muted-foreground" />
                        <span className="truncate">{i.label}</span>
                        {group === 'Elsewhere' && <CommandShortcut>↗</CommandShortcut>}
                      </CommandItem>
                    ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
