import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('contains the required adaptive accessibility media queries', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  expect(css).toContain('prefers-reduced-motion: reduce');
  expect(css).toContain('prefers-reduced-transparency: reduce');
  expect(css).toContain('prefers-contrast: more');
});
