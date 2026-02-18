---
slug: fluxmq-architecture
title: "FluxMQ: Architecture Part 1"
description: A high-level overview of FluxMQ’s architecture, core components, and design principles.
date: "2026-02-19"
author:
  name: "Dusan Borovcanin"
  picture: "https://avatars.githubusercontent.com/u/17817225?v=4"
coverImage: "/img/blogs/fluxmq-architecture/homepage.jpg"
ogImage:
  url: "/img/blogs/fluxmq-architecture/homepage.jpg"
tags:
  - "FluxMQ"
  - "Architecture"
  - "Messaging"
  - "IoT"
  - "MQTT"
  - "AMQP"
  - "HTTP"
  - "CoAP"
  - "Distributed Systems"
category: blog
featured: true
---

## From Motivation to Architecture

In the previous posts, we [introduced FluxMQ](https://www.absmach.eu/blog/fluxmq-announcement/) and explained the [motivation behind building a new message broker](https://www.absmach.eu/blog/fluxmq-motivation/). In this post, we shift focus from *why* to *how*.
This is not a deep dive into implementation details. Instead, the goal is to present the **high-level architecture**, the major building blocks, and the design principles that shape FluxMQ.
Many of the decisions described here are the result of trade-offs. Some are still evolving. All of them are derived by operating real-world systems at scale.

---

## Design Principles

Before looking at components, it’s important to understand the principles that guide the architecture:

- **Protocols have real semantics**:
  Protocols are not interchangeable wire formats. Their delivery models, consumer semantics, and expectations matter.

- **Isolation over abstraction**:
  Avoid shared abstractions that hide important differences between protocols.

- **Operational simplicity beats theoretical elegance**:
  A slightly less “pure” design that is easier to deploy, debug, and evolve is often the better choice.

- **Persistence is optional, but first-class**:
  Messaging and event storage must coexist without forcing one model onto the other.

- **Scale is explicit**:
  Clustering, replication, and failure handling are part of the design, not add-ons.

These principles lead directly to the architecture described below.

---

## Evolution of the Architecture
As we mentioned in earlier posts, we used AI tools for rapid prototyping. This allowed us to test major architectural decisions that would otherwise take weeks. We started somewhat naively — deliberately. In this chapter, we describe how we iteratively arrived at the current FluxMQ architecture. This is unlikely to be the final architecture. However, since the major features are already implemented, we do not expect significant changes unless load testing reveals problems.

### Iteration 1

The initial architecture we envisioned included a few layers:
- transport layer with TLS termination
- protocol parsing and transformation servers
- broker - messaging engine
- storage (multiple implementations)

Looks reasonable, right? Well... on the following diagram you can see the architecture:

![Initial FluxMQ architecture](/img/blogs/fluxmq-architecture/architecture-1.png)

There are a few problems with this approach:

1. Protocols handle messages in a very different ways, and mapping them to a single internal broker/messaging engine is difficult and impractical. Each protocol has its own semantics and delivery state machine, and unifying them would mean either giving up some protocol features or bending of the messaging rules for the respective protocols. For example, acknowledgment for AMQP and for MQTT mean different things:
   - MQTT confirms the broker received or forwarded the packet.
   - AMQP confirms the consumer finished handling the message.
Merging them under single _ack_ would mix *message-received* and *message processing is finished* (either on the producer or the consumer).

1. Implementation complexity. Since the service layer only translates protocols into the broker, this approach results in a single polyglot messaging engine. That engine must handle many protocol-specific behaviors, making it huge, complex, and difficult to debug and maintain.

2. Transport-level concepts, such as connection handling and keep-alive/health checks, are often _part of the protocol_ and, more importantly, _part of the delivery model and client session management_. The separation is  logically clean, but the implementation inevitably mixes them.
   
3. Clustering. We are trying to build a broker that scales, where and how do we handle cluster-level operations that affect all parts of the system?

4. Storage implementation can differ internally, but if they are fundamentally different, we inevitably *leak the abstraction*. Consider key-value vs log store:

| Feature             | Key-Value Store | Log Store            |
| ------------------- | --------------- | -------------------- |
| Primary abstraction | latest state    | ordered history      |
| Addressing          | by key          | by offset (position) |
| Overwrite           | yes             | never (append only)  |
| Reads               | point lookup    | sequential scan      |
| Consumer tracking   | external        | built-in (cursor)    |
| Native model        | queues & RPC    | streams & events     |

Add replication (and how it relates to clustering), retention policies, sharding and partitioning. And this ignores PEL (pending entry list), time index, topic index, topic sharding, segments, rebalancing, read-only replicas, and AOL (append-only log). We will cover these concepts in future posts.
The point is simple: different storage models are difficult to unify — for good reason. They serve different use cases. RabbitMQ has struggled with this across its queue types, and FluxMQ borrows some lessons from that, which we will discuss in detail later.

**We will, however, keep some ideas from this initial architecture and improve them.** In the next iteration we expose more implementation details to motivate the changes.

### Iteration 2

Iteration of the previous idea:
![Initial FluxMQ architecture](/img/blogs/fluxmq-architecture/architecture-2.png)

This is not a different approach, but an iteration on top of the previous one - a "zoomed in" version with more details.
In this iteration, we addressed a few of the previous comments:

1. Protocol handling is addressed by server & brokers. Instead of tiny layer that is transforming messages into the internal representation and hands them to the messaging engine (marked in diagram as _Server_), we introduce another layer for **handling the protocol semantics** called _Broker_.
Essentially, this makes FluxMQ closer to the collection of brokers than to a broker with protocol facades on top of it. Brokers handle messages lifecycle, client sessions, and message delivery **in a protocol-native way**. We avoid shared messaging logic, and keep each protocol close to its original design.

1. Overall complexity is not reduced, since each broker needs to be implemented just like in the previous approach, but it is _localized_ and _isolated_, which improves maintainability and testability significantly.

2. Improvement, but brokers still do handle some of the transport (Server) layer because - message deliver requires connection.

3. Cluster is added to the shared messaging core.

4. Storage implementation is going to be similar to Kafka commit-logs. This fits our use-case of Event-driven architecture the best.

### Iteration 3

This is where things get tricky.
With the first two iterations, it became obvious that isolation and localization were not as clean as expected and the glue between them is becoming much more complex than we anticipated. We identified three categories — network, broker, and storage — that are shared across multiple broker features:

![scopes](/img/blogs/fluxmq-architecture/scopes.png)

Routing and delivery crosses previously set layer boundaries - it is the requirement for both storage, clustering, and even a single-node message routing. This, however, does not mean we can't provide nice implementation-level abstractions, it means we the architecture can not be clearly layered.
Think of this less as a layered architecture, but as a **message flow control system**, that often includes loops.

> Implementation note: message brokers violate many typical service design principles. Some of them include:
> - Observability lacks natural boundaries. In the usual request-response communication, boundaries are request-scoped. A single "message" flows through accept → parse → auth → route → enqueue → persist → replicate → deliver → ack → redeliver… and those steps can be async, retried, reordered, or split across goroutines/nodes. You can't log on boundaries because boundaries are very vague.
> - Backpressure and flow control. Slow consumers are suffocating the deployment. There is no such thing in request-response microservices.
> - Delivery semantics become core design concern. Problem: Users ask for "exactly once", but networks and crashes exist. There is no such thing as 100%.
> - Resource management becomes concern. Not to say it's unimportant in request-response scenarios, but for message brokers small inefficiencies multiply in fan-out scenarios and cost a lot, especially if we're talking delivery guarantees.
> - Operational ergonomics - brokers are a long-running processes, migrations can get expensive.

Finally, the current FluxMQ architecture looks roughly like this:

![Current FluxMQ architecture](/img/blogs/fluxmq-architecture/architecture-3.png)

First, we introduce a new core concept - **Queue**.
The queue links storage and brokers. It connects different brokers, enables protocol bridging, and mediates interaction with message storage. In event-log storage, consumers read the log rather than subscribe to events.
Clustering is now present inside each broker for routing and client sharing. Extensions are also supported.

### Trade-offs
In this architecture iteration, we need to make peace with a few trade-offs:
- Abstraction leakage
  - Connections and/or sessions need to be propagated from transport layer to broker because we need to deliver messages to consumers eventually.
  - Broker needs to be aware of clustering. This is how routing, session takeover, work stealing, shared subscriptions (consumer groups)... work across the cluster.
  - Brokers still **require shared messaging core - Queue**, only here we are trying to keep it as thin and simple as possible.
  - Routing needs to happen across brokers so we enable protocol bridges.
  - Message delivery concepts leak to storage level - delivery needs to be tracked per consumer groups making storage layer aware of consumers.
- We will need to sacrifice some of the protocol-specific abstractions to make queues work seamlessly.
- We will need special topics (though that is not really the problem; even MQTT spec suggest some during the implementation).
- We need "two clusters". One for routing, sessions, and messaging, the other for message replication. Those have nothing to do with each other.

_The architecture did not converge because we designed it well. It converged because the implementation kept breaking our assumptions._

## Current Architecture

After Iteration 3 the architecture stopped changing structurally.
Not because we finished designing it, but because further changes were no longer architectural — they were implementation trade-offs and operational tuning.

At this point, the system had effectively converged into a structure that we can now describe.

At a high level, FluxMQ follows a **layered architecture**, but not a clean textbook layering.
Layers exist as responsibility boundaries, not isolation boundaries.
Message flow regularly crosses them.

---

## Protocol Front-Ends

FluxMQ supports multiple **protocol front-ends**, each implemented as a first-class component:

- MQTT (v3.1.1 and v5)
- AMQP (AMQP 1.0 is highly experimental)
- HTTP
- WebSockets
- CoAP

In practice, we discovered something important while implementing this: a messaging protocol is not just a serialization format or a connection method — it encodes a routing model.

MQTT topics, AMQP exchanges and bindings, HTTP request paths, and CoAP resources all describe how messages are addressed and delivered. Because of that, protocols are inseparable from routing.

This forced us to make several architectural decisions. In a few places we had to _choose between perfect protocol fidelity and a consistent routing core shared across protocols_.
We deliberately did not try to emulate every broker’s behavior exactly, because doing so would make the internal model incoherent.

Instead, FluxMQ defines a unified routing model and maps each protocol onto it as faithfully as possible, while keeping the system internally consistent.

Those trade-offs — what we kept, what we changed, and why — are important enough to deserve their own explanation.
We will go through them in detail in the next post.

---

## The Integration Layer: Queues

To connect independent protocol implementations without forcing semantic convergence, FluxMQ introduces a **thin integration layer** called a **Queue**.

Queues act as the _boundary between protocols and storage_.

Their responsibilities include:

- persistence (when enabled)
- delivery coordination between producers and consumers
- enforcing ordering and acknowledgment semantics
- enforcing retention policies

Queues do **not** attempt to normalize all protocols into a single behavioral model. Instead, they provide a controlled interoperability point where different protocols can exchange messages.

This design allows FluxMQ to:

- prevent protocol collisions
- isolate protocol-specific behavior
- add new protocols with minimal cross-impact

Architecturally, FluxMQ is closer to a **monolith composed of multiple cooperating brokers** than to a single broker with protocol plugins layered on top.

---

## Routing and Broker Logic

Above storage but below protocol front-ends lies the **broker logic**.

This layer is responsible for:

- topic and address resolution
- routing decisions
- fan-out and consumer group coordination
- enforcing access control rules
- applying backpressure and flow control

Routing is intentionally **broker-centric**. Clients — especially constrained IoT devices — are not expected to perform complex filtering or routing decisions.

The broker owns this complexity so clients can remain simple.

However, some of the routing decisions had to be made that would result in  protocol-related compromises. We will talk about them in the next blogpost.

---

## Persistence and Event Logs

Persistence in FluxMQ is **optional but fundamental**.

When enabled, the storage layer provides:

- ordered, append-only logs
- message retention and cleanup policies
- replay and recovery capabilities
- deterministic restart behavior

This enables FluxMQ to act as:

- a traditional message broker
- a durable work queue
- a foundation for event-driven architectures

Importantly, persistence does not dictate how messages are consumed. Some consumers may treat messages as ephemeral; others may rely on durable logs and replay.

---

## Clustering and Scalability

FluxMQ is designed to scale horizontally.

Clustering is built into the broker and does not rely on external coordination systems or shared storage. Nodes cooperate to:

- distribute protocol connections
- replicate metadata and message state
- recover deterministically from failures

Details of clustering, consensus, and replication will be covered in a dedicated post, but the key idea is simple:

> FluxMQ scales as a system, not as a collection of loosely connected components.

---

## What This Architecture Enables

This architecture allows FluxMQ to:

- treat MQTT and AMQP as **peer, standards-based protocols**
- support multiple messaging models without forcing convergence
- avoid artificial protocol extensions and special-topic semantics
- evolve protocol support independently
- remain operable as a single binary or a clustered system

Most importantly, it keeps **complexity explicit**, rather than hiding it behind abstractions that eventually leak.

---

## Still Evolving

FluxMQ’s architecture is not frozen.

Some components will change shape. Some boundaries may move. The guiding principles, however, are unlikely to change: protocol correctness, isolation, extensibility, and operational sanity.

As the implementation matures, future posts will dive into:

- routing internals
- queue semantics
- persistence formats
- clustering and fault tolerance
- protocol-specific design and implementation

---

## What’s Next?

In the next post, we’ll zoom in further and explore one of the core building blocks in detail — starting with **routing decisions and protocol support**.
After that, we will discuss **queues and message flow**, and how FluxMQ reconciles messaging and event logs without collapsing them into the same abstraction.

If you want to follow along or help shape the design:
- 🌐 **Website:** https://fluxmq.absmach.eu
- ⚙️ **GitHub:** https://github.com/absmach/fluxmq
- 📘 **Documentation:** https://fluxmq.absmach.eu/docs
- 💬 **Discord:** https://discord.gg/HvB5QuzF
