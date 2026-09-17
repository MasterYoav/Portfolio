---
title: "skillFight: which of your Claude skills wins?"
description: Install enough Claude skills and some start fighting over the same requests. skillFight finds the overlaps and stages the verdict as an ASCII fighting game.
date: 2026-07-16
tags: [typescript, ai, claude-code, cli]
project: skillfight
---

You install a skill, then another, then twenty. Some of them quietly overlap: two descriptions that both want to fire for the same request. skillFight points at your skills folder, finds those collisions, and tells you **who wins, what to merge, and what can coexist**, with a rationale you can audit. It never deletes anything; it advises, you decide.

## Two lenses on one roster

- **Arena** asks *do these two collide?* It compares skill descriptions and returns a verdict per conflict: knockout, merge, or coexist.
- **Trials** asks *for this task, who fires?* Throw real requests at the roster and each one comes back as a **hit** (one skill answers), **contested** (two skills fight over the trigger), or a **gap** (nothing covers it).

## The same arena, twice

The whole thing is TypeScript end to end so the terminal and the browser share one ASCII renderer. The TUI is built with Ink; the web app is React and Vite with a monospace skin that works on a phone. In the browser, a small local server holds your API key, so it never reaches the page.

Each skill gets an archetype the model assigns during analysis, with its own ASCII avatar, and a newly summoned skill is an unhatched egg until the arena appraises it.

## Bring your own model

Anthropic, OpenAI, or a fully local model through Ollama, LM Studio or MLX. Skill bodies are treated as **untrusted input**: the judging prompt quotes them as data, never as instructions.

The build went step by step, each one shipping something that ran. The latest push, on July 16th, added multi-layer verification of the engine's verdicts and choreographed the battles.
