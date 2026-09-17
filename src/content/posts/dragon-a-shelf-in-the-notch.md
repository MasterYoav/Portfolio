---
title: "Dragon: a file shelf that lives in the notch"
description: A free macOS utility that turns the notch (or the menu bar) into a staging area for files, with compress, convert, share, AirDrop, tag and cloud-sync actions a click away.
date: 2026-03-29
tags: [swift, macos, design]
project: dragon
---

Most file work on a Mac is a small detour. You grab something, open another app, convert or compress it, then drop it somewhere else. Dragon removes the detour: stage files once, then act on them from a panel that lives at the top-center of your screen.

## Two ways in

Dragon runs as an accessory app, not a dock-first one. You pick how it shows up:

- **Notch**, a compact floating panel shaped around the notch region, with a smooth open and close animation
- **Menu Bar**, with a choice of icon styles

Drag files in to stage them, or click the staged area to import. Staged items show up as Finder-style tiles with Quick Look thumbnails, and you can drag them back out into Finder or any other app.

## Actions

The current action set is intentionally short: `Compress`, `Convert`, `Share`, `AirDrop`, `Tag` and `Cloud Sync`. Each one can be hidden per user, so the panel only shows what you actually reach for.

## Conversion without leaving the panel

Conversion stays within a category, and the coverage is broad:

- **Images:** PNG, JPEG, HEIC, TIFF, BMP, GIF, WebP
- **Audio:** WAV, AIFF, CAF, M4A, AAC, FLAC, MP3, OGG, AC3 and more
- **Video:** MP4, M4V, MOV, AVI, MKV, MPEG
- **Documents:** PDF, TXT, RTF, HTML, DOC, DOCX, ODT, Markdown and more

## Under the hood

The UI is SwiftUI, hosted inside an AppKit `NSPanel` so it can float above everything without behaving like a normal window. Media conversion runs through a reviewed, bundled `ffmpeg`. Save panels, folder pickers, the share sheet and AirDrop are all native.

Dragon is free and open source, and version 1.0 is on GitHub Releases as a DMG.
