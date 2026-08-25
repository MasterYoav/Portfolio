# Yoav Peretz Portfolio

An adaptive Astro portfolio for Yoav Peretz. It presents selected work in an Apple-inspired interface with a persistent System, Light, and Dark appearance control.

## Experience

- A Shadcn carousel for browsing projects, with keyboard-accessible previous and next controls.
- A project sheet that returns focus to the card that opened it.
- Direct release download links, GitHub README previews, and a browser-game project.
- Graceful messages when GitHub README or release data is unavailable.
- Reduced-motion, reduced-transparency, and higher-contrast appearance variants.

## Development

Requires Node `>=22.12.0`.

```sh
npm install
npm run dev
```

Run the test suite:

```sh
npm test
```

Build and preview the production site:

```sh
npm run build
npm run preview
```

## Project content

Edit `src/lib/projects.ts` to add or change a project. Each entry controls its title, category, platforms, description, artwork, links, and optional download, README, or game experience.

## Structure

```text
src/
├── components/      # Appearance control, carousel, and project sheet
├── lib/projects.ts  # Portfolio project source
├── pages/index.astro
└── styles/global.css
```
