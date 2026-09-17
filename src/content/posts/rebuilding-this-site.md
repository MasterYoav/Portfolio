---
title: Rebuilding this site as a notebook
description: The portfolio used to be a shelf of app cards. Now it's a place to write about the things I ship, and why that change matters more than the new paint.
date: 2026-09-17
tags: [meta, astro, design]
---

The previous version of this site was a single page: a scrambled-text hero, a shelf of app cards, and a dialog that pulled each README from GitHub. It showed *what* I had built, but it said almost nothing about *how* or *why*.

So I turned it into a notebook. Every project now gets a write-up, and there's room for the notes in between.

## What changed

- **Writing comes first.** The home page leads with posts, not a hero banner. Projects are still one click away, and each one has its own page with the README rendered at build time.
- **One typeface with a voice.** Everything is set in Faculty Glyphic, a glyphic face with carved, slightly calligraphic terminals. It only ships a regular weight, so hierarchy comes from size and space instead of bold. Code and dates use JetBrains Mono.
- **Motion that follows reading.** Pages cross-fade through the View Transitions API, lists settle in with a short stagger, and a thin progress line tracks how far into a post you are. All of it switches off under `prefers-reduced-motion`.
- **Keyboard first.** Press <kbd>⌘</kbd> <kbd>K</kbd> anywhere to jump to a post, a project, or a link.

## The stack

```text
Astro 6          static pages + content collections
React islands    command palette, tag filter, theme toggle
shadcn/ui        dialog, command, badge, button primitives
Tailwind CSS 4   tokens in OKLCH, light and dark
```

Content lives in Markdown next to the code. Project pages fetch each repository's README and latest release while the site builds, so a visitor never waits on the GitHub API.

## Why bother

Shipping an app is half of the work. The other half is explaining what it does, why it's built the way it is, and what I'd change. That explanation now has a home.
