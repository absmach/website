---
slug: fluxmq-motivation
title: "FluxMQ: Why We’re Building It"
description: The organizational, technical, and architectural motivations behind building a new message broker.
date: "2026-02-13"
author:
  name: "Dusan Borovcanin"
  picture: "https://avatars.githubusercontent.com/u/17817225?v=4"
coverImage: "/img/blogs/fluxmq-motivation/homepage.jpg"
ogImage:
  url: "/img/blogs/fluxmq-motivation/homepage.jpg"
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
category: blog
featured: true
---

## Why Another Message Broker?

This is the obvious question — and a fair one.

Message brokers are not weekend projects. They are complex, foundational pieces of infrastructure that sit at the heart of distributed systems. They are difficult to design, harder to implement correctly, and even harder to operate at scale.

So why build another one?

The short answer is: **because we need it**.  
The longer answer is what this post is about.

FluxMQ is not an experiment, a toy, or a “because we can” project. It is the result of years of operating real systems, hitting real limitations, and repeatedly running into the same architectural friction points.

---

## Context: Messaging as a Core, Not a Dependency

As mentioned in the [announcement post](https://www.absmach.eu/blog/fluxmq-announcement/), FluxMQ grew out of our work on [SuperMQ](https://github.com/absmach/supermq), a core for event-driven distributed systems that itself evolved from the IoT platform [Magistrala](https://magistrala.abmach.eu).

In most systems, messaging is treated as *plumbing* — something you wire up and forget about.
In our case, messaging is **the product**.
For us, routing, protocol translation, access control, persistence, replay, fan-out, and backpressure are not _peripheral concerns_; they are the system. That distinction matters a lot when choosing (or building) a broker. For a long time, we successfully relied on existing brokers — most notably NATS — and we still consider them excellent tools. But as our requirements evolved, we increasingly found ourselves building *around* the broker instead of *with* it.

---

## Organizational and Strategic Motivation

One of the most important realizations we made is that **the broker defines the shape of the system built on top of it**.

Using an external broker means:
- accepting its internal abstractions
- adapting to its operational model
- working around its limitations
- and living with decisions you do not control

This is often a perfectly reasonable trade-off — until messaging becomes your core value proposition.

In our case:
- we do not control the roadmap
- we do not control architectural decisions
- we do not control long-term licensing risk (What if the broker license changes?)
- and we cannot easily move functionality *into* the broker where it naturally belongs

Building and maintaining a deep integration or a long-lived fork would require the same level of effort and risk as building a purpose-built broker — without the benefits of ownership or architectural freedom.

Since FluxMQ is intended to become part of a commercial, messaging-centric offering, **owning the core technology** became a strategic requirement. Not for differentiation alone, but to be able to evolve the system as a whole, instead of accumulating architectural debt at its boundaries.

Just as importantly, we want that core to remain **free and open-source**, with a healthy community and transparent governance.

---

## Technical Motivation: MQTT Is Not a Second-Class Citizen

A major technical driver behind FluxMQ is MQTT.

MQTT is one of the most important protocols in IoT and edge systems. It is lightweight, efficient, and well-suited for constrained environments. Yet in many general-purpose brokers, MQTT support is either incomplete, layered on top of another proprietary protocol, or treated as a compatibility feature rather than a design constraint.

In practice, this often leads to architectures where:

- one broker handles MQTT
- another broker handles internal messaging or queues
- yet another system is introduced for event logs or persistence
- and protocol bridges glue everything together

We have built and operated such systems. They work — but they are expensive to deploy, difficult to reason about, and fragile to evolve. They are also difficult to debug.

FluxMQ takes a different approach:  
**MQTT is the first-class citizen**, not just an edge protocol.

Other protocols are mapped *into* this model through well-defined front-ends, rather than forcing MQTT traffic through abstractions that were never designed for MQTT in the first place.

At the same time, **MQTT is not suitable for every messaging pattern**.
MQTT’s consumer model is intentionally simple: topic-based subscriptions with limited delivery semantics. This simplicity is a strength for IoT workloads, but it becomes a limitation for use cases that require:
- stronger delivery semantics (acks/settlement/transactions), idempotent processing patterns, and better consumer control)
- richer consumer interaction with the broker
- explicit acknowledgements, settlement, or transactional flows
- advanced filtering or message selection beyond topic hierarchies
 
For these scenarios, FluxMQ introduces support for **AMQP**.
AMQP complements MQTT by providing a more expressive consumer and delivery model, better suited for internal service-to-service communication, work queues, and advanced processing pipelines. Importantly, AMQP support in FluxMQ is not an alternative to MQTT, but an extension of the same messaging core, sharing routing, persistence, and operational semantics.

By treating **MQTT and AMQP as peer**, standards-based protocols — each used where it makes architectural sense — FluxMQ avoids inventing artificial semantics or overloading MQTT with special topics to emulate features it was never designed to provide. That said, FluxMQ *does* make deliberate use of a few special topics. An engineering compromise we accepted since MQTT spec is very generous towards special reserved topics, even suggests them as the implementation tips.

To avoid protocol collisions and to preserve long-term extensibility, FluxMQ does not rely on a single shared messaging engine with multiple protocol adapters layered on top.
Instead, each supported protocol is implemented _independently_, with its own native semantics and expectations. These protocol implementations are connected through an **integration layer**, which we refer to internally as a `queue`. This layer is responsible for interoperability, message flow, and persistence, without forcing one protocol’s semantics onto another.
This approach provides two key benefits:
- **Isolation**: Protocols do not leak assumptions or behaviors into each other, reducing accidental coupling and semantic mismatches.
- **Extensibility**: New, more advanced protocols can be added in the future with a reasonable degree of isolation, while still participating in the same messaging workflows.

As a result, FluxMQ is architecturally closer to a monolith composed of **multiple cooperating brokers** than to a single messaging engine with multiple protocol skins. This design allows each protocol to remain true to its specification, while still enabling controlled interoperability where it makes sense.

---

## Messaging, Queues, and Logs Are Not the Same Thing

One of the hardest problems in broker design is reconciling fundamentally different messaging models. At a high level, many systems talk about “messages” and “consumers”, but the similarities largely end there.

Where things go wrong is when a broker tries to force a single abstraction to cover all workloads. You end up encoding queue semantics into topic conventions, bolting replay on as an afterthought, or relying on external state to get the delivery behavior you need. FluxMQ makes some compromises, but keeps these models explicit: different workloads get different semantics and operational knobs, even if they share routing and persistence primitives.

### IoT Messaging

- messages are small, frequent, and ephemeral
- message loss is often acceptable
- routing is complex and semantic (topics matter)
- consumers are simple and resource-constrained
- delivery guarantees are configurable, not mandatory

### Work Queues

- messages represent units of work
- reliable delivery is essential
- messages are removed after processing
- consumers are capable but interaction is limited
- routing often maps external topics to internal queues

### Event Logs

- messages are immutable records
- loss is unacceptable
- storage and throughput dominate design
- consumers are sophisticated (seek, replay, rewind)
- routing is relatively static and simple

Trying to support all three models equally — on the same data — usually results in a system that is complex, opaque, and difficult to operate.
FluxMQ is explicitly designed to **acknowledge these differences**, not erase them. The goal is not to be everything to everyone, but to support *well-defined use cases* with explicit, visible trade-offs.
Concretely, FluxMQ is designed around:
- IoT and edge messaging (MQTT-first, high fan-out, lossy by design)
- internal service-to-service messaging and work queues (AMQP, explicit delivery semantics)
- persistent event streams with replay and inspection (log-oriented storage)

These use cases overlap, but they are not the same — and FluxMQ does not try to flatten them into a single abstraction.

---

## Why Not Just Use Existing Solutions?

We looked — extensively.
There are excellent MQTT brokers, excellent queueing systems, and excellent log-based platforms. There are also ways to stitch them together using adapters, bridges, and custom glue code.
We’ve done that too. The problem is not that existing tools are bad. The problem is that **none of them align cleanly with our combined requirements**:

- MQTT-first design
- multi-protocol support
- optional persistence
- embedded clustering
- operational simplicity
- open-source licensing
- extensibility without core modification

FluxMQ is not meant to replace Kafka, NATS, or RabbitMQ in their natural domains.
Running multiple brokers, each with its own scaling, persistence, and operational model, introduces cost and complexity that compounds over time.
FluxMQ is an attempt to *reduce* that complexity by collapsing the architecture around a single, well-defined messaging core. In the next blog post, we will talk about that and why our naive initial approach did not work.
We will also talk about protocol standards and challenges in interoperability and compromises and design decisions anyone who writes the broker needs to make.

---

## What’s In It for Us?

Building a message broker is a long-term commitment.
We do it because:

- we gain full control over a critical component
- we can design for our real-world use cases
- we can simplify deployment and operation
- we can build services and tooling *around* the broker instead of fighting it
- we can build features we think belong to the broker *in* the broker, rather than *around* it

Our long-term business model is centered around **services, support, and expertise**, not locking core features behind a paywall.
_Extensibility exists to enable customization and experimentation_, not to fragment the ecosystem.

---

## Still Early, Still Evolving

FluxMQ is in active development.

- Some design decisions will change. 
- Some APIs will evolve.
- Some early implementations will be replaced.
- **Some statements from the README are goals, not achievements.**
- Even logo and branding may change.

That’s intentional.

We use AI tools early on, so expect some slop, rapid iterations and rough edges. That’s part of moving fast at this stage. We prototype, experiment, and iterate aggressively to learn what actually works. As things solidify, we clean it up, measure it, and replace shortcuts with proper implementations.

---

## What’s Next?

In the next post, we’ll move from *why* to *how*.

We’ll outline:

- the high-level architecture
- the core components of FluxMQ
- how protocol front-ends, routing, and storage fit together
- and the design constraints that shaped these choices

If you care about messaging systems, protocol design, or distributed architecture — now is the perfect time to get involved:
- 🌐 **Website:** https://fluxmq.absmach.eu
- ⚙️ **GitHub:** https://github.com/absmach/fluxmq
- 📘 **Documentation:** https://fluxmq.absmach.eu/docs
- 💬 **Discord:** https://discord.gg/HvB5QuzF
 
We’re building this in the open.  
And we’re just getting started.
