---
title: "SeaStar: a sea companion for iPhone and Apple Watch"
description: Snorkel, freedive and scuba each ask a different question underwater, so each gets a different instrument on the Watch. Plus Liquid Glass that sits in the water.
date: 2026-09-12
tags: [swift, watchos, ios, design]
project: seastar
---

SeaStar is a free, native iPhone and Apple Watch companion for time in the water. It's built with SwiftUI and Swift Charts, with no third-party runtime dependencies, accounts, ads or subscriptions. Recording and logbooks work offline; only forecasts and map tiles need the network.

It's in development, and the first public commit landed on September 12th.

## One activity, one question

The Watch home screen has a switcher for **Snorkel**, **Freedive** and **Scuba**. Each carries its own colour, symbol and depth scale through every screen after it, because each activity asks something different of a glance:

- **Snorkel and scuba read depth.** They get a vertical gauge scaled to the activity (6 m for snorkel, 40 m for scuba), with a marker at the deepest point reached. A given shade always means the same depth on that scale.
- **Freedive reads time.** It gets a breath-hold ring around the hold clock. The ring fills towards your longest hold that session; surface, and it switches to the surface interval, then the next descent bumps the dive count.

The three supporting values change too, so the glance never repeats the full sensor page one swipe away. Sizes derive from the display, so it holds one screen from a 40 mm Watch to an Ultra.

## Glass that sits in the water

On iOS 26 and watchOS 26 the chrome uses Liquid Glass: the activity pill, the readouts, the session bar, and the empty part of the depth gauge, which reads as a glass tube with water in it. Glass needs something behind it to refract, and the old background was near-black, so screens now sit in the chosen activity's water, with a gradient, a waterline and a soft glow. Reduce Transparency and increased contrast fall back to solid panels.

## Honest by design

The demo dives are illustrative profiles, not physiological models, and the app says so. Depth and time alerts are personal reminders: **no safe depth, ascent rate or breath-hold limit is implied, and no scuba guidance is given.** Health data is read through HealthKit, and simulations never write to it.
