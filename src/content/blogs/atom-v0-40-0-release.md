---
title: "Atom v0.40.0: Scoped Access Tokens, Soft-Delete, and Production Hardening"
description: "Atom v0.40.0 adds self-service scoped access tokens, soft-delete and restore for entities and tenants, gRPC AuthN with TLS, and audit and telemetry improvements."
date: "2026-07-01"
author:
  name: "Abstract Machines"
  picture: "https://avatars.githubusercontent.com/u/126989860?s=200&v=4"
coverImage: "/img/blogs/atom-v0-40-0-release/hero.jpg"
ogImage:
  url: "/img/blogs/atom-v0-40-0-release/hero.jpg"
slug: "atom-v0-40-0-release"
tags:
  - atom
  - release
  - identity
  - authorization
  - open-source
category: announcement
featured: false
---

## Atom v0.40.0

Atom jumps from v0.1.0 to v0.40.0, aligning with the version line of [Magistrala v0.40.0](/blog/magistrala-x-atom-release/), which now ships Atom as its built-in identity and authorization layer. This release is about hardening the foundation laid at launch: tightening the credential model, closing entity lifecycle gaps, and adding the observability a production deployment needs.

---

## What's New

**Scoped access tokens.** A single `createAccessToken` mutation replaces the old `createApiKey` surface. By default it mints a least-privilege token scoped to a permission ceiling; passing `scoped: false` mints an unscoped API key carrying the owner's full live grants instead. Any entity can now self-issue a narrow token for CLI or automation use without asking an operator for a broad key.

**Soft-delete and restore.** Deleting a tenant, entity, group, resource, or role no longer removes it outright. Atom stamps `deleted_at`/`deleted_by`, hides the row from reads and authorization checks, and revokes credentials and sessions for deleted entities and tenants. An admin-only restore path and a background purge job (`ATOM_PURGE_ENABLED`, 90-day retention by default) handle recovery and eventual cleanup.

**gRPC AuthN and TLS.** A new gRPC service handles authentication checks alongside the existing authorization channel, and gRPC transport can now run over TLS.

**Audit logging improvements.** Audit coverage was corrected and extended across login, logout, credential, and authorization events, with an option to exclude high-frequency events from the log by default.

**Telemetry.** Atom now exports metrics for monitoring request latency and system health in production.

**Human-readable aliases.** Tenants, entities, and resources can carry an `alias` alongside their UUID — reusable after soft delete — useful for referencing objects in logs, dashboards, and API calls without looking up IDs first.

**Tenant and group refinements.** Tenant members can now be assigned roles directly, tenant listings support filtering, and authorized-object listing now accounts for group membership.

---

## Get It

Atom v0.40.0 is available now under Apache-2.0.

- 🌐 Website: https://www.absmach.eu/products/atom
- ⚙️ GitHub: https://github.com/absmach/atom/releases/tag/v0.40.0
- 📘 Documentation: https://www.absmach.eu/docs/atom

Issues, feedback, and contributions are welcome.
