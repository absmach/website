---
slug: supermq-magistrala-merge-announcement
title: "SuperMQ and Magistrala Are Becoming One"
description: "We're merging SuperMQ and Magistrala back into a single unified platform. Here's what's changing and what it means for you."
date: "2026-03-24"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/supermq-magistrala-announcement-merge/cover.jpg"
ogImage:
  url: "/img/blogs/supermq-magistrala-announcement-merge/cover.jpg"
tags:
  - Magistrala
  - SuperMQ
  - Announcement
  - IoT Platform
  - Open Source
category: announcement
---

We have an important update to share: **SuperMQ and Magistrala are merging back into a single unified platform.**

This isn't just a technical decision — it's the result of lessons learned from splitting the platform in the first place. Here's the full story.

---

## Why we split: The original vision

[Magistrala](https://github.com/absmach/magistrala) began as a comprehensive, full-stack open-source IoT platform. It handled everything from device connectivity and messaging to multi-tenancy, access control, channels, clients,  groups, the Rules Engine, Alarms, Reports, and device Bootstrap.

As the platform matured, we saw an opportunity to extract its messaging and event-driven core into something more general-purpose — a foundation that could support not just IoT workloads, but any event-driven application architecture.

So we created [SuperMQ](https://github.com/absmach/supermq).

---

## The intended architecture

The split was designed around a clean separation of concerns:

**SuperMQ** would be the general-purpose, event-driven messaging core:
- Device and user management (clients, channels, users, groups, domains)
- Multi-protocol connectivity (MQTT, HTTP, CoAP, WebSocket)
- Multi-tenancy and domain isolation
- Policy-based access control (RBAC/ABAC via SpiceDB)
- Event streams and internal message routing

**Magistrala** would sit on top as the IoT application layer:
- Rules Engine for real-time data processing
- Alarms for threshold monitoring and alerts
- Reports for data aggregation and analytics
- Bootstrap for device provisioning and configuration
- IoT-specific workflows and business logic

SuperMQ would provide the infrastructure. Magistrala would provide the intelligence.

In theory, this made perfect sense — a reusable core with IoT capabilities layered on top.

![Before and After Architecture](/img/blogs/supermq-magistrala-announcement-merge/before-after.svg)

---

## What went wrong: The reality of the split

In practice, the split created more problems than it solved:

**1. Duplicated maintenance overhead**
Every change to the core infrastructure had to be tracked, tested, and synchronized across both repositories. Bug fixes, security patches, and dependency updates needed coordination between the two projects.

**2. Developer and user confusion**
New users couldn't easily tell which project to use. Contributors didn't know where to file issues or submit pull requests. Documentation was split between two repos, making it harder to understand the full platform.

**3. Fragmented community**
Our contributors and users were divided across two codebases, two issue trackers, and separate communication channels. This diluted community effort and made it harder to build momentum.

**4. Release coordination complexity**
Any feature that spanned both layers required coordinating two separate release cycles. This slowed down shipping improvements and made versioning unnecessarily complex.

**5. The platforms never diverged**
SuperMQ never attracted meaningful adoption outside of Magistrala. The two never meaningfully diverged in users, use cases, or direction. The split created architectural purity on paper but operational friction in reality.

The core insight: **SuperMQ and Magistrala have always been one platform.** The separation was artificial, and maintaining it cost more than the architectural benefit it provided.

---

## Introducing FluxMQ: The real messaging layer

While we were maintaining the SuperMQ/Magistrala split, we also realized that message brokering itself deserved dedicated focus.

**[FluxMQ](https://github.com/absmach/fluxmq)** emerged as the true messaging backbone — a high-performance, versatile message broker designed for both cloud and edge deployments.

**What FluxMQ provides:**
- **Multi-protocol support** — MQTT, MQTT-SN, CoAP, WebSocket, HTTP
- **Edge and cloud deployment** — runs efficiently on resource-constrained devices and scales in the cloud
- **Clustering and high availability** — distributed architecture with built-in replication
- **Event store integration** — built-in event sourcing for service synchronization and state management
- **Modular and embeddable** — can be used standalone or integrated into larger systems

FluxMQ handles the low-level messaging infrastructure, while Magistrala provides the IoT platform framework on top. This is the clean separation that actually works.

---

## The new unified stack

With the merger complete, the Abstract Machines stack is now clearly defined across **four focused projects**:

### 1. [Magistrala](https://github.com/absmach/magistrala) — Cloud IoT Platform Framework
The unified platform that combines infrastructure and intelligence:
- **Multi-tenancy** — Domain-based tenant isolation with complete data separation
- **Access control** — Policy-based RBAC/ABAC via SpiceDB
- **Device management** — Clients, groups, channels, and multi-protocol connectivity
- **Rules Engine** — Real-time data processing and event-driven automation
- **Alarms** — Threshold monitoring and alerting
- **Reports** — Data aggregation and analytics
- **Bootstrap** — Device provisioning and configuration
- **FluxMQ integration** — Uses FluxMQ as its messaging backbone

Magistrala is the complete IoT platform framework — infrastructure and application layer combined.

### 2. [FluxMQ](https://github.com/absmach/fluxmq) — Messaging Backbone
The versatile, high-performance message broker for cloud and edge:
- **Multi-protocol** — MQTT, MQTT-SN, CoAP, WebSocket, HTTP
- **Cloud and edge** — Runs on constrained devices and scales in the cloud
- **Clustering** — Distributed architecture with replication
- **Event store** — Built-in event sourcing for state management
- **Standalone or embedded** — Use independently or integrate into your system

FluxMQ handles messaging. Magistrala (and other systems) build on top of it.

### 3. [S0](https://absmach.eu/s0) — IoT Gateway Hardware
Modular, open-source IoT gateway solutions:
- **Smart metering** — Energy monitoring and consumption tracking
- **Industrial IoT** — Multi-protocol connectivity for industrial systems
- **Edge computing** — Local processing and data aggregation
- **Open hardware** — Professionally supported, production-ready designs

The S0 module and Base Board deliver connectivity at the edge.

### 4. [Propeller](https://github.com/absmach/propeller) — WebAssembly Orchestrator
Next-generation orchestration for distributed workloads:
- **WebAssembly-native** — Run Wasm workloads across cloud and edge
- **Cloud-Edge continuum** — Deploy and manage from datacenter to device
- **Lightweight and secure** — Minimal overhead with sandboxed execution
- **Device to cloud** — Unified orchestration across the entire stack

Propeller brings modern workload orchestration to IoT and edge computing.

---

**Together, these four projects form a complete, modular stack**: from hardware connectivity (S0) through messaging (FluxMQ) and platform services (Magistrala) to workload orchestration (Propeller).

![Abstract Machines Stack Architecture](/img/blogs/supermq-magistrala-announcement-merge/architecture.png)

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
