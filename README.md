# Yoav Peretz Portfolio

Personal Astro portfolio with an app-shelf style projects section, GitHub-powered README previews, and direct OS download actions for shipped apps.

## Stack

- Astro 6
- `marked` for Markdown parsing
- `dompurify` for sanitizing rendered README HTML

## Features

- App-store style `my projects` shelf built from a single `apps` array in `src/pages/index.astro`
- Quick view modal for each app
- README fetched live from GitHub and rendered inside the modal
- Relative README links and images rewritten so they keep working inside the site
- README image fitting for banners and screenshots
- Badge detection so Markdown badges keep their normal inline appearance
- Direct OS download icons that resolve to the latest installable GitHub release asset for:
  - macOS: `.dmg`, `.pkg`
  - Windows: `.exe`, `.msi`
  - Linux: `.deb`, `.AppImage`, `.rpm`, `.flatpak`, `.snap`, `.run`
- Platform download icons render only when that app actually has a downloadable asset for that OS

## Development

Requires Node `>=22.12.0`.

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Project Structure

```text
.
├── public/
│   ├── download-icons/
│   │   ├── apple-logo.png
│   │   ├── linux.png
│   │   └── windows.png
│   └── favicon.svg
├── src/
│   └── pages/
│       └── index.astro
├── package.json
└── README.md
```

## How To Add Or Edit Apps

All app showcase data lives in the top-level `apps` array in `src/pages/index.astro`.

Each app entry currently uses:

```ts
{
  id: 'icesniff',
  name: 'IceSniff',
  category: 'Packet analysis',
  platform: 'macOS · CLI · Web',
  blurb: 'A modern packet analysis stack with native, browser, and terminal surfaces.',
  icon: 'https://raw.githubusercontent.com/...',
  repoUrl: 'https://github.com/...',
  downloadUrl: 'https://github.com/.../releases/latest',
  readmeUrl: 'https://raw.githubusercontent.com/.../README.md',
  rawBaseUrl: 'https://raw.githubusercontent.com/.../',
  blobBaseUrl: 'https://github.com/.../blob/.../',
  accent: '#91e6ff',
}
```

Notes:

- `repoUrl` is used for release discovery.
- `readmeUrl` is the Markdown source loaded into the modal.
- `rawBaseUrl` and `blobBaseUrl` are used to rewrite relative README images and links.
- `downloadUrl` is still useful as a fallback target for repos that do not expose installable release assets.

## Direct Download Logic

When an app modal opens, the site requests recent GitHub releases for that repo and filters out source archives. Only installable assets are considered.

The header then renders floating OS icons only for the platforms that exist in the latest available release set:

- Apple icon: latest `.dmg` or `.pkg`
- Windows icon: latest `.exe` or `.msi`
- Linux icon: latest supported Linux installer/executable asset

If a repo has no installable releases for a platform, that platform icon is not rendered.

## README Rendering Notes

README content is fetched client-side from GitHub, converted to HTML with `marked`, sanitized with `dompurify`, and then post-processed to:

- rewrite relative links
- rewrite relative images
- fit large banners inside the modal
- avoid horizontal README scrolling
- preserve badge-style images as inline badges

## Asset Notes

Download platform icons are stored in `public/download-icons/`.

If you want to swap them:

1. Replace the PNG files in `public/download-icons/`
2. Keep the same filenames, or update `iconAssetPlatform()` in `src/pages/index.astro`

## Current Limitation

This implementation fetches GitHub README and release data from the client. If GitHub rate limits anonymous requests, README or release resolution may temporarily fail until the limit resets.
