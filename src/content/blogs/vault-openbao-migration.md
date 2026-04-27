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

The certs service now runs on OpenBao instead of Vault. Here is what changed, what stayed the same, and what you need to do if you are migrating.
 
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
 
The certs service historically integrated with Vault for PKI operations. After HashiCorp relicensed Vault from MPL 2.0 to BUSL 1.1 in August 2023, we moved it to OpenBao, a community fork of Vault that kept the original MPL 2.0 license.

The PKI backend, CA hierarchy, authentication flow, and configuration surface all changed. What did not change was the API your code calls.
 
---
 
## What changed in certs
 
### PKI backend
 
The PKI engine still handles:
 
- issue certificates
- sign CSRs
- view certificates
- list certificates
- revoke certificates
- generate CRL
- serve OCSP responses
- retrieve CA chain
 
The service authenticates to OpenBao using AppRole and keeps its token renewed in the background.
 
### Certificate authority hierarchy
 
We use a two-tier CA hierarchy: a **root CA** and a signed **intermediate CA**, each mounted separately in OpenBao.
 
On first setup, the root CA is generated at the `pki` mount and used exclusively to sign the intermediate CA's CSR. The intermediate CA lives at `pki_int` and is the only authority that issues leaf certificates to devices and services. The root CA has no direct role in day-to-day issuance.
 
Why this matters:
 
- the root CA key is insulated from routine certificate operations
- the intermediate CA can be rotated or reissued without disturbing the root trust anchor already distributed to clients
- CRL and OCSP endpoints are scoped per mount, so revocation checks remain accurate at each level of the chain
 
All cert issuance, signing, revocation, and CRL/OCSP operations that the service exposes go through `pki_int`. The `pki` mount is only accessible for reading the root CA and CRL, and for signing new intermediates when rotation is needed.
 
### Service behavior
 
The cert lifecycle API did not change. Under the hood:
 
- token and session renewal for the PKI connection
- PKI errors surfaced cleanly through the API responses
- certificate metadata mapping between PKI responses and service domain models
- CSR-based issuance and internal issuance flows both supported
 
### Configuration surface
 
You now configure OpenBao instead of Vault: host, namespace, AppRole credentials, mount paths, roles, and the service token used for secret rotation.
 
### Operations and observability
 
Logging, metrics, and tracing cover cert issuance, renewal, revocation, and listing flows, the same as before.
 
---
 
## What stayed the same
 
The client-facing cert API did not change. You can still issue, list, view, renew, revoke, validate through OCSP, and retrieve CRL/CA artifacts the same way. Authorization, middleware, and service boundaries are intact. The trust model is the same: PKI authority lives in the backend engine; certs orchestrates the lifecycle.
 
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
 
A few differences from Vault to account for:
 
- token renewal and secret rotation workflows differ operationally from Vault
- default mount naming and path conventions may vary by deployment
- the two-tier CA hierarchy means chain validation involves both the root (`pki`) and intermediate (`pki_int`) mounts; clients that validate the CA chain should expect the full chain to be returned on issuance
- error text and edge-case behavior can vary between implementations
 
---
 
## What is next
 
The certs service is on OpenBao and the MPL 2.0 stack. We are continuing to harden PKI operations and document deployment patterns for different environments.

If you run into issues, open an issue in the repository with your deployment context.
 