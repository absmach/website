---
title: "Atom v0.50.0: Runtime-Configurable Email Templates and External Event Publishing"
description: "Atom v0.50.0 adds runtime-configurable email templates, optional event publishing to an external broker, updated access tokens, and hardened certificate parameters."
date: "2026-08-01"
author:
  name: "Abstract Machines"
  picture: "https://avatars.githubusercontent.com/u/126989860?s=200&v=4"
coverImage: "/img/blogs/atom-v0-50-0-release/hero.png"
ogImage:
  url: "/img/blogs/atom-v0-50-0-release/hero.png"
slug: "atom-v0-50-0-release"
tags:
  - atom
  - release
  - identity
  - authorization
category: announcement
featured: false
---

## Atom v0.50.0

Atom v0.50.0 rounds out its access-token model and opens up new integration points for email and eventing, alongside certificate and membership fixes.

---

## What's New

**Runtime-configurable email templates.** Email templates can now be configured at runtime instead of being fixed at build time, so operators can customize verification, invite, and notification emails without rebuilding Atom.

**Optional event publishing to an external broker.** Atom can now optionally publish its events to an external message broker — pairing with [FluxMQ's new isolated AMQP principals for Atom](/blog/fluxmq-v0-50-0-release/) to keep audit and event traffic on its own dedicated channel.

**Access token updates.** The access token model received further updates, building on the scoped-token work introduced in [v0.40.0](/blog/atom-v0-40-0-release/).

**Automatic membership registration.** Authenticated users are now automatically registered as members of an entity during authentication and creation, removing a manual step from onboarding flows.

**Certificate hardening.** Certificate parameters now include `KeyEncipherment` and `ServerAuth` key usages, aligning issued certificates more closely with standard TLS server requirements.

**Documentation.** A new Atom Next user-guide was added, covering day-to-day usage of the platform.

---

## Get It

Atom v0.50.0 is available now under Apache-2.0.

- 🌐 Website: https://www.absmach.eu/products/atom
- ⚙️ GitHub: https://github.com/absmach/atom/releases/tag/v0.50.0
- 📘 Documentation: https://www.absmach.eu/docs/atom

Issues, feedback, and contributions are welcome.
