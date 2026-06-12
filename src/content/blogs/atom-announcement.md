---
slug: "atom-announcement"
title: "Atom: Open-Source Identity and Authorization Platform"
description: "Atom is a free and open-source identity and authorization service that collapses entity state and access policies into a single store - one Rust binary, one PostgreSQL database, nothing else to run."
date: "2026-06-12"
author:
  name: "Abstract Machines"
  picture: "https://avatars.githubusercontent.com/u/126989860?s=200&v=4"
coverImage: "/img/blogs/atom-announcement/hero.jpg"
ogImage:
  url: "/img/blogs/atom-announcement/hero.jpg"
tags:
  - atom
  - authorization
  - identity
  - fine-grained access control
  - open-source
  - multi-tenancy
category: announcement
featured: true
---

## Introducing Atom

We've been building [Magistrala](https://www.absmach.eu/products/magistrala) - an open-source IoT platform - for years. As it grew, so did the authorization problem. Devices, users, groups, tenants, services: all of them interrelated, all of them needing fine-grained access control. Our original architecture handled this the way most systems do - entity state in one service, authorization policies in another, connected over events.

It worked, until it didn't.

Event queues backed up under load. Authorization checks returned stale results because the sync hadn't caught up. Listing which resources a user could access required cross-service joins at query time. Onboarding a new tenant meant writing to three systems and hoping they converged. Every incident post-mortem included the phrase "transient sync lag." We had run this in production long enough to understand the real cost.

The realization was uncomfortable: we didn't have a scaling problem. We had a complexity problem that we'd been treating as a scaling problem.

So we rebuilt it.

Meet <a href="https://www.absmach.eu/products/atom">**Atom**</a>.

---

## What Is Atom?

**Atom** is a **free and open-source identity and authorization service** that stores entities and their access policies in the same transactional store.

At its core, Atom is built around five ideas:

- **Unified store** - entity state and permission state are the same state; no sync layer, no event pipeline
- **GraphQL-first API** - all entity, tenant, role, and authorization operations through a single `POST /graphql` endpoint
- **Multi-tenancy as a first-class concern** - tenant isolation enforced at the data layer, not the application layer
- **Relationship-based access control** - permission model built on Actions, Permission Blocks, Roles, and Role Assignments
- **Single binary, minimal infrastructure** - one Rust binary backed by PostgreSQL; no dedicated cache, no message broker, no separate policy engine

Atom is built for production. It is already running as the identity and authorization layer for [Magistrala](https://www.absmach.eu/products/magistrala) and Ultraviolet's [Cube-AI](https://www.ultraviolet.rs/products/cube-ai), a sovereign AI platform. v0.1.0 is a hardened release, not an experiment.

---

## Key Characteristics

### Unified Identity and Authorization Store

Atom stores entities - humans, devices, services, workloads, applications - alongside their relationships and access policies in a single PostgreSQL database. When an entity is created, its identity record and its access control entries are written in the same transaction. When it's deprovisioned, both are removed together.

There is no window where a device is registered but its authorization record hasn't propagated. The consistency gap doesn't exist because there's only one store.

### GraphQL-First API

Everything in Atom - tenants, entities, groups, roles, permission blocks, authorization checks - is available through the GraphQL API at `POST /graphql`. REST endpoints are intentionally limited to authentication, health, and custom API execution.

```graphql
mutation {
  authzCheck(
    input: {
      subjectId: "device-entity-id"
      action: "publish"
      resourceId: "channel-resource-id"
    }
  ) {
    allowed
    reason
  }
}
```

### Role-Based and Fine-Grained Access Control

The permission model uses Actions, Permission Blocks, Roles, and Role Assignments. A Permission Block defines scope, actions, effect, and optional ABAC conditions. A Role bundles Permission Blocks. A Role Assignment gives a role to an entity or Principal Group.

For advanced cases, Direct Policies attach a Permission Block directly to a subject without going through a role. Principal Groups are who-containers; Object Groups are where-containers. The model is expressive without requiring custom policy language.

### Full Management UI

The optional Next UI runs at `:3005` and ships with workflows for tenants, entities, groups, roles, policies, audit, and authorization debugging. The **API Endpoint Builder** lets you define custom HTTP routes under `/api/custom/*` backed by inline GraphQL operations - useful for exposing Atom operations through domain-specific REST paths without writing a wrapper service. The **GraphQL playground** includes schema introspection, starter operations, and copyable curl/fetch snippets.

### Single Binary, Minimal Infrastructure

Atom ships as a single Rust binary. The only required dependency is PostgreSQL. No Kafka, no Redis, no sidecar sync process. Migrations apply automatically on startup.

```bash
docker compose up postgres -d
docker compose --profile atom-ui up -d --build
# API: http://localhost:8080
# UI:  http://localhost:3005
```

---

## Who Is Atom For?

Atom is a good fit if you are:

- Building **multi-service backends** where entities across services need consistent, fine-grained access control
- Operating **multi-tenant platforms** where tenant isolation must be enforced at the data layer
- Running **IoT platforms, AI infrastructure, or SaaS products** where entity relationships drive authorization decisions
- Looking for a system where "who has access to what" has a single, auditable source of truth

Atom may **not** be the right fit if your access control requirements are simple role-based permissions with no entity relationship graph, or if you only need authentication without fine-grained authorization - a simpler solution may be sufficient.

---

## Why Build Another Authorization Service?

Building identity and authorization infrastructure is not something you do because it's interesting. It is critical, unglamorous infrastructure that has to be correct at all times.

So why build another one?

Because the split model - identity in one service, authorization in another - creates a class of bugs that cannot be fixed by tightening the event pipeline. You can add retries, idempotency keys, dead-letter queues, and reconciliation jobs. You will still have windows of inconsistency. The consistency problem is structural, not operational.

We needed:

- Entity state and permission state managed in the same transaction
- A permission model expressive enough for hierarchical multi-tenant systems with fine-grained resource access
- A system we could deploy alongside PostgreSQL without additional infrastructure
- Authorization checks that return deterministic, inspectable results

Existing Zanzibar-style systems solve the consistency problem but require specialized storage tiers, watch APIs, and version-stamped reads. The operational cost of running that infrastructure exceeded the cost of the problem we were solving. Atom takes the core insight from Zanzibar - relationship-based access control - and builds it on PostgreSQL, which most teams already operate.

### Why Choose Atom?

Most teams accumulate separate services for identity management, authorization policy evaluation, and group membership. Each adds operational surface area, integration overhead, and another system to keep in sync.

Atom consolidates this into one service, one data store, one API.

**The result:**

- No sync layer to operate or monitor
- Permission checks that are consistent by construction, not by eventual convergence
- Listing operations that are single indexed queries, not cross-service joins
- One audit trail for identity and authorization events

If your architecture requires that authorization decisions reflect the current state of your entity graph at all times, Atom is built for that.

---

## Get Involved

Atom v0.1.0 is available today. The codebase is open source under the Apache-2.0 license.

- 🌐 **Website:** https://www.absmach.eu/products/atom
- ⚙️ **GitHub:** https://github.com/absmach/atom
- 📘 **Documentation:** https://www.absmach.eu/docs/atom

Issues, feedback, and contributions are open. If you're evaluating Atom for a production deployment, we'd like to hear what you're building.

---

## What's Next?

This release marks the beginning. Upcoming posts will cover:

- Getting started: deploying Atom and building your first authorization model
- The engineering story: how we replaced a distributed auth system with a single binary
- How Atom compares to Keycloak, OpenFGA, SpiceDB, and Permify

The near-term roadmap includes reducing heavy database read patterns, read replica support for horizontal read scale, a caching layer for hot authorization paths, and an independent security audit. The foundation is stable; performance work comes next.

Questions, feedback, and contributions are welcome. Let's build this together. 🚀
