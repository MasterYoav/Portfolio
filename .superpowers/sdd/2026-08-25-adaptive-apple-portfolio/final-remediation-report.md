# Final remediation report

## Outcome

All nine findings in `final-remediation-brief.md` are addressed in the adaptive portfolio worktree.

## Changes

1. Added `public/cluck-invaders.html` to the deliverable and added `src/static-assets.test.ts`, which checks the source asset and runs an Astro production build into a temporary directory before asserting the built route exists. The existing sheet test also verifies that Cluck Invaders loads `/cluck-invaders.html` in the iframe.
2. Rebuilt tracked `dist/` output from the final source. `dist/cluck-invaders.html` is byte-identical to the public source asset.
3. Replaced carousel release/source “Download” actions with accurate “View … releases” or “View … source” labels and external-link icons. Detail-sheet buttons for genuine uploaded platform installers retain “Download latest … build” labels.
4. Expanded reduced-transparency styling across material chrome, cards, card controls, appearance controls, carousel controls, the project sheet, close/download controls, README panel, and dialog overlay. These surfaces use solid backgrounds, disable backdrop blur, and remove decorative filter blur. High-contrast mode gives the same surfaces solid backgrounds and explicit `2px solid currentColor` borders. Stylesheet tests assert the concrete selectors and declarations.
5. Made the mobile handle a pointer-driven drag target with pointer capture, live downward tracking, a 112 px distance threshold, and a 700 px/s velocity threshold. Events are confined to the handle, so the independent sheet scroll region keeps native scrolling. Sub-threshold drags spring back; the Base UI close button, focus trap, Escape handling, and focus restoration remain intact.
6. Added selected-card-origin open and reverse-close animation through the installed `motion` package. The spring uses `stiffness: 380`, `damping: 39`, and `mass: 1`, a critically damped/no-bounce configuration. The exact opening transform is retained for the reverse path. Reduced-motion uses static transform plus short opacity transitions.
7. Added module-level promise caches for GitHub releases and raw README responses. Successful requests are reused, failed requests are evicted for retry, request cleanup still blocks stale state updates, and cached README text is sanitised and URL-rewritten for each consuming project before rendering.
8. Removed unused `lenis` from the manifest and lockfile, deleted the unreferenced `src/layouts/Layout.astro`, and removed `passWithNoTests` from Vitest configuration. Repository search found no source consumers for Lenis or the deleted layout. No other files were deleted.
9. Rebuilt the committed distribution bundle after all source and stylesheet changes.

## Test evidence

- Baseline: `npm test` — 5 files, 13 tests passed, demonstrating the earlier suite did not cover the review gaps.
- Red phase: focused new tests produced six expected failures covering action labels, README/release caching, drag dismissal, reduced-transparency coverage, high-contrast coverage, and reduced-motion sheet fallback.
- Focused green phase: `npm test -- src/components/ProjectCarousel.test.tsx src/components/ProjectSheet.test.tsx src/styles/global.test.ts src/static-assets.test.ts` — 4 files, 16 tests passed.
- Full suite: `npm test` — 6 files, 19 tests passed.
- Production build: `npm run build` — 1 static page built successfully.
- Artifact check: `cmp public/cluck-invaders.html dist/cluck-invaders.html` — identical, 43,361 bytes each.
- Cleanup checks: repository search returned no `lenis` or `passWithNoTests` references in their former configuration files and no runtime reference to `src/layouts/Layout.astro`.
- Whitespace validation: `git diff --check` completed with no output.

## Scope preservation

The pre-existing unrelated `.astro/settings.json` modification and untracked `.claude/`, `.impeccable/`, and `PRODUCT.md` paths were left unstaged and unchanged by the remediation commit.

## Concerns

None known. The production route is covered by an actual isolated Astro build rather than a source-only assertion.
