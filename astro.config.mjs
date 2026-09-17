// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yoavperetz.dev',
  integrations: [react()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-dimmed' } } },
  vite: { plugins: [tailwindcss()] },
});
