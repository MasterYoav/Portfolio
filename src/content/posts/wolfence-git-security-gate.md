---
title: "Wolfence: a fence between your laptop and the remote"
description: A Rust CLI that wraps git push with a security gate, plus a native macOS monitor and a browser console. Secrets, vulnerable patterns and risky config get stopped before they leave.
date: 2026-04-17
tags: [rust, security, git]
project: wolfence
---

The usual flow is `git push`, then the problem gets discovered in the repository later. Wolfence moves the check to the last moment you still control:

```text
wolf push → scan → block or allow → push
```

You write and commit normally. `wolf push` decides whether the outbound code is safe enough to leave the machine, and explains why when it isn't.

## What it looks for

- **Secrets:** API keys, tokens, private keys, leaked `.env` files
- **Vulnerable patterns:** command injection, SSRF, path traversal, unsafe deserialization, XSS
- **Dependencies:** lockfile drift, risky registries, internal packages pulled from direct sources across npm, pnpm, Yarn, Cargo, Go, Bundler, Poetry, uv and Pipenv
- **Config:** Docker, CI/CD, Terraform and Kubernetes posture
- **Its own authority:** changes to `.wolfence` policy, hook drift and GitHub Actions publish paths

It only scans what changed, keeps a repo-local finding history so new risk stands apart from known risk, and supports accepted baselines without weakening the push policy.

## Three surfaces, one authority

The Rust `wolf` CLI makes every decision. A native SwiftUI macOS app monitors several repositories and renders the evidence, and an Astro web console gives the same view in a browser through a local bridge. The UIs read; only the CLI decides.

The web console became functional in the April 17th push, alongside fixes that unblocked CI pinning and rule provenance.
