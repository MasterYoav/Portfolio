---
title: "Cluck Invaders: a space shooter in one HTML file"
description: Homing missiles, spread shots, boss waves and a fireblast special, built with nothing but the Canvas 2D API. You can play it right on this site.
date: 2026-06-25
tags: [games, javascript, canvas]
project: cluck-invaders
---

Cluck Invaders started as a prototype and stayed deliberately small: one HTML file, no framework, no build step, no game engine. Just a `<canvas>`, a render loop, and a lot of chickens.

## What's in it

- **Waves** that escalate, with a short breather between them
- **Boss fights** that break up the rhythm
- **Homing missiles** and a **spread** weapon as pickups
- a **Fireblast** special that charges up as you play
- score and lives, arcade style

## Why vanilla Canvas

For a game this size, a framework would be more code than the game. The 2D context handles sprites and particles well, and keeping everything in a single file means it drops into any page, including this one.

It's embedded on the [project page](/projects/cluck-invaders), so you can play it without leaving the site.
