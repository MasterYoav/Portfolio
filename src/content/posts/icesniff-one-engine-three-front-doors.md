---
title: "IceSniff: one engine, three front doors"
description: A packet analyzer where a shared Rust core powers a native macOS app, a full-screen terminal UI and a local web app, with an AI panel that knows which packet you're looking at.
date: 2026-03-21
tags: [rust, swift, networking, ai]
project: icesniff
---

IceSniff is an open-source packet analysis project. The idea is simple: the analysis should be written once, and the interface should meet you wherever you already are, whether that's a terminal, a Mac window or a browser tab.

## The shape of the repo

There are three apps, and they all talk to the same analysis engine:

- `apps/cli`, a Rust CLI with a full-screen TUI
- `apps/macos`, a native SwiftUI app
- `apps/live`, a local web app

Opening a `.pcap` or `.pcapng` file, listing packets, computing stats, following conversations, streams and transactions: all of that happens in one place. The front ends only decide how to present it.

## A CLI that is also an API

Every command can emit stable `--json` output, which makes the CLI a building block as much as a tool:

```bash
icesniff-cli inspect capture.pcap
icesniff-cli conversations capture.pcap --json
```

Install it with a one-liner on macOS and Linux (or PowerShell on Windows), then `icesniff` opens a launcher menu for the TUI, the web app, or uninstalling.

## AI, carefully

The macOS app has a packet-aware AI sidebar. It can run offline, through hosted providers, or through local Codex and Claude Code routes. Because packet data can be sensitive, a few rules are built in:

- API keys live in the macOS Keychain, never in preferences
- saved keys are never shown back in plain text
- hosted requests use an ephemeral session with caching disabled
- provider errors are sanitized before they reach the UI

> The honest limit: if you pick a hosted provider and send a prompt, the selected packet context goes to that provider. The app says so.

## What's not done

Protocol coverage today is Ethernet, ARP, IPv4, TCP, UDP, ICMP, DNS, HTTP/1.1 and TLS handshake metadata. That's a lot less than mature analyzers cover, and there's no Windows or Linux desktop app yet. Those are the next frontiers.
