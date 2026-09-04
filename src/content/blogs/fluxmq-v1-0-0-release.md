---
title: "FluxMQ v1.0.0 is Here"
description: "FluxMQ v1.0.0 stabilizes the public contracts behind a high-performance, multi-protocol messaging platform for IoT, edge, real-time, and event-driven systems."
date: "2026-09-04"
author:
  name: "Abstract Machines"
  picture: "https://avatars.githubusercontent.com/u/126989860?s=200&v=4"
slug: "fluxmq-v1-0-0-release"
tags:
  - fluxmq
  - release
  - mqtt
  - amqp
  - coap
  - messaging
  - iot
  - event-driven
category: announcement
featured: false
---

## FluxMQ v1.0.0

We are pleased to announce **FluxMQ v1.0.0**.
FluxMQ originated from a practical requirement within **Magistrala**.
Messaging is a critical part of the Magistrala architecture. Devices publish telemetry and commands, applications consume data, internal services exchange events, and deployments frequently need to bridge multiple protocols and environments.
As Magistrala deployments grew in scale and complexity, we needed greater control over this infrastructure.
The messaging layer had to remain lightweight and operationally straightforward while supporting reliable MQTT communication, multiple protocols, durable messaging, and horizontal scaling. It also needed clear separation between protocol handling, routing, persistence, and delivery so that each part of the system could evolve independently.
FluxMQ was developed to meet those requirements.
What started as an MQTT broker has matured into a **high-performance, multi-protocol messaging platform for IoT, edge, real-time, and event-driven systems**.
With v1.0, FluxMQ establishes stable architectural boundaries and public contracts for production deployments and long-term development.

---

## From MQTT Broker to Messaging Platform

MQTT remains a first-class protocol in FluxMQ, with support for MQTT 3.1.1 and MQTT 5.0, including QoS, retained messages, persistent sessions, shared subscriptions, Last Will messages, and WebSockets.
FluxMQ also supports:

* MQTT 3.1.1 and MQTT 5.0
* MQTT over WebSocket
* AMQP 0.9.1
* experimental AMQP 1.0
* HTTP publishing
* CoAP
* TLS, mTLS, DTLS, and mDTLS

The architecture is designed around more than protocol compatibility.
FluxMQ separates **transport, protocol semantics, broker behavior, routing, and durable delivery** into distinct layers.
Each protocol retains its own semantics, while shared messaging and queue infrastructure provides a consistent foundation for routing, persistence, and delivery.
This separation allows FluxMQ to support heterogeneous environments without reducing every protocol to a lowest-common-denominator abstraction.

---

## Pub/Sub and Durable Messaging

Different workloads require different delivery semantics.
For low-latency communication, FluxMQ provides publish/subscribe messaging based on topics and subscriptions.
For workloads that require persistence and stronger delivery guarantees, FluxMQ provides **durable queues** with:

* persistent storage,
* consumer groups,
* acknowledgements and redelivery,
* FIFO ordering,
* retention policies,
* and configurable durability.

This enables a single messaging platform to support device telemetry, command delivery, backend events, asynchronous processing, and other event-driven workloads.
Applications can select the delivery model appropriate to their reliability, latency, and persistence requirements.

---

## A Consistent Message Foundation

A significant part of the v1.0 work focused on the internal message model.
FluxMQ now uses a **canonical message envelope** across brokers, queues, persistence, and cluster boundaries.
Payloads, timestamps, delivery state, expiry information, publisher identity, and protocol metadata are represented consistently throughout the system.
This provides a stable foundation for protocol interoperability and allows routing, storage, clustering, and future persistence implementations to evolve around the same message contract.
For a distributed messaging system, consistency at these internal boundaries is essential for predictable behavior at scale.

---

## Built to Scale

Horizontal scalability was one of the key requirements that led to FluxMQ.
As Magistrala deployments grew, the messaging layer needed to scale alongside increasing numbers of devices, connections, and message flows without introducing a disproportionately complex operational stack.
FluxMQ can operate as a single lightweight broker and scale to clustered deployments as requirements increase.
Clustering provides broker membership, distributed client connections, cross-node routing, session ownership, and client takeover.
The objective is to allow applications to scale the messaging infrastructure without coupling themselves to the mechanics of the cluster.
FluxMQ also keeps its core coordination and persistence infrastructure embedded, reducing the number of external systems required to operate a deployment.
Additional distributed queue and replication capabilities will continue to evolve independently of the stable queue API.
The principle remains:
**applications should depend on messaging guarantees, not on the internal topology used to provide them.**

---

## Stable APIs and Architectural Boundaries

The work leading to FluxMQ v1.0 focused heavily on stability rather than feature count.
We reviewed and hardened the public queue APIs, protobuf contracts, configuration model, error behavior, canonical message representation, session ownership, durability semantics, and boundaries between major broker components.
FluxMQ follows a layered architecture:

**Transport → Protocol → Broker → Routing → Queue**

These boundaries make it possible to extend protocols, persistence, routing, and distributed capabilities independently while minimizing impact on existing integrations.
With v1.0, stable public interfaces become explicit contracts. Incompatible changes to those contracts will follow semantic versioning.
For teams integrating FluxMQ into production systems, this provides a predictable foundation for long-lived applications and infrastructure.

---

## Operationally Lightweight

Scalability should not require unnecessary operational complexity.
FluxMQ is written in Go and can be deployed as a single binary.
A local broker can be started with:

```bash
git clone https://github.com/absmach/fluxmq.git
cd fluxmq

make build
./build/fluxmq --config examples/no-cluster.yaml
```

A deployment can begin with a single broker and expand with durable queues, additional protocols, TLS, authorization, and clustering as requirements evolve.
This allows organizations to start with a simple topology while retaining a clear path toward larger distributed deployments.

---

## What Comes After v1.0

FluxMQ v1.0 establishes the baseline for the next phase of development.
We will continue investing in distributed queues, replication, performance, protocol support, observability, operational tooling, and large-scale deployments.
FluxMQ began as infrastructure we needed to build Magistrala reliably at scale.
It has matured into an independent messaging platform designed for organizations building IoT and event-driven systems with demanding requirements around interoperability, performance, durability, and operational control.
**FluxMQ v1.0.0 is available now.**

GitHub: https://github.com/absmach/fluxmq

FluxMQ: https://www.absmach.eu/products/fluxmq
