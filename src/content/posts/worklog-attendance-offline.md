---
title: "WorkLog: attendance that survives a bad signal"
description: A React Native and Expo app for small businesses, with GPS-validated clock-ins, per-worker attendance policies, and punches that queue offline until the network comes back.
date: 2026-02-27
tags: [react-native, supabase, mobile]
project: worklog
---

WorkLog helps small businesses track who worked, where, and on what. It's a cross-platform mobile app for two kinds of users, employers and workers, backed by Supabase.

## Punching in, anywhere

The clock is the heart of the app. Every punch logs a location, and a haversine check compares it against the workplace. Each worker has an attendance policy the employer can switch at any time:

- **From workplace only** (the default)
- **From anywhere**

Job sites don't always have good reception, so punches made offline are queued locally and synced automatically once the device reconnects.

## What employers see

- every worker with their total hours, calculated server-side
- a monthly summary per worker
- projects they can create, view and delete, with photos, videos and files attached

Project media stays in the device sandbox rather than in the cloud. Only the structured data (employers, workers, projects, punches) goes to Supabase, behind row-level security and RPC calls.

## Stack

Expo and `expo-router` for navigation, Supabase for Postgres, RLS and RPC, AsyncStorage for the offline cache, and TypeScript everywhere. The theme follows the system light or dark setting, with a manual toggle, and every button color has one job: green for the main action, blue for secondary, red for destructive.
