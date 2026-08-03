---
title: "Magistrala v0.50.0: Messaging Hooks, Rules Engine Loop Prevention, and API Hardening"
description: "Magistrala v0.50.0 adds messaging hooks endpoints, a multi-publisher filter for readers, Rules Engine loop prevention, and gRPC authentication hardening."
date: "2026-08-01"
author:
  name: "Abstract Machines"
  picture: "https://avatars.githubusercontent.com/u/126989860?s=200&v=4"
coverImage: "/img/blogs/magistrala-v0-50-0-release/hero.png"
ogImage:
  url: "/img/blogs/magistrala-v0-50-0-release/hero.png"
slug: "magistrala-v0-50-0-release"
tags:
  - magistrala
  - release
  - iot-platform
  - rules-engine
  - messaging
category: announcement
featured: false
---

## Magistrala v0.50.0

Magistrala v0.50.0 is out. It builds on the [Community Edition / Enterprise Edition split](/blog/magistrala-community-edition-enterprise-edition/) from the last cycle, with this release focused on messaging extensibility, Rules Engine safety, and tightening the authentication surface.

---

## What's New

**Messaging hooks endpoints.** Magistrala now exposes endpoints for registering messaging hooks, letting external systems tie into the message pipeline without embedding custom logic in the core services.

**Multi-publisher filter for readers.** The readers service's `PageMetadata` now supports filtering by multiple publishers at once, so querying stored messages from a specific set of devices no longer requires stitching together several calls.

**Rules Engine loop prevention.** A new safeguard detects and blocks rule chains that would otherwise trigger each other in an infinite loop, protecting the Rules Engine from runaway execution.

**gRPC hardening.** Empty usernames and passwords are now rejected early in the gRPC authentication path, closing off malformed-credential edge cases before they reach deeper service logic.

**Alarms fixes.** Alarm role handling was corrected and a set of unwanted alarm operations were removed, tightening the Alarms service's permission surface (now part of the Enterprise Edition).

**PDF generator memory limit.** Report generation now runs with a capped memory budget, preventing large reports from consuming unbounded memory.

---

## Get It

Magistrala v0.50.0 is available now.

- 🌐 Website: https://www.absmach.eu/products/magistrala
- ⚙️ GitHub: https://github.com/absmach/magistrala/releases/tag/v0.50.0
- 📘 Documentation: https://www.absmach.eu/docs/magistrala

Issues, feedback, and contributions are welcome.
