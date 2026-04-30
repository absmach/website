---
author:
  name: Steve Munene
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
category: announcement
coverImage: /img/blogs/v0-20-0-release/homepage.png
date: 2026-04-20
description: Release details for Magistrala v0.20.0, including the
  Magistrala and SuperMQ unification, FluxMQ integration, rules engine,
  alarms, reports, and access-control improvements.
ogImage:
  url: /img/blogs/v0-20-0-release/homepage.png
slug: magistrala-v0-20-0
tags:
- Magistrala
- Release
- v0.20.0
- IoT Platform
- FluxMQ
- Rules Engine
- Reports
- Alarms
- Access Control
- Distributed Systems
title: Magistrala v0.20.0 is Here!
featured: true
---

# Magistrala v0.20.0

We are happy to announce the release of **Magistrala v0.20.0**!

Magistrala is an **open-source IoT platform** designed for building secure, scalable, and distributed IoT solutions.
It provides identity management, device connectivity, access control, data processing, and messaging infrastructure for modern IoT deployments.

This release is one of the most important architectural releases in the recent Magistrala roadmap.
With **v0.20.0**, Magistrala and SuperMQ move into a unified platform direction, while rules, alarms, reports, certificate management, provisioning, and message storage become part of a clearer integrated platform.

Over the past release cycle we've focused on bringing the wider Abstract Machines IoT stack into a clearer, more integrated system.
That means better operational workflows, richer automation, stronger authorization behavior, and a cleaner developer experience for running the full stack locally or in production.

This release brings several important improvements - particularly around **platform unification**, **FluxMQ-based messaging**, **certificate management**, and **access-control visibility** across platform services.

---

# Highlights

## Magistrala and SuperMQ Unified

The biggest change in this release is the unification of **Magistrala and SuperMQ** into a single platform direction.
This work landed through **SMQ-3399** in [PR #3400](https://github.com/absmach/magistrala/pull/3400) and brings a large part of the SuperMQ service surface into Magistrala.

The result is a more complete IoT platform framework, where device management, identity, access control, messaging, data processing, and observability live in one coherent codebase.

This unification includes major service and deployment updates such as:

-   FluxMQ integration as the messaging backbone
-   integrated support for alarms, rules engine, reports, certificates, provisioning, and readers
-   updated Docker Compose configuration for the expanded stack
-   refreshed OpenAPI documentation for the expanded service set
-   SDK and CLI support for the integrated service set

For operators and developers, this means fewer boundaries between related projects and a clearer path for deploying a full IoT system from one repository.

---

## FluxMQ Messaging Integration

Magistrala is now built more directly around [**FluxMQ**](https://github.com/absmach/fluxmq), the message broker designed for messaging and event streams.

The v0.20.0 work replaces older messaging paths with FluxMQ-oriented infrastructure and updates internal event handling across the platform.
This gives Magistrala a stronger foundation for:

-   high-throughput message routing
-   event-driven service communication
-   stream-oriented internal workflows
-   scaling messaging and IoT workloads together

This change also makes the relationship between Magistrala and FluxMQ more explicit: FluxMQ provides the messaging backbone, while Magistrala provides the platform services around it.

---

## Certificate Management and Provisioning

Magistrala v0.20.0 merges **Certs** into Magistrala and brings provisioning deeper into the platform.

The merged Certs service adds APIs, storage, SDK support, CLI commands, and OpenBao-backed PKI handling directly inside Magistrala.
Provisioning support was also added with service APIs, configuration handling, Docker Compose wiring, and CLI tooling.

For IoT systems, this matters because onboarding devices securely is often one of the hardest parts of operating the platform.
These additions help Magistrala support more complete device lifecycle workflows, from initial provisioning to secure connectivity.

---

# Access Control and Security Improvements

## Access-Control Listing Improvements

Alarms, rules engine, and reports now support richer access-control listing behavior through [PR #3417](https://github.com/absmach/magistrala/pull/3417).

This means users can list resources while also receiving access-control information that helps clients understand what actions are available.
That is especially useful for UI and API consumers because resource lists can now carry more of the permission context needed to build correct user experiences.

---

## Role Fields for Rules and Reports

Additional role fields were added to rules and reports in [PR #3435](https://github.com/absmach/magistrala/pull/3435).

This improves consistency with the rest of the platform and makes rules and reports easier to manage through SDKs, APIs, and UI workflows.
It also helps keep authorization metadata close to the resources that need it.

---

## PAT Support for Rules and Reports

Personal Access Token support was extended for rules and reports in [PR #3466](https://github.com/absmach/magistrala/pull/3466).

This allows automation and service integrations to work with these platform capabilities using PAT-based authentication.
For operators, this is important because reports and rules are often used by scripts, schedulers, integrations, and internal services rather than only by interactive users.

---

## SuperAdmin Authorization Updates

The SuperAdmin authorization checks were refined in [PR #3394](https://github.com/absmach/magistrala/pull/3394).

These updates improve the way elevated permissions are handled across channels, domains, and users.
The result is clearer authorization behavior for administrative operations and better alignment with the renamed **SuperAdmin** role.

---

## Roles and Actions in Channel Lists

For non-SuperAdmin users, channel listing now returns roles and actions more consistently through **SMQ-416** in [PR #3388](https://github.com/absmach/magistrala/pull/3388).

This improves the API experience for users who need to understand not just which channels they can see, but what they are allowed to do with them.

---

# Fixes and Operational Improvements

## Refresh Token Fixes

Several refresh-token issues were fixed in this release.

These updates improve the reliability of token refresh behavior, including fixes around revoked-token handling and refresh-key lookup.
Authentication flows are now more predictable when sessions expire, refresh, or get revoked.

---

## SQL Performance and Safety

Database query performance and safety were improved through [PR #3378](https://github.com/absmach/magistrala/pull/3378).

This work touched repositories for users, clients, channels, groups, domains, auth, roles, and journal storage.
It adds safer and more consistent SQL behavior while improving query structure across core platform services.

For large IoT deployments, these repository-level improvements matter because listing, filtering, and authorization-aware queries are part of almost every control-plane workflow.

---

## Correct Auth gRPC Errors

The auth gRPC response path now returns more accurate errors through **SMQ-3415** in [PR #3416](https://github.com/absmach/magistrala/pull/3416).

Clearer errors make integrations easier to debug and reduce ambiguity between authentication failures, authorization failures, and internal service errors.

---

## Rules and Reports Member Listing Fixes

Listing members for rules and reports was corrected in [PR #3423](https://github.com/absmach/magistrala/pull/3423).

This improves consistency for access-management workflows around automation and reporting services.

---

# Developer Experience Improvements

## Updated Docker and CI Workflows

The v0.20.0 cycle included multiple updates to Docker and CI:

-   Docker images now use newer Go 1.26.x Alpine images
-   Docker publishing issues were fixed
-   GitHub Container Registry publishing was introduced
-   CI scripts and workflows were refreshed
-   Make and UPX dependencies were removed from the build path

These changes make the build and release process simpler and more reliable for maintainers and contributors.

---

## Repository Rename and Documentation Refresh

The repository and documentation were updated to reflect the Magistrala naming direction.

This includes README updates, service documentation, OpenAPI files, SDK updates, and Docker examples.
The goal is to make the project easier to understand as a single platform instead of a set of loosely connected services.

---

## Topic Delimiter Update

The platform now uses `/` as the topic delimiter through [PR #3424](https://github.com/absmach/magistrala/pull/3424).

This brings topic handling closer to common MQTT-style conventions and makes examples easier to read across rules, routing, and messaging workflows.

---

## Dependency Updates

Routine dependency updates were included across the release cycle, including:

-   Go libraries
-   OpenTelemetry
-   gRPC
-   SpiceDB
-   NATS
-   CoAP
-   Slack
-   PostgreSQL drivers
-   Docker CLI

These updates bring bug fixes, compatibility improvements, and long-term stability improvements.

---

# Magistrala and FluxMQ

Magistrala continues to evolve as the platform layer for building secure, scalable IoT systems.

With v0.20.0, the relationship between Magistrala and FluxMQ becomes clearer:

-   **Magistrala** focuses on device management, identity, access control, provisioning, automation, reporting, and observability
-   **FluxMQ** provides the messaging and event-streaming backbone

Together, they provide a modular foundation for modern IoT platforms and distributed messaging systems.

This release moves the ecosystem forward by making the full stack more integrated, more operationally useful, and easier to deploy.

---

# Upgrading to v0.20.0

Before upgrading, back up the Domains, Rules Engine, Reports, Alarms, Auth, and SpiceDB databases.

v0.20.0 adds new domain admin actions that require a one-time role backfill for existing rules and reports after the services start. Alarms are embedded in rules and do not have separate roles. The migrations run automatically on startup, but the backfill scripts must be run manually once afterwards.

For full step-by-step upgrade instructions, see the [upgrade guide](https://github.com/absmach/magistrala/blob/main/README.md#upgrade-from-v0190-to-v0200).

---

# Contributors

Thanks to everyone who contributed to **Magistrala v0.20.0**:

- Dusan - https://github.com/dborovcanin
- Steve - https://github.com/nyagamunene
- Arvindh - https://github.com/arvindh123
- Ian - https://github.com/ianmuchyri
- Jeff - https://github.com/JeffMboya

As well as everyone else who reviewed, tested, reported issues, and helped move this release forward.

Your work makes Magistrala better with every release.

---

# Leave Your Feedback

We would love to hear your feedback and ideas.

- 🌐 Website: https://magistrala.absmach.eu
- ⚙️ GitHub: https://github.com/absmach/magistrala
- 📘 Documentation: https://magistrala.absmach.eu/docs
