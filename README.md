# Yoav Peretz — notes & shipped apps

Personal site built as an interactive, blog-style portfolio: build logs and release stories next to the apps they describe, with smooth, reduced-motion-aware animation throughout. Inspired by [steipete.me](https://steipete.me).

## Stack

- **Astro 6** — static pages, content collections, `ClientRouter` view transitions
- **React 19.2 islands** — command palette, topic filter, project dock, shader background
- **shadcn/ui** (radix-nova) — command, dialog, tooltip, badge, button, kbd
- **Tailwind CSS 4** — OKLCH tokens for light and dark themes in `src/styles/global.css`
- **motion** — layout animations, dock magnification
- **@shadergradient/react** — animated gradient behind the writing pages
- **marked** — README rendering at build time

> React is pinned to `~19.2.7` because `@react-three/fiber` (required by ShaderGradient) doesn't support React 19.3 yet.

## Design

- **Type:** Faculty Glyphic (self-hosted from `public/fonts/`) for all prose and headings. It ships a single Regular weight, so hierarchy comes from size and spacing, never faux bold. JetBrains Mono is used only for dates, tags and code.
- **Color:** blue-black surfaces with a chartreuse signal in dark mode (the default); true off-white with an olive signal in light mode.
- **Motion:** page cross-fades with shared-element morphs for post titles and app icons, staggered list entrances, a circular reveal on theme switch, a scroll-driven reading progress bar, and a macOS-style dock. Everything has a `prefers-reduced-motion` fallback.

## Structure

```text
src/
├── content/posts/*.md        posts (title, description, date, tags, optional project id)
├── content.config.ts         post schema
├── data/site.ts              name, links, nav and the projects list
├── lib/github.ts             build-time README + latest-release fetching
├── lib/posts.ts              sorting, reading time, date formatting
├── layouts/Base.astro        head, header, footer, command palette, optional backdrop
├── components/
│   ├── BlogBackdrop.tsx      ShaderGradient background (writing pages only)
│   ├── CommandMenu.tsx       ⌘K / "/" search palette
│   ├── EncryptedText.tsx     scrambled-text reveal in the home headline
│   ├── PostFilter.tsx        animated tag filter on /posts
│   ├── ProjectDock.tsx       dock of app icons on the home page
│   ├── ThemeToggle.astro     light/dark toggle with circular reveal
│   └── ui/                   shadcn components
└── pages/
    ├── index.astro           intro, latest writing, project dock
    ├── posts/                index with filter + post pages with TOC and progress bar
    ├── projects/             project list + pages with downloads, README, playable game
    ├── about.astro, 404.astro
    └── rss.xml.ts
```

## Writing a post

Add a Markdown file to `src/content/posts/`:

```md
---
title: "Dragon: a file shelf that lives in the notch"
description: One or two sentences shown in lists, search and RSS.
date: 2026-03-29
tags: [swift, macos]
project: dragon   # optional: links the post and the project page to each other
---
```

## Adding a project

Add an entry to `projects` in `src/data/site.ts`. Set `repo` (`owner/name`) to get the README and download buttons pulled from GitHub at build time, or `gameUrl` to embed a playable page from `public/`.

Downloads are resolved from the latest release that has installers: `.dmg`/`.pkg` (macOS), `.exe`/`.msi` (Windows), `.deb`/`.AppImage`/`.rpm` (Linux), `.apk` (Android). An optional `GITHUB_TOKEN` in `.env.local` raises the API rate limit; if it's rejected the build falls back to unauthenticated requests.

## Development

Requires Node `>=22.12.0`.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview
npx astro check   # type-check
```
