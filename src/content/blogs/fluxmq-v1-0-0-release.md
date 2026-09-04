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

FluxMQ v1.0.0 is here.

What started as an MQTT broker for Magistrala's messaging needs has matured into a high-performance, multi-protocol messaging platform for IoT, edge, real-time, and event-driven systems.

FluxMQ is built for teams that need messaging infrastructure with protocol diversity, durable delivery options, and a clear path from a single lightweight deployment to clustered operation. It remains simple to run as a Go binary, while giving operators and developers the primitives needed for more demanding production topologies.

---

## From MQTT Broker to Messaging Platform

FluxMQ began with a focused goal: provide a broker that could serve the MQTT-heavy workloads inside Magistrala without forcing the rest of the platform to adapt around a generic broker.

That focus still matters. MQTT remains a first-class protocol in FluxMQ, with support for MQTT 3.1.1 and MQTT 5.0, QoS 0/1/2, retained messages, persistent sessions, shared subscriptions, Last Will messages, and MQTT over WebSocket for browser and web application clients.

But the project has grown beyond MQTT alone.

FluxMQ now brings multiple protocol front ends into one messaging system:

- MQTT 3.1.1 and MQTT 5.0 over TCP and WebSocket
- AMQP 0.9.1
- experimental AMQP 1.0
- HTTP publishing
- CoAP
- TLS and mTLS for client connections
- DTLS and mDTLS for CoAP
- mTLS for inter-broker communication

The goal is not to erase the differences between protocols. MQTT, AMQP, HTTP, and CoAP have different semantics, clients, and operating models. FluxMQ keeps those differences visible while providing a shared routing and queue foundation underneath them.

---

## A Clearer Architecture

FluxMQ v1.0.0 reflects the architecture that emerged from building, testing, and hardening the broker across real messaging paths:

**Transport -> Protocol -> Broker -> Routing -> Queue**

Transport listeners handle network concerns such as TCP, UDP, WebSocket, TLS, mTLS, DTLS, and mDTLS. Protocol layers parse and validate wire behavior. Broker components preserve protocol-specific semantics. Routing decides where messages should flow. Queues provide the shared durability and delivery layer.

This separation keeps the system understandable without pretending that message brokers are perfectly layered applications. Sessions, routing, clustering, persistence, and delivery semantics naturally interact. FluxMQ makes those boundaries explicit so each part can evolve without turning the broker into one large, opaque messaging core.

---

## Pub/Sub and Durable Queues

FluxMQ supports classic pub/sub messaging and durable queue-based delivery.

For low-latency communication, clients can publish and subscribe through the supported protocol front ends. For workloads that need stronger delivery coordination, FluxMQ provides durable queues with:

- persistent storage
- consumer groups
- acknowledgements, negative acknowledgements, and rejection paths
- redelivery
- FIFO ordering per queue and consumer group
- retention policies based on time, size, or message count
- configurable durability behavior

This lets teams use FluxMQ for direct device messaging, event fan-out, asynchronous workflows, and queue-backed processing without introducing a separate broker for each pattern.

---

## A Canonical Message Envelope

One of the most important v1.0.0 milestones is the canonical message envelope.

Before a stable 1.0 line, message representation is one of the most expensive things to change. It touches brokers, queues, persistence, protocol adapters, and cluster boundaries. FluxMQ v1.0.0 stabilizes this representation so messages can move across those boundaries with a consistent shape.

The canonical envelope is now the shared representation used across the queue command path, storage, protocol adapters, and cluster wire. That gives FluxMQ a stronger compatibility foundation for future releases and reduces the risk of protocol metadata or delivery state being lost as messages move through the system.

---

## Single Binary, Clustered When Needed

FluxMQ can run as a single lightweight Go binary with embedded storage and no required external broker dependencies.

That keeps local development and edge deployments straightforward. A developer can build it, point it at a YAML configuration file, and start publishing messages quickly.

For larger deployments, FluxMQ can run as a cluster. Clustering provides:

- broker membership
- distributed client connections
- cross-node message routing
- session ownership
- client takeover
- mTLS-protected inter-broker communication

In practice, that means a client can connect to one node while matching subscribers or session owners live elsewhere in the cluster. FluxMQ coordinates ownership and routing so the system behaves as one broker instead of a set of isolated nodes.

---

## What v1.0.0 Stabilizes

The v1.0.0 release is about more than a version number. It marks the point where the core public contracts are ready to be treated as stable.

FluxMQ v1.0.0 focuses on stabilizing:

- public Go APIs and broker contracts
- protobuf contracts
- configuration model and strict YAML decoding behavior
- queue error behavior and protocol-specific error projections
- canonical message representation
- session ownership semantics
- durability and queue command semantics

This matters because messaging infrastructure becomes hard to change once real systems depend on it. FluxMQ v1.0.0 gives users a clearer compatibility baseline while leaving room for additive improvements in later releases.

---

## What Comes Next

FluxMQ v1.0.0 is a foundation, not the end of the roadmap.

Future work will continue across:

- distributed queues
- replication and recovery behavior
- performance tuning and benchmarking
- broader protocol support
- observability
- operational tooling
- large-scale deployment guidance

Some advanced paths, including AMQP 1.0 and queue replication, will continue to evolve as they are tested against more workloads and deployment models.

---

## Get FluxMQ v1.0.0

FluxMQ is open source under the Apache 2.0 license.

- Website: https://www.absmach.eu/products/fluxmq
- GitHub: https://github.com/absmach/fluxmq
- Release tag: https://github.com/absmach/fluxmq/releases/tag/v1.0.0
- Documentation: https://www.absmach.eu/docs/fluxmq

If you are building IoT, edge, real-time, or event-driven systems and need a broker that treats MQTT as first-class while supporting more than MQTT alone, FluxMQ v1.0.0 is ready to try.
