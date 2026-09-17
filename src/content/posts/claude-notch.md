---
title: "Claude Notch: steering Claude Code from the notch"
description: The notch glows while Claude works, turns red when it needs you, and turns every in-session question into a button, so you never switch to a terminal just to say yes.
date: 2026-07-20
tags: [swift, macos, ai, claude-code]
project: claude-notch
---

When Claude Code runs in a terminal behind other windows, you find out it needs you late. Claude Notch moves that signal to the one place always in view: the notch.

## Glow first

It glows **orange** while Claude works, **red** when it's waiting on you, **green** when it's done, then retracts into the bezel. Press it and it opens to show the current tool call (*Reading `foo.swift`*, *Running `npm test`*) with a stop button that sends exactly what ⌃C does.

## Every choice reaches the notch

Permission requests arrive through Claude Code's `PermissionRequest` hook, and the notch shows **Approve / Deny**. Some prompts fire no hook at all, like a *"Switch model to Sonnet?"* confirmation, so the notch reads the terminal screen and offers the numbered options as buttons. The goal is that opening a session just to confirm something never makes sense.

When something needs you, it opens on its own long enough to read and click, with an optional sound.

## At a glance

- a slim **context-window meter** that climbs toward auto-compaction
- a badge when work has been **delegated to a subagent**
- a rough running **cost** per session
- **model, reasoning and permission mode** for the live session in one drawer
- **recent sessions** to resume, and every live session sorted by who needs you first

## Built to be trusted

No dependencies beyond the frameworks that ship with macOS, and a universal binary for Apple Silicon and Intel. The installer is a short script you're encouraged to read: it verifies the release's SHA-256, backs up `~/.claude/settings.json` before adding its nine hooks, and `--uninstall-hooks` removes only its own.

The app isn't notarized (that needs a paid Apple developer account), and the README lays out the three ways around Gatekeeper and who you're trusting with each. `v0.1.0` and `v0.1.1` both shipped on July 20th, and CI runs the self-test on every push.
