---
title: "xBot: two weeks, 144 commits, and agents that finally get a computer"
description: A native Mac app wrapped around a self-hosted agent platform. What got built since September 2nd, and the bugs that only showed up once real agents ran.
date: 2026-09-14
tags: [swift, ai, docker, macos]
project: xbot
---

xBot is my attempt at a simple promise: **your own AI coworkers, on your own Mac.** Create agents, give each one a computer with its own browser and files, watch them work, and take the wheel when you want to. Bring any model: OpenAI, Anthropic, Google, xAI, or a local one through Ollama.

It's still in development. Here's what the first two weeks actually looked like.

## The idea: a fusion

Two good things existed separately. [OpenBot](https://github.com/CopilotKit/openbot) is a serious self-hosted agent platform, with per-agent isolation, an action gateway and a real audit trail, but it's a developer template: clone, copy an `.env`, run a script. Grok Bot showed what the consumer version looks like: a rail of agents, a live view of what each is doing, settings you can find.

xBot takes OpenBot's engine, puts a native Mac app in front of it, and doesn't lock you to one model vendor. The goal is that you never open a terminal, never edit a config file, and never read a log.

## Day one: from spec to a running app

The repository started on September 2nd with a written specification. The same day, the OpenBot engine was vendored in, CI and the Swift package skeleton went up (M0), and the Mac app ran for the first time with its rail, conversation view, composer, right panel, command palette and design system (M4). By evening it was parsing the engine's event stream and creating agents in a real engine (M5). That day alone is 32 commits.

## Re-ordering the roadmap

The original plan put replacing CopilotKit's hosted history service first, as "the gate". Running the engine proved otherwise: the seam took 136 lines and the engine boots without an account. The real risk was the part nobody had started, which was the app. So that milestone moved past v1, and the order became *engine running → client → connected → onboarding → ship*.

The trade-off is written down rather than hidden: in v1, conversation history is stored by CopilotKit, and onboarding says so before you type a key.

## Where it stands

| Milestone | State |
| --- | --- |
| Groundwork, headless engine, Mac app skeleton | Done |
| Model router | Proven live against a real vendor |
| Connected | Client done and driven against a real engine |
| Onboarding | In progress: five steps built, VM testing open |
| Ship v1.0 | In progress: signing and notarization still open |

The engine image is published to GitHub's container registry on every push, and the app pulls a pinned digest at start. The Mac client has 235 unit tests.

## What real runs exposed

The most recent push, on September 14th, is a good picture of this stage. Each fix came from something that looked finished on paper:

- **No agent could use a tool, and no routine ever fired**, inside the packaged engine image.
- **No agent was ever offered its computer**, or remembered the conversation.
- **An agent asking for a secret or for help had nobody to ask.**
- **The published engine was amd64-only**, and Docker reported most engines as unhealthy on Apple Silicon. It's now multi-arch and verified on Apple Silicon.
- A human takeover handed back between two polls read as *nobody coming*.

That's the unglamorous middle of building an agent product: the demo works, then you make it work for real.
