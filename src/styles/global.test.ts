import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const css = readFileSync('src/styles/global.css', 'utf8');

function mediaBlock(query: string, nextQuery?: string) {
  const start = css.indexOf(`@media (${query})`);
  const end = nextQuery ? css.indexOf(`@media (${nextQuery})`, start) : css.length;
  return css.slice(start, end);
}

it('makes every translucent surface opaque and blur-free when transparency is reduced', () => {
  const block = mediaBlock('prefers-reduced-transparency: reduce', 'prefers-contrast: more');
  const surfaces = [
    '.material',
    '.project-card',
    '.appearance-control',
    '.project-card-action',
    '.project-carousel .project-carousel-control',
    '.project-sheet',
    ".project-sheet > [data-slot='dialog-close']",
    '.project-download-actions a',
    '.project-readme',
    "[data-slot='dialog-overlay']",
  ];

  for (const selector of surfaces) expect(block).toContain(selector);
  expect(block).toMatch(/background:\s*var\(--(?:card|background|material-solid)\)/);
  expect(block).toContain('backdrop-filter: none');
  expect(block).toContain('filter: none');
});

it('uses solid surfaces and explicit contrasting borders in high-contrast mode', () => {
  const block = mediaBlock('prefers-contrast: more');
  const surfaces = [
    '.material',
    '.project-card',
    '.appearance-control',
    '.project-card-action',
    '.project-carousel .project-carousel-control',
    '.project-sheet',
    ".project-sheet > [data-slot='dialog-close']",
    '.project-download-actions a',
    '.project-readme',
  ];

  for (const selector of surfaces) expect(block).toContain(selector);
  expect(block).toMatch(/background:\s*var\(--(?:card|background|material-solid)\)/);
  expect(block).toMatch(/border:\s*2px solid currentColor/);
  expect(block).toContain('backdrop-filter: none');
});

it('retains the reduced-motion mode', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  expect(css).toContain('prefers-reduced-motion: reduce');
  expect(css).toContain('.project-sheet');
  expect(css).toContain('transform: none !important');
});
