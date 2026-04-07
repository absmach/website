---
slug: supermq-magistrala-unified
title: "SuperMQ and Magistrala Are Becoming One Platform"
description: "SuperMQ and Magistrala are now a single unified platform under the Magistrala name. Here's the full story — why we split, what changed, why we are merging back, and what you need to do."
date: "2026-04-07"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/supermq-magistrala-merge/cover.jpg"
featured: true
ogImage:
  url: "/img/blogs/supermq-magistrala-merge/cover.jpg"
tags:
  - Magistrala
  - SuperMQ
  - IoT Platform
  - Open Source
  - Architecture
  - Migration
category: announcement
---

**SuperMQ and Magistrala are now one.** The SuperMQ repository has been merged into Magistrala, the name is Magistrala, and a new version marks the unification. This post covers the full story: what we built, why we split it, what exactly changed, and why we are merging back.

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [How we got here](#how-we-got-here)
- [Why the split didn’t hold up](#why-the-split-didnt-hold-up)
- [What changed](#what-changed)
  - [Repository](#repository)
  - [Codebase](#codebase)
  - [Version](#version)
  - [Documentation](#documentation)
  - [Community](#community)
- [What stayed the same](#what-stayed-the-same)
- [Migration guide](#migration-guide)
  - [If you were using Magistrala](#if-you-were-using-magistrala)
  - [If you were using SuperMQ standalone](#if-you-were-using-supermq-standalone)
- [What's next](#whats-next)

---

## How we got here

Magistrala began as a single open-source IoT platform — one repository, one set of docs, one community. It provided everything needed to build IoT solutions: device connectivity across HTTP, MQTT, WebSocket, and CoAP; multi-tenancy via Domains; fine-grained access control with RBAC and ABAC; a Rules Engine; Alarms; Reports; Bootstrap; and more.

Over time, as the platform matured, we identified a natural internal division: a general-purpose messaging and event-driven core (protocol bridging, authentication, channel routing, multi-tenancy primitives) and an IoT application layer on top (Rules Engine, Alarms, Reports, Bootstrap, UI). The core felt like something that could stand on its own — useful beyond IoT, applicable to any event-driven system.

So we extracted it into a separate project: **SuperMQ**.

The theory was sound. A clean interface between the two layers. Independent versioning. SuperMQ as a general-purpose platform, Magistrala as an opinionated IoT product built on top.

With the merger, the Abstract Machines stack is now clearly defined across four focused projects:

- **[Magistrala](https://github.com/absmach/magistrala)** — a cloud IoT platform framework that provides multi-tenancy, access control, device management, a Rules Engine, Alarms, Reports, and Bootstrap. It integrates with FluxMQ for messaging and serves as a flexible foundation for building IoT solutions.
- **[FluxMQ](https://github.com/absmach/fluxmq)** — the cloud and edge messaging backbone. A versatile, high-performance message broker that runs on edge and cloud, clusters and scales, and supports an event store for internal service synchronization.
- **[S0](https://absmach.eu/s0)** — modular IoT gateway solutions for smart metering, industrial IoT, and edge computing. The S0 module and Base Board deliver multi-protocol connectivity with open-source hardware and professional support.
- **[Propeller](https://github.com/absmach/propeller)** — a cutting-edge orchestrator for WebAssembly workloads across the Cloud-Edge continuum.

---

## Why the split didn’t hold up

The separation created friction at every level:

**Duplicated maintenance.** Any change that touched the core — authentication, domain management, policy enforcement — required coordinating two separate pull requests, two CI pipelines, two changelogs, and two releases. Simple improvements became two-step process.

**Developer confusion.** Contributors didn't know which repo to engage with. Issues filed in the wrong place, PRs that needed to span both repos, and no clear answer to the question: "where does this belong?"

**User confusion.** The most common question we received: "Should I use SuperMQ or Magistrala?" The answer was almost always Magistrala — but the existence of SuperMQ as a separate, equally prominent project made that unclear. Users spent time evaluating a choice that wasn't really a choice.

**Fragmented ecosystem.** Two GitHub repositories, two documentation sites, two release cycles. A contributor fixing a bug or adding a feature had to understand the boundary between the projects before they could even start.

**The two projects never actually diverged.** SuperMQ's user base was almost entirely Magistrala users and contributors. SuperMQ as a platform was too tightly coupled with Magistrala to make sense as a standalone solution. The separation had real costs but no meaningful benefit.

The split was an architectural experiment that made sense on a whiteboard. The reality of maintaining and growing an open-source project across two repositories proved it was not worth it.

---

## What changed

### Repository

`github.com/absmach/supermq` is left for history reasons, but it points to `github.com/absmach/magistrala`. The SuperMQ repository has been archived — all the code and opened issues are moved to `github.com/absmach/magistrala`.

There is one canonical repository. Issues, pull requests, discussions, and contributions all happen there.

### Codebase

The SuperMQ core has been fully renamed to Magistrala throughout the codebase. There is no longer a conceptual "SuperMQ layer" and "Magistrala layer" — it is one unified codebase.

Go module paths, package names, and internal naming all reflect `magistrala`.

### Version

A new version `v0.20.0` will mark the first release after the merger. This is the release that brings everything together under the Magistrala name. Check the [releases page](https://github.com/absmach/magistrala/releases) for the current version.

### Documentation

`docs.supermq.absmach.eu` redirects to `magistrala.absmach.eu/docs`. There is one documentation site going forward.

### Community

The Matrix community retains its name. Use [#magistrala:matrix.org](https://matrix.to/#/#magistrala:matrix.org) for all platform questions and discussions.

---

## What stayed the same

**All APIs are unchanged.** The REST APIs, messaging APIs, and protocol adapters are identical. No API changes were made as part of this merge. If you have existing integrations, they continue to work.

**All features are intact.** The full Magistrala feature set — Rules Engine, Alarms, Reports, Bootstrap, multi-tenancy, Domains, RBAC/ABAC, protocol support (HTTP, MQTT, WebSocket, CoAP), instrumentation — is present and unchanged.

**Deployment is unchanged.** Docker Compose and Kubernetes deployments work the same way. Environment variables and configuration structure are unchanged.

**Data is unchanged.** Existing databases and stored data require no migration.

---

## Migration guide

For most users, the only action required is updating where you point things.

### If you were using Magistrala

Nothing changes functionally. Update any bookmarked documentation links to `magistrala.absmach.eu/docs`.

### If you were using SuperMQ standalone

SuperMQ's capabilities are fully present in Magistrala. Migrate to `github.com/absmach/magistrala` — all APIs you relied on are available and unchanged.

**Repository references**

| Before                       | After                           |
| ---------------------------- | ------------------------------- |
| `github.com/absmach/supermq` | `github.com/absmach/magistrala` |
| `docs.supermq.absmach.eu`    | `magistrala.absmach.eu/docs`    |

**Docker images**

Update any references from SuperMQ Docker images to Magistrala equivalents. Check the [releases page](https://github.com/absmach/magistrala/releases) for the current image tags.

---

## What's next

The merge cleans up the overhead that was slowing everything down. With one repository, one issue tracker, one release cycle, and one community, the team can move faster and contributors can engage more easily.

The roadmap is unified. Features, fixes, and improvements that previously required coordination across two projects now happen in one place.

Follow the [GitHub repository](https://github.com/absmach/magistrala), join the [Matrix community](https://matrix.to/#/#magistrala:matrix.org), and read the [docs](https://docs.magistrala.absmach.eu/) to stay up to date.

If you have questions about migrating or run into anything unexpected, open an issue or reach out on Matrix.
