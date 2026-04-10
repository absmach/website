---
slug: certs-vault-openbao-migration
title: "Certs Service Migration: From Vault to OpenBao"
description: "The certs service was migrated from HashiCorp Vault to OpenBao after the Vault license change. Here is what changed, what stayed compatible, and how to migrate safely."
date: "2026-04-09"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/certs-openbao-migration/cover.jpg"
featured: true
ogImage:
  url: "/img/blogs/certs-openbao-migration/cover.jpg"
tags:
  - Magistrala
  - SuperMQ
  - Certs
  - OpenBao
  - Vault
  - PKI
  - Migration
category: announcement
---

**The certs service was moved from Vault to OpenBao.** This change kept our PKI workflows open and sustainable after the Vault license transition. In this post, we explain why we made the move, what changed in the implementation, what remained compatible, and how to get started.
 
---
 
## Table of Contents
 
- [Table of Contents](#table-of-contents)
- [Why we made this change](#why-we-made-this-change)
- [What changed in certs](#what-changed-in-certs)
	- [PKI backend](#pki-backend)
	- [Certificate authority hierarchy](#certificate-authority-hierarchy)
	- [Service behavior](#service-behavior)
	- [Configuration surface](#configuration-surface)
	- [Operations and observability](#operations-and-observability)
- [What stayed the same](#what-stayed-the-same)
- [Getting started](#getting-started)
- [Known differences to account for](#known-differences-to-account-for)
- [What is next](#what-is-next)
 
---
 
## Why we made this change
 
The certs service historically integrated with Vault for PKI operations. After Vault's license change, we moved it to OpenBao.
 
This was not a cosmetic rename. It was a strategic decision that kept the certificate lifecycle stack aligned with open-source licensing and long-term maintainability goals:
 
- **Open governance and licensing clarity.** OpenBao is community-driven and aligned with our open platform direction.
- **Operational continuity.** OpenBao preserved the core PKI workflows we depended on.
- **Future-proofing.** We could keep evolving certs without introducing licensing uncertainty into critical security infrastructure.
 
The result was a backend migration that preserved the user-facing experience while making the foundation healthier for long-term operation.
 
---
 
## What changed in certs
 
### PKI backend
 
The certs service moved to an OpenBao-backed PKI agent instead of the previous Vault-backed implementation.
 
Core certificate lifecycle operations continued to be delegated to the PKI engine:
 
- issue certificates
- sign CSRs
- view certificates
- list certificates
- revoke certificates
- generate CRL
- serve OCSP responses
- retrieve CA chain
 
Under the hood, the service authenticated to OpenBao using AppRole and maintained renewable credentials in the background.
 
### Certificate authority hierarchy
 
The migration introduced a two-tier CA hierarchy: a **root CA** and a signed **intermediate CA**, each mounted separately in OpenBao.
 
On first setup, the root CA is generated at the `pki` mount and used exclusively to sign the intermediate CA's CSR. The intermediate CA lives at `pki_int` and is the only authority that issues leaf certificates to devices and services. The root CA has no direct role in day-to-day issuance.
 
This separation brings practical operational benefits:
 
- the root CA key is insulated from routine certificate operations
- the intermediate CA can be rotated or reissued without disturbing the root trust anchor already distributed to clients
- CRL and OCSP endpoints are scoped per mount, so revocation checks remain accurate at each level of the chain
 
All cert issuance, signing, revocation, and CRL/OCSP operations that the service exposes go through `pki_int`. The `pki` mount is only accessible for reading the root CA and CRL, and for signing new intermediates when rotation is needed.
 
### Service behavior
 
From an API perspective, cert lifecycle behavior remained consistent, but the newer certs service also consolidated certificate management responsibilities and integrated more tightly with platform middleware.
 
Operationally relevant behavior included:
 
- managed token/session renewal for PKI backend connectivity
- robust error propagation from PKI operations to transport layer responses
- certificate metadata mapping between PKI responses and service/domain models
- continued support for CSR-based issuance and internal issuance flows
 
### Configuration surface
 
The deployment surface moved from Vault-specific configuration to OpenBao-specific configuration.
 
That meant OpenBao environment variables and settings in service configuration: host, namespace, AppRole credentials, mount paths, roles, and service token usage for secret rotation.
 
### Operations and observability
 
The service remained fully instrumented with logging, metrics, and tracing around cert issuance, renewal, revocation, and listing flows.
 
That meant teams could migrate PKI backends without losing observability coverage in production.
 
---
 
## What stayed the same
 
**Client-facing cert APIs remained stable.** Existing API consumers did not need to redesign integration logic simply because the PKI backend changed.
 
**Certificate lifecycle intent remained unchanged.** You could still issue, list, view, renew, revoke, validate through OCSP, and retrieve CRL/CA artifacts in the same domain context.
 
**Platform integration remained intact.** Authorization, middleware, transport patterns, and service boundaries were preserved.
 
**Security posture was preserved.** The migration kept the same trust model: PKI authority stayed in the backend engine, while the certs service orchestrated issuance and lifecycle operations.
 
---
 
## Getting started
 
The certs service is part of Magistrala. Full usage examples and CLI reference are available in the [Magistrala certs documentation](https://magistrala.absmach.eu/docs/dev-guide/certs/).
 
Here is a quick reference for the core certificate operations using the Magistrala CLI.
 
**Issue a certificate**
 
```
magistrala-cli certs issue <client_id> <user_auth_token> [--ttl=8760h]
```
 
**Retrieve a certificate**
 
```
magistrala-cli certs get [<cert_serial> | client <client_id>] <user_auth_token>
```
 
**Revoke a certificate**
 
```
magistrala-cli certs revoke <client_id> <user_auth_token>
```
 
All certificate operations are backed by the `pki_int` mount. The OpenBao environment variables required to connect the certs service are covered in the Magistrala docs alongside a full example deployment.
 
---
 
## Known differences to account for
 
Even with high compatibility, the backend transition introduces some practical differences worth knowing:
 
- token renewal and secret rotation workflows differ operationally from Vault
- default mount naming and path conventions may vary by deployment
- the two-tier CA hierarchy means chain validation involves both the root (`pki`) and intermediate (`pki_int`) mounts; clients that validate the CA chain should expect the full chain to be returned on issuance
- error text and edge-case behavior can vary between implementations
 
---
 
## What is next
 
Moving to OpenBao kept certs aligned with an open and community-driven PKI stack. It also simplified long-term maintenance across Magistrala deployments that relied on cert lifecycle automation.
 
From there, work continued on hardening PKI operations, improving migration tooling, and documenting deployment patterns for different environments.
 
If you run into migration issues or edge cases, open an issue in the repository and share your deployment context so we can help quickly.
 