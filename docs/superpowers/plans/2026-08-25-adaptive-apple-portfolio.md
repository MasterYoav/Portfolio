# Adaptive Apple Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current portfolio with an adaptive Apple-inspired project gallery that makes project exploration, downloads, and contact effortless.

**Architecture:** Keep Astro as the static page shell and move the interactive experience into a small React island. Centralise project facts in one typed data module. Use generated Shadcn primitives for the carousel and dialog while custom CSS owns the portfolio-specific adaptive materials, layout, and motion.

**Tech Stack:** Astro 6, React 19, Motion, Shadcn/ui, Embla Carousel, Tailwind CSS, TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-adaptive-apple-portfolio-design.md`

## Global Constraints

- Preserve Astro + React and the existing GitHub README/release integration; do not add a backend, CMS, analytics, or image pipeline.
- Add Shadcn only for primitives in use: Carousel, Dialog, and Button; do not create a local component library around them.
- Default appearance is System; Light and Dark overrides persist in local storage.
- Use the system font stack, WCAG AA contrast, and responsive units.
- Honour `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast: more`.
- The project carousel never auto-plays or hijacks vertical page scroll.
- Use transform/opacity for motion and return focus to the originating project card when the project sheet closes.
- Keep existing user changes outside the files named by each task intact.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/lib/projects.ts` | Typed project facts, rewritten product copy, and repository/release URLs. |
| `src/lib/appearance.ts` | Appearance preference validation and effective-theme resolution. |
| `src/components/PortfolioExperience.tsx` | Owns selected project and appearance state; composes the page sections. |
| `src/components/AppearanceControl.tsx` | Accessible System/Light/Dark segmented control. |
| `src/components/ProjectCarousel.tsx` | Shadcn Carousel composition and project card interactions. |
| `src/components/ProjectSheet.tsx` | Project detail dialog, release actions, README status, and focus return. |
| `src/components/ui/*` | Shadcn-generated `button`, `carousel`, and `dialog` primitives. |
| `src/styles/global.css` | Theme tokens, responsive layout, material surfaces, and accessible motion fallbacks. |
| `src/pages/index.astro` | Minimal Astro document shell and React island mount. |
| `src/lib/appearance.test.ts` | Unit coverage for preference validation and effective theme selection. |

### Task 1: Establish the Shadcn and test foundation

**Files:**
- Create: `components.json`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/carousel.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/lib/utils.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `astro.config.mjs`
- Modify: `tsconfig.json`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `@/components/ui/{button,carousel,dialog}` and `cn(...inputs: ClassValue[]): string`.
- Produces: a runnable `npm test` command for later tasks.

- [ ] **Step 1: Add a failing test command**

Add the following script to `package.json` before adding test files:

```json
"test": "vitest run"
```

- [ ] **Step 2: Verify the test command fails because Vitest is absent**

Run: `npm test`

Expected: failure stating that `vitest` cannot be found.

- [ ] **Step 3: Initialise Tailwind and Shadcn for the existing Astro app**

Install the Astro-compatible Tailwind tooling, initialise Shadcn with the `src/components` target and `@/*` alias, then generate exactly these primitives:

```sh
npx shadcn@latest init -t astro
npx shadcn@latest add button carousel dialog
```

Use the CLI's generated configuration rather than hand-copying Shadcn source. Add `vitest`, `jsdom`, and `@testing-library/react` as development dependencies and register the `test` script.

Configure Vitest to run component tests in jsdom:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { environment: 'jsdom' } });
```

- [ ] **Step 4: Add the minimal shared class helper**

Ensure `src/lib/utils.ts` exposes the helper Shadcn components import:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Verify generated primitives and build**

Run: `npm test && npm run build`

Expected: both commands succeed; generated components resolve through `@/` imports.

- [ ] **Step 6: Commit**

```sh
git add package.json package-lock.json astro.config.mjs tsconfig.json components.json vitest.config.ts src/components/ui src/lib/utils.ts src/styles/global.css
git commit -m "feat: add shadcn portfolio foundation"
```

### Task 2: Centralise portfolio content and appearance logic

**Files:**
- Create: `src/lib/projects.ts`
- Create: `src/lib/appearance.ts`
- Create: `src/lib/appearance.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `Project`, `projects`, `AppearancePreference`, `readAppearancePreference`, and `resolveTheme`.
- Consumes: none.
- Required signatures:

```ts
export type AppearancePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export function readAppearancePreference(value: string | null): AppearancePreference;
export function resolveTheme(preference: AppearancePreference, systemIsDark: boolean): ResolvedTheme;
```

- [ ] **Step 1: Write failing appearance tests**

```ts
import { describe, expect, it } from 'vitest';
import { readAppearancePreference, resolveTheme } from './appearance';

describe('appearance preference', () => {
  it('falls back to system for unknown stored values', () => {
    expect(readAppearancePreference('violet')).toBe('system');
  });

  it('uses the system colour scheme only in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/appearance.test.ts`

Expected: failure because `./appearance` does not exist.

- [ ] **Step 3: Implement the smallest appearance module**

```ts
export function readAppearancePreference(value: string | null): AppearancePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export function resolveTheme(preference: AppearancePreference, systemIsDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemIsDark ? 'dark' : 'light') : preference;
}
```

- [ ] **Step 4: Create the typed project source of truth**

Move the five project facts out of `index.astro`, retain real repository/readme/release URLs, and rewrite each project's `summary` and `highlights` as concise product copy. Include `gameUrl` only for Cluck Invaders.

```ts
export type Project = {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  summary: string;
  highlights: string[];
  icon: string;
  accent: string;
  repoUrl?: string;
  readmeUrl?: string;
  rawBaseUrl?: string;
  blobBaseUrl?: string;
  gameUrl?: string;
};
```

- [ ] **Step 5: Verify tests and data compilation**

Run: `npm test && npm run build`

Expected: tests pass and no project facts remain duplicated in `src/pages/index.astro`.

- [ ] **Step 6: Commit**

```sh
git add src/lib/projects.ts src/lib/appearance.ts src/lib/appearance.test.ts src/pages/index.astro
git commit -m "feat: centralize portfolio content and appearance"
```

### Task 3: Build the appearance control and adaptive page shell

**Files:**
- Create: `src/components/AppearanceControl.tsx`
- Create: `src/components/PortfolioExperience.tsx`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `AppearancePreference`, `ResolvedTheme`, `projects`, and `Project` from Task 2.
- Produces: `<PortfolioExperience projects={projects} />` and an accessible `<AppearanceControl />`.

- [ ] **Step 1: Write a failing appearance-control test**

Create `src/components/AppearanceControl.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AppearanceControl } from './AppearanceControl';

it('exposes System, Light, and Dark choices with the active value', () => {
  render(<AppearanceControl value="system" onChange={vi.fn()} />);
  expect(screen.getByRole('radiogroup', { name: 'Appearance' })).toBeVisible();
  expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/AppearanceControl.test.tsx`

Expected: failure because `AppearanceControl` does not exist.

- [ ] **Step 3: Implement the three-state control and root theme application**

The component uses native radio inputs styled as a compact material segmented control. `PortfolioExperience` stores the preference under `portfolio-appearance`, resolves System through `matchMedia`, sets `document.documentElement.dataset.theme`, and listens for system changes only while System is selected.

```tsx
<fieldset aria-label="Appearance" className="appearance-control">
  {(['system', 'light', 'dark'] as const).map((option) => (
    <label key={option}>
      <input type="radio" name="appearance" value={option} checked={value === option} onChange={() => onChange(option)} />
      <span>{option}</span>
    </label>
  ))}
</fieldset>
```

- [ ] **Step 4: Replace the Astro page with a minimal document shell**

Keep title, description, favicon, and an early inline theme boot script to prevent a light/dark flash. Mount the interactive portfolio with `client:load`:

```astro
---
import { PortfolioExperience } from '@/components/PortfolioExperience';
import { projects } from '@/lib/projects';
import '@/styles/global.css';
---
<PortfolioExperience client:load projects={projects} />
```

- [ ] **Step 5: Implement responsive shell styles**

Create theme token pairs under `[data-theme='light']` and `[data-theme='dark']`, then implement the floating top bar, hero, section spacing, and contact section. Use platform system fonts and responsive dimensions; do not use the existing full-viewport shader or encrypted-text effect.

- [ ] **Step 6: Verify the shell**

Run: `npm test && npm run build`

Expected: tests and build pass; manual browser check confirms System, Light, and Dark modes survive a reload.

- [ ] **Step 7: Commit**

```sh
git add src/components/AppearanceControl.tsx src/components/AppearanceControl.test.tsx src/components/PortfolioExperience.tsx src/pages/index.astro src/styles/global.css
git commit -m "feat: add adaptive portfolio shell"
```

### Task 4: Implement the Shadcn project-card carousel

**Files:**
- Create: `src/components/ProjectCarousel.tsx`
- Create: `src/components/ProjectCarousel.test.tsx`
- Modify: `src/components/PortfolioExperience.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `Project` from `src/lib/projects.ts` and `Carousel*` primitives from `@/components/ui/carousel`.
- Produces:

```ts
export function ProjectCarousel({ projects, onSelect }: {
  projects: Project[];
  onSelect: (project: Project, trigger: HTMLButtonElement) => void;
}): JSX.Element;
```

- [ ] **Step 1: Write a failing carousel test**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProjectCarousel } from './ProjectCarousel';
import { projects } from '@/lib/projects';

it('renders every project as a labelled card action', () => {
  render(<ProjectCarousel projects={projects} onSelect={vi.fn()} />);
  expect(screen.getByRole('button', { name: /open IceSniff/i })).toBeVisible();
  expect(screen.getByRole('button', { name: /open Cluck Invaders/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/ProjectCarousel.test.tsx`

Expected: failure because `ProjectCarousel` does not exist.

- [ ] **Step 3: Compose the Shadcn carousel**

Use `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, and `CarouselNext` from the generated component. Configure `align: 'start'`, no loop, and no autoplay. Project cards are real buttons and include a nested, separately labelled download/source action only when its URL exists; avoid nested interactive elements by placing secondary actions beside the card button.

```tsx
<Carousel opts={{ align: 'start' }} className="project-carousel">
  <CarouselContent>
    {projects.map((project) => (
      <CarouselItem key={project.id} className="project-carousel-item">
        <button aria-label={`Open ${project.name}`} onClick={(event) => onSelect(project, event.currentTarget)}>
          {/* product artwork, category, name, platform, summary */}
        </button>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious aria-label="Previous project" />
  <CarouselNext aria-label="Next project" />
</Carousel>
```

- [ ] **Step 4: Style adaptive cards and controls**

Give cards one large panel at a time, a visible next-card edge on large screens, full-width cards on narrow viewports, contextual project-accent glow, and pointer-down feedback. Preserve Embla's native touch drag and wheel behaviour; do not add a competing drag handler.

- [ ] **Step 5: Verify carousel interaction**

Run: `npm test && npm run build`

Expected: tests and build pass. Manually verify previous/next controls, keyboard focus, horizontal touch swipe, no autoplay, and vertical page scrolling outside the carousel.

- [ ] **Step 6: Commit**

```sh
git add src/components/ProjectCarousel.tsx src/components/ProjectCarousel.test.tsx src/components/PortfolioExperience.tsx src/styles/global.css
git commit -m "feat: add shadcn project carousel"
```

### Task 5: Add project details, downloads, and README fallback states

**Files:**
- Create: `src/components/ProjectSheet.tsx`
- Create: `src/components/ProjectSheet.test.tsx`
- Modify: `src/components/PortfolioExperience.tsx`
- Modify: `src/styles/global.css`
- Remove: `src/components/AppShelf.tsx`
- Remove: `src/components/AppShelf.css`
- Remove: `src/components/EncryptedText.tsx`
- Remove: `src/components/ShaderBg.tsx`

**Interfaces:**
- Consumes: `Project`, selected-card trigger, and Shadcn `Dialog` primitives.
- Produces:

```ts
export function ProjectSheet({ project, trigger, onOpenChange }: {
  project: Project | null;
  trigger: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
}): JSX.Element;
```

- [ ] **Step 1: Write a failing sheet accessibility test**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProjectSheet } from './ProjectSheet';
import { projects } from '@/lib/projects';

it('labels project details as a dialog and exposes a close action', () => {
  render(<ProjectSheet project={projects[0]} trigger={null} onOpenChange={vi.fn()} />);
  expect(screen.getByRole('dialog', { name: /IceSniff/i })).toBeVisible();
  expect(screen.getByRole('button', { name: /close/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/ProjectSheet.test.tsx`

Expected: failure because `ProjectSheet` does not exist.

- [ ] **Step 3: Implement the sheet with existing remote-data behaviour**

Move the existing release classification, latest-per-platform resolution, Markdown sanitisation, and relative asset rewrite logic into the sheet or focused helpers next to it. On opening, display the rewritten product story first, then platform download actions, repository link, and README content/status. For Cluck Invaders, retain the local iframe game view.

On close, call `onOpenChange(false)` and restore focus to `trigger`. If GitHub requests fail, retain repository/release-page links and show a short status message rather than an empty sheet.

- [ ] **Step 4: Style desktop dialog and mobile sheet modes**

Use the same Shadcn Dialog semantic layer. On large screens, render a centred heavy-material sheet. On narrow screens, anchor it to the bottom with a drag-handle visual and a visible close control; do not implement a custom swipe gesture unless Shadcn's primitive cannot preserve scroll and focus behaviour.

- [ ] **Step 5: Remove superseded presentation components**

Delete the old app shelf, encrypted hero, and shader background only after `PortfolioExperience` is the active implementation. Do not delete `ExpandableProjectCards` in this task unless `rg "ExpandableProjectCards" src` confirms it is unreferenced.

- [ ] **Step 6: Verify sheet and remote fallbacks**

Run: `npm test && npm run build`

Expected: tests and build pass. Manually verify opening/closing a card, focus return, project links, at least one release lookup, README loading, a disabled-network fallback, and the local game.

- [ ] **Step 7: Commit**

```sh
git add src/components/ProjectSheet.tsx src/components/ProjectSheet.test.tsx src/components/PortfolioExperience.tsx src/styles/global.css src/components/AppShelf.tsx src/components/AppShelf.css src/components/EncryptedText.tsx src/components/ShaderBg.tsx
git commit -m "feat: add adaptive project details"
```

### Task 6: Complete accessibility polish and remove stale starter files

**Files:**
- Modify: `src/styles/global.css`
- Modify: `README.md`
- Remove: `src/components/ExpandableProjectCards.tsx`
- Remove: `src/components/ExpandableProjectCards.css`
- Remove: `src/components/Welcome.astro`
- Remove: `src/assets/astro.svg`
- Remove: `src/assets/background.svg`

**Interfaces:**
- Consumes: completed page and component classes from Tasks 3–5.
- Produces: documented design, accessible appearance variants, and no unused starter UI source.

- [ ] **Step 1: Write a failing stylesheet policy test**

Create `src/styles/global.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('contains the required adaptive accessibility media queries', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  expect(css).toContain('prefers-reduced-motion: reduce');
  expect(css).toContain('prefers-reduced-transparency: reduce');
  expect(css).toContain('prefers-contrast: more');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/styles/global.test.ts`

Expected: failure until all three media queries exist in the final stylesheet.

- [ ] **Step 3: Add accessibility variants**

Implement the required styles:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
@media (prefers-reduced-transparency: reduce) { .material { backdrop-filter: none; } }
@media (prefers-contrast: more) { .material { border-color: currentColor; } }
```

Keep opacity and color feedback available in reduced-motion mode.

- [ ] **Step 4: Remove confirmed unused source**

Run: `rg -n "ExpandableProjectCards|Welcome|astro.svg|background.svg" src`

Delete only files with no remaining references. Update `README.md` to document the Shadcn carousel, appearance modes, project source file, and build/test commands.

- [ ] **Step 5: Verify the complete redesign**

Run: `npm test && npm run build`

Expected: both commands pass. Manually inspect a desktop and narrow viewport in System, Light, and Dark mode; check keyboard tab order, visible focus, appearance persistence, carousel controls, project sheet focus return, download actions, README fallback, and reduced-motion/reduced-transparency rendering.

- [ ] **Step 6: Commit**

```sh
git add src/styles/global.css src/styles/global.test.ts README.md src/components/ExpandableProjectCards.tsx src/components/ExpandableProjectCards.css src/components/Welcome.astro src/assets/astro.svg src/assets/background.svg
git commit -m "feat: polish adaptive portfolio accessibility"
```

## Plan self-review

### Spec coverage

- Adaptive system/light/dark appearance: Tasks 2 and 3.
- Shadcn carousel and project cards: Tasks 1 and 4.
- Desktop and touch-specific project details: Task 5.
- Direct downloads, GitHub README, game, and graceful remote failures: Task 5.
- Apple-style materials, native typography, restrained motion: Tasks 3–5.
- Accessibility, keyboard/focus flow, and user preference media queries: Tasks 3, 5, and 6.
- Removal of superseded/source starter code: Tasks 5 and 6.
- Documentation: Task 6.

### Consistency checks

`Project`, `AppearancePreference`, `resolveTheme`, `PortfolioExperience`, `ProjectCarousel`, and `ProjectSheet` are defined before their consuming task. The plan adds Shadcn only before it is used, and every implementation task includes a focused failing test, a passing verification command, and its own commit.
