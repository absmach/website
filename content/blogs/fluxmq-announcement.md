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
featured: false
---
## Introducing FluxMQ

We’ve been working on the open-source IoT platform [Magistrala](https://magistrala.abmach.eu) for well over a decade. What began as a passion project by a small group of enthusiasts has grown into one of the most widely used open-source IoT platforms in the world. Along the way, our architecture evolved significantly. Eventually, we extracted its core into a more general-purpose, event-driven platform for distributed systems called [SuperMQ](https://github.com/absmach/supermq).


Throughout that journey, one component remained absolutely central: **the message broker**.

For years, we relied on existing brokers as the backbone of our architecture, and they served us well. But as our systems grew more complex — spanning multiple protocols, deployment models, and persistence requirements — it became clear that the broker was no longer just an interchangeable dependency. It was *the core*.

That realization led us to start a new project.

Meet <a href="https://fluxmq.absmach.eu"><span style="color:#2F69B3">**Flux**</span><span style="color:#F9A32A">**MQ**</span>!</a>

---

## What Is FluxMQ?

**FluxMQ** is a **free and open-source message broker** designed to serve as a **high-performance messaging backbone** for modern distributed systems.

At its core, FluxMQ is built around five key ideas:

- **MQTT as a first-class protocol**, not an afterthought
- **Multi-protocol support**, including protocols such as AMQP, CoAP and HTTP
- **Extensibility** for custom workflows and integrations
- **Protocol bridge support** through dedicated front-ends
- **Persistent event storage**, enabling both messaging and event-driven architectures

FluxMQ is designed to handle:

- classic message-based communication
- protocol bridging between heterogeneous clients and services
- persistent message storage for event replay, recovery, and auditing

All of this is delivered as a **single, standalone service**, without external operational dependencies.

FluxMQ is **actively under development**. Some features are still evolving, some APIs may change, and performance characteristics will continue to improve as the project matures.

---

## Key Characteristics
### 🔌 Multi-Protocol Support

FluxMQ supports multiple protocols out of the box, including:
- MQTT v3.1.1 and v5
- AMQP
- HTTP
- WebSockets
- CoAP

FluxMQ is built as a **collection of protocol-specific brokers that share a common messaging core**, including shared persistence and routing.

### 📜 Event Logs and Persistence

Messages can be stored as ordered event logs, enabling:
- Message replay
- Late-joining consumers
- Debugging and audit trails
- Reliable delivery across restarts

### ⚙️ Operational Simplicity

FluxMQ is designed as a standalone service, without mandatory external dependencies. This makes it easier to deploy, operate, and embed into existing systems.

### 🚀 Performance and Scalability

The internal architecture is optimized for throughput and low latency, with a strong focus on predictable behavior under load. Benchmarks and detailed performance analysis will be published as the project matures.

---

## Who Is FluxMQ For?

FluxMQ is a good fit if you are:

- Building IoT platforms that rely on MQTT but need more than a traditional MQTT broker
- Designing event-driven systems with multiple producer and consumer protocols
- Looking for a unified messaging and persistence layer
- Willing to adopt an evolving project and help shape its future

FluxMQ may **not** be the right choice if you are looking for a drop-in replacement for Kafka, NATS, or RabbitMQ, or if your use case is fully covered by simpler messaging models and APIs.

---

## Why Another Message Broker?

Writing a message broker is not something you do for fun. It is a critical infrastructure component that requires deep knowledge of distributed systems, networking, storage, and performance engineering.

So why build another one?

Because our requirements did not align with what existing brokers offered.

We needed:
- MQTT as a first-class citizen, not a plugin or compatibility layer
- Consistent semantics across multiple protocols
- Native support for event logs and message persistence
- Predictable performance under high load
- A system we could reason about, extend, and operate long-term

While excellent systems like NATS, Kafka, and RabbitMQ exist, FluxMQ is not a replacement for them. Each of those projects excels in its own domain.
FluxMQ occupies a different space: a unified broker designed for systems that need **protocol diversity, persistent messaging, and architectural simplicity**.

### Why Choose FluxMQ?

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

## What’s Next?

This announcement is just the beginning. Upcoming posts will dive deeper into:
- Why we built FluxMQ (the full story)
- Architecture deep-dive
- Protocol bridging and persistence internals
- Performance benchmarks and comparisons

Questions, feedback, and contributions welcome. Let's build this together! 🚀
