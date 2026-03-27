---
slug: supermq-magistrala-merge-announcement
title: "SuperMQ and Magistrala Are Becoming One"
description: "We're merging SuperMQ and Magistrala back into a single unified platform. Here's what's changing and what it means for you."
date: "2026-03-24"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/supermq-magistrala-announcement-merge/cover.png"
ogImage:
  url: "/img/blogs/supermq-magistrala-announcement-merge/cover.png"
tags:
  - Magistrala
  - SuperMQ
  - Announcement
  - IoT Platform
  - Open Source
category: announcement
---

We have an important update to share: **SuperMQ and Magistrala are merging into a single unified platform.**

---

## A quick history

[Magistrala](https://github.com/absmach/magistrala) started as a full-featured open-source IoT platform — handling device connectivity, multi-tenancy, access control, the Rules Engine, Alarms, Reports, and more. Over time, we extracted its core messaging and infrastructure layer into a separate project: [SuperMQ](https://github.com/absmach/supermq).

The intent was a clean separation of concerns — SuperMQ as the general-purpose event-driven core, and Magistrala as the IoT application layer on top.

In practice, running two repositories created more problems than it solved.

With the merger, the Abstract Machines stack is now clearly defined across four focused projects:

- **[Magistrala](https://github.com/absmach/magistrala)** — a cloud IoT platform framework that provides multi-tenancy, access control, device management, a Rules Engine, Alarms, Reports, and Bootstrap. It integrates with FluxMQ for messaging and serves as a flexible foundation for building IoT solutions.
- **[FluxMQ](https://github.com/absmach/fluxmq)** — the cloud and edge messaging backbone. A versatile, high-performance message broker that runs on edge and cloud, clusters and scales, and supports an event store for internal service synchronization.
- **[S0](https://absmach.eu/s0)** — modular IoT gateway solutions for smart metering, industrial IoT, and edge computing. The S0 module and Base Board deliver multi-protocol connectivity with open-source hardware and professional support.
- **[Propeller](https://github.com/absmach/propeller)** — a cutting-edge orchestrator for WebAssembly workloads across the Cloud-Edge continuum.

---

## Why we're merging

Splitting the platform across two repositories meant:

- **Duplicated maintenance** — every core change needed to be tracked and synced across both repos
- **Developer confusion** — it wasn't always clear which project to use, which to contribute to, or where to file issues
- **Fragmented community** — contributors and users were spread across two separate codebases, issue trackers, and channels
- **Slower releases** — changes that spanned both layers required coordinating two separate release cycles

The separation made sense on paper, but the reality is that SuperMQ and Magistrala have always been one platform. The two never meaningfully diverged in users or use cases, and the overhead of maintaining the split outweighed any architectural benefit.

---

## What this means for you

The unified platform will:

- **Consolidate everything under a single repository** — one codebase, one issue tracker, one release cadence
- **Preserve all existing functionality** — the Rules Engine, Alarms, Reports, Bootstrap, multi-tenancy, and all protocol support stay as-is
- **Keep APIs stable** — existing integrations and deployments will continue to work
- **Simplify onboarding** — one place to start, one set of docs, one community

For most users and operators, the day-to-day experience won't change. For contributors, it will become significantly easier to work on the platform end-to-end.

---

## What's next

We'll be publishing a detailed post soon covering the full technical picture — what's changing in the codebase, how the repository will be structured, and the migration path for any breaking changes.

In the meantime, watch the [GitHub repository](https://github.com/absmach/magistrala), follow our [Matrix community](https://matrix.to/#/#magistrala:matrix.org), and stay tuned.
