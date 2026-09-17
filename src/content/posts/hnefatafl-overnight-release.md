---
title: "Hnefatafl: from first commit to installers overnight"
description: Viking chess rebuilt in Kotlin and Compose Multiplatform, with shared rules, shared UI, and a tag-driven pipeline that ships DMG, EXE, DEB and APK builds.
date: 2026-02-27
tags: [kotlin, games, ci]
project: hnefatafl
---

Hnefatafl is an asymmetric Norse strategy game. The defenders protect a king who wants to escape to a corner; the attackers, who outnumber them, want to surround him. The repository went up on the evening of February 26th, and `v1.0.6` shipped with native installers the next morning.

## Rules, implemented

- an 11×11 board with the correct starting layout
- rook-like orthogonal movement, no jumping
- only the king may enter a corner square
- pieces are captured by sandwiching, including against the edge
- the king wins by reaching a corner; the attackers win by surrounding him on four sides

On top of that sit turn-based flow, undo, and win counters across matches.

## Built to be shared

```text
shared/logic   rules engine + tests
shared/ui      Compose UI + settings system
app-desktop    window host, native pickers and window controls
app-android    Android host activity + APK packaging
```

The game logic doesn't know it's running on a desktop or a phone. Both hosts use the same gameplay and settings, and the look aims for a modern, macOS-like style with a board that scales to any window.

## Shipping is a tag

Quality gates run with `./gradlew verify` (ktlint, detekt, unit and integration tests). A release is just a pushed tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions then builds a `.dmg` for macOS, `.exe` and `.msi` for Windows, a `.deb` for Linux, and Android APKs, and attaches them to the release. Players don't need Java installed; the runtime ships inside each bundle.
