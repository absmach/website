---
title: "FluxMQ v0.50.0: Cluster Reliability Fixes, Event Hooks, and Atom Integration"
description: "FluxMQ v0.50.0 fixes etcd watch gaps and session-lease recovery for clustering, adds event hooks, deterministic retained-message matching, and isolated AMQP principals for Atom."
date: "2026-08-01"
author:
  name: "Abstract Machines"
  picture: "https://avatars.githubusercontent.com/u/126989860?s=200&v=4"
coverImage: "/img/blogs/fluxmq-v0-50-0-release/hero.png"
ogImage:
  url: "/img/blogs/fluxmq-v0-50-0-release/hero.png"
slug: "fluxmq-v0-50-0-release"
tags:
  - fluxmq
  - release
  - mqtt
  - clustering
  - message-broker
category: announcement
featured: false
---

## FluxMQ v0.50.0

FluxMQ v0.50.0 is out, focused on clustering reliability and broker hardening, alongside new extensibility and integration points.

---

## What's New

**Event hooks.** FluxMQ now supports hooks, letting external systems react to broker events without modifying the broker itself.

**Cluster reliability fixes.** Two clustering bugs are fixed: nodes now recover their session lease and re-register ownership keys after an expiry instead of losing state, and a gap in etcd watch handling that could silently drop cluster state is closed.

**Deterministic retained-message matching.** Retained message matching is now deterministic and complete, so subscribers reliably get the retained messages they should for a given topic filter.

**Atom integration for audit publishing.** FluxMQ adds isolated AMQP local principals scoped specifically to [Atom's](/blog/atom-v0-50-0-release/) audit publishing, keeping audit event traffic separated from other broker traffic.

**Broker hardening.** Local-principal capability is now derived from a client's roles rather than its listener, and a new badger close guard prevents issues during shutdown.

---

## Get It

FluxMQ v0.50.0 is available now.

- 🌐 Website: https://www.absmach.eu/products/fluxmq
- ⚙️ GitHub: https://github.com/absmach/fluxmq/releases/tag/v0.50.0
- 📘 Documentation: https://www.absmach.eu/docs/fluxmq

Issues, feedback, and contributions are welcome.
