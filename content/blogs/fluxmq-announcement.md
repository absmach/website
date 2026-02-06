---
slug: fluxmq-announcement
title: "FluxMQ: A Modern Message Broker Built for Messaging and Event Logs"
description: FluxMQ is a free and open-source message broker designed for modern messaging and event-driven systems.
date: "2026-02-06"
author:
  name: "Dusan Borovcanin"
  picture: "https://avatars.githubusercontent.com/u/17817225?v=4"
coverImage: "/img/blogs/fluxmq-announcement/homepage.png"
ogImage:
  url: "/img/blogs/fluxmq-announcement/homepage.png"
tags: 
  - "FluxMQ"
  - "Messaging"
  - "MQTT"
  - "AMQP"
  - "HTTP"
  - "CoAP"
  - "IoT"
  - "Event-Driven"
  - "Architecture"
category: announcement
featured: true
---
## Introducing FluxMQ

We’ve been working on the open-source IoT platform [Magistrala](https://magistrala.abmach.eu) for well over a decade. What began as a passion project by a small group of enthusiasts has grown into one of the most widely used open-source IoT platforms in the world. Along the way, our architecture evolved significantly. Eventually, we extracted its core into a more general-purpose, event-driven platform for distributed systems called [SuperMQ](https://github.com/absmach/supermq).


Throughout that journey, one component remained absolutely central: **the message broker**.

For years, we relied on existing brokers as the backbone of our architecture, and they served us well. But as our systems grew more complex — spanning multiple protocols, deployment models, and persistence requirements — it became clear that the broker was no longer just an interchangeable dependency. It was *the core*.

That realization led us to start a new project.

Meet <span style="color:#2F69B3">**Flux**</span><span style="color:#F9A32A">**MQ**</span>!

---

## What Is FluxMQ?

**FluxMQ** is a **free and open-source message broker** designed to serve as a **high-performance messaging backbone** for modern distributed systems.

At its core, FluxMQ is built around five key ideas:

- **MQTT as a first-class protocol**, not an afterthought
- **Multi-protocol support**, including AMQP and HTTP-based interfaces
- **Extensibility** for custom workflows and integrations
- **Protocol bridge support** through dedicated front-ends
- **Optional persistence**, enabling both messaging and event-driven architectures

FluxMQ is designed to handle:

- classic message-based communication
- protocol bridging between heterogeneous clients and services
- persistent message storage for event replay, recovery, and auditing

All of this is delivered as a **single, standalone service**, without external operational dependencies.

FluxMQ is **actively under development**. Some features are still evolving, some APIs may change, and performance characteristics will continue to improve as the project matures.

---

## Key Characteristics

FluxMQ is built with the following goals in mind:

- **MQTT-first design**  
  Full support for MQTT v3.1.1 and MQTT v5, treated as a native protocol rather than a compatibility layer.
- **Standards-based, multi-protocol front-ends**
  Support for MQTT, AMQP, HTTP, WebSockets, and CoAP, with a bridge layer between them.
- **High performance and scalability**  
  Designed to scale horizontally and handle large numbers of concurrent connections with low latency.
- **Persistent storage when needed**  
  Messages can be stored and replayed, enabling event-driven architectures and durable messaging workflows.
- **Operational simplicity**  
  A single binary that can run on one node or scale into a cluster, with sensible defaults and no required third-party services.
- **Extensibility**  
  A pluggable architecture that allows customization without modifying the broker core.

FluxMQ is intentionally more than “just an MQTT broker”, but it is also **not** trying to replace every specialized messaging system on the market. Its focus is flexibility, extensibility, standards compliance, and operational clarity.

---

## Who Is FluxMQ For?

FluxMQ is for teams where **messaging is a core architectural concern**, not just a utility:

- **IoT platform developers** needing native MQTT V3.1.1/V5 alongside CoAP, HTTP, and WebSockets
- **Organizations running multiple brokers** who want to consolidate MQTT, AMQP, and HTTP into one system
- **Distributed system architects** requiring both real-time messaging and event persistence
- **Teams prioritizing operational simplicity** — one binary, zero external dependencies, sensible defaults

---

## Who FluxMQ Is Not For

FluxMQ may not be the right choice if you:

- Need only **a simple, single-protocol broker** for basic messaging tasks.
- Require **zero operational responsibility** and prefer a fully managed, hosted solution.
- Have low throughput or persistence requirements where embedded libraries are sufficient.
- **Are looking for a direct replacement for Kafka, RabbitMQ, or a time-series database**.

FluxMQ is not a database and is not meant to replicate all features of mature, highly specialized systems. Its goal is to provide a **flexible, multi-protocol messaging foundation with MQTT-first support and optional event persistence**, not to replace every existing tool.

---

## Why Choose FluxMQ?

Most teams end up running multiple brokers: one for MQTT, another for AMQP, maybe Kafka for event logs. Each adds operational complexity, integration overhead, and infrastructure cost.
FluxMQ consolidates this into **one broker, multiple protocols, optional persistence** — without sacrificing performance or flexibility.

**The result:**
- Fewer moving parts in production
- One system to monitor, secure, and scale
- Native MQTT support without protocol translation overhead
- Event replay and audit trails when you need them, pure messaging when you don't

If your architecture treats messaging as infrastructure, not just a utility, FluxMQ is built for you.

---

## Get Involved

This post marks the beginning of the FluxMQ journey.
FluxMQ is **open source and actively developed**. We're building it in public, and community feedback shapes our roadmap.

**Start here:**
- 🌐 **Website:** https://fluxmq.absmach.eu
- ⚙️ **GitHub:** https://github.com/absmach/fluxmq
- 📘 **Documentation:** https://fluxmq.absmach.eu/docs
- 💬 **Discord:** https://discord.gg/HvB5QuzF

**Coming soon on the blog:**
- Why we built FluxMQ (the full story)
- Architecture deep-dive
- Protocol bridging and persistence internals
- Performance benchmarks and comparisons

Questions, feedback, and contributions welcome. Let's build this together! 🚀
