import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, expect, it } from 'vitest';

const outputDirectory = mkdtempSync(join(tmpdir(), 'portfolio-build-'));

afterAll(() => rmSync(outputDirectory, { recursive: true, force: true }));

it('ships the Cluck Invaders route in Astro production output', () => {
  expect(existsSync('public/cluck-invaders.html')).toBe(true);

  execFileSync('node_modules/.bin/astro', ['build', '--outDir', outputDirectory], {
    stdio: 'pipe',
  });

  expect(existsSync(join(outputDirectory, 'cluck-invaders.html'))).toBe(true);
});
