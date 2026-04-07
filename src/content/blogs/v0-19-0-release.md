---
author:
  name: Dusan Borovcanin
  picture: "https://avatars.githubusercontent.com/u/17817225?v=4"
category: announcement
coverImage: /img/blogs/v0-19-0-release/homepage.png
date: 2026-03-06
description: Release details for Magistrala and SuperMQ v0.19.0,
  including security improvements, advanced filtering, and MQTT TLS
  support.
ogImage:
  url: /img/blogs/v0-19-0-release/homepage.png
slug: magistrala-v0-19-0
tags:
- Magistrala
- Release
- v0.19.0
- IoT Platform
- MQTT
- AMQP
- HTTP
- CoAP
- Distributed Systems
title: Magistrala v0.19.0 is Here!
---

# Magistrala v0.19.0

We are happy to announce the release of **Magistrala v0.19.0**!

Magistrala is an **open-source IoT platform** designed for building secure, scalable, and distributed IoT solutions.
It provides identity management, device connectivity, and messaging infrastructure that integrates with protocols such as **MQTT, HTTP, WebSockets, and CoAP**.

Over the past month we've focused on improving **security, filtering capabilities, and developer experience**, while also continuing to refine the architecture that powers Magistrala and the wider messaging ecosystem around it.

This release brings several important improvements - particularly around **authentication security** and **API filtering**, both of which were necessary steps for upcoming platform features and improvements in the Magistrala UI.

---

# Highlights

## Secure MQTT Connectivity with TLS & mTLS

The MQTT adapter (mGate) now supports **TLS and mutual TLS (mTLS) termination**, making it easier to securely connect devices and services to Magistrala.

Security is essential in IoT deployments, especially when devices communicate over public or semi-trusted networks. With TLS support in the adapter itself, operators can now:

-   enable encrypted MQTT communication
-   authenticate devices with client certificates
-   configure TLS behavior entirely via **environment variables**

This simplifies deployments while significantly improving the security posture of IoT infrastructure.

---

## Refresh Token Revocation

This release introduces **refresh-token revocation**, an important security feature for any modern distributed system.

Previously, refresh tokens remained valid until expiration. With token revocation, Magistrala can now explicitly invalidate refresh tokens when necessary.

This enables several important capabilities:

-   **Log out from other devices**
-   **Revoking compromised sessions**
-   **Security response after password changes**
-   **Administrative session management**

In practice, this means that authentication state can now be **actively controlled**, not just passively expired.
This feature lays the groundwork for upcoming improvements such as **session management in the Magistrala UI**.

---

## More Powerful Entity Filtering

Another major improvement in this release is **advanced filtering for entity listing APIs**.

As IoT systems grow, users need better ways to browse and manage devices, users, domains, and groups.
These improvements were primarily driven by the needs of the **Magistrala UI**, which requires flexible querying of entities.

### Filtering by Creation Time

Entities can now be filtered by creation timestamp using:
    - created_from
    - created_to

Example:
```bash
    GET /clients?created_from=2026-01-01
```
This is particularly useful for:

-   UI pagination
-   operational debugging
-   activity auditing
-   filtering recently created resources

---

### Advanced Tag Filtering (AND / OR)

Tag filtering has been extended with logical semantics:

-   `,` represents **OR**
-   `+` represents **AND**

Examples:
```bash
    tag=sensor,device
    tag=sensor+temperature
```
This allows building expressive queries while keeping the API simple.

The feature is supported across multiple entities including:

-   clients
-   channels
-   users
-   groups
-   domains

These improvements make the Magistrala API significantly more **UI-friendly and operationally powerful**.

---

## Personal Access Token (PAT) Architecture Improvements

We also performed an internal refactor of **Personal Access Tokens (PATs)** to align them with Magistrala's evolving authentication architecture.

Changes include:

-   clearer separation between **PAT logic and policy enforcement**
-   simplified authorization flow
-   removal of redundant auth checks

This reduces internal overhead and results in **fewer authorization calls**, improving performance and maintainability.

---

# Fixes and Operational Improvements

## Authorization & Invitations

We fixed several issues in the **invitation flow**, improving reliability when onboarding new users to domains and groups.

Additionally, an unnecessary domain validation check was removed in the authorization path, simplifying the authorization logic.

Also, a lot of internal updates in Magistrala access control handling have been added, such as simplifications of access control for Alarms and Rules Engine.

---

## UI Metadata Support Improvement

Database migrations were updated to properly support **UI metadata storage** across PostgreSQL initialization paths.
This enables the UI to attach richer and cleaner metadata to entities without affecting the core data model.

---

# Developer Experience Improvements

## Improved Build System

The **Makefile** was refactored to improve:

-   architecture-aware builds
-   support for Apple Silicon environments
-   developer workflow consistency

---

## Updated Docker Images

Docker images now use the **latest stable Go version (1.26.0)** instead of a release candidate, improving build stability and security.

---

## Tooling Refresh

We updated internal tooling and regenerated generated assets, including:

-   updated **Protoc dependencies**
-   regenerated generated files

---

## Dependency Updates

Routine dependency updates were included for:

-   Go libraries
-   OpenTelemetry
-   gRPC

These updates bring **bug fixes, security patches, and long-term
stability improvements**.

---

# Magistrala, SuperMQ, and FluxMQ

Magistrala continues to evolve alongside other projects in the **Abstract Machines ecosystem**.

-   **Magistrala** focuses on **device management, identity, and access
    control**
-   **SuperMQ** provides a **high-performance messaging backbone**
-   **FluxMQ** focuses on **large-scale distributed messaging and stream
    processing**

Together, these projects aim to provide a **modular and scalable foundation for modern IoT platforms and distributed messaging systems**.

This release continues to move the ecosystem forward by improving
**security, observability, and usability**.

---

# Contributors

Thanks to everyone who contributed to **Magistrala v0.19.0**:

- Felix — https://github.com/felixgateru
- Arvindh — https://github.com/arvindh123
- Steve — https://github.com/nyagamunene
- Ian — https://github.com/ianmuchyri
- Felister — https://github.com/wambui-pixel
- Nataly — https://github.com/Musilah
- Dusan — https://github.com/dborovcanin

As well as [@sansmoraxz](https://github.com/sansmoraxz), [@bbokun](https://github.com/bbokun), and many others.

Your work makes Magistrala better with every release. ❤️

---

# Leave Your Feedback

We would love to hear your feedback and ideas.

- 🌐 Website: https://magistrala.absmach.eu
- ⚙️ GitHub: https://github.com/absmach/magistrala
- 📘 Documentation: https://magistrala.absmach.eu/docs
