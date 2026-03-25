---
title: "Building a Dashboard for FluxMQ: Visibility Across Protocols and Clusters"
slug: "fluxmq-dashboard"
excerpt: "FluxMQ now ships with a real-time dashboard that gives you live visibility into sessions, subscriptions, broker health, and cluster topology — all in one place."
description: "A walkthrough of the FluxMQ dashboard: what it shows, how it's built, and how to run it alongside your broker using Docker or docker compose."
date: "2026-03-24"
author:
  name: "Felister Wambui"
  picture: "https://avatars.githubusercontent.com/u/80099068?v=4"
coverImage: "/img/blogs/fluxmq-dashboard/cover-image.png"
ogImage:
  url: "/img/blogs/fluxmq-dashboard/cover-image.png"
category: blog
tags:
  - fluxmq
  - dashboard
  - mqtt
  - amqp
---

Running a message broker in production without visibility is flying blind. You know messages are flowing but how many clients are connected? Which sessions are active or stale? Are all cluster nodes healthy? Which topics are active right now?

FluxMQ now ships with a real-time dashboard that answers these questions out of the box.

---

## What the Dashboard Shows

The dashboard is a Next.js application that talks to the FluxMQ Admin API. It's organized around six views:

- **Overview** — live message throughput charts, bandwidth trends, and a cluster node table with per-node health at a glance
- **Sessions** — all sessions (connected and disconnected), filterable by protocol, with per-session detail dialogs
- **Subscriptions** — active topic filters aggregated from connected clients
- **Broker Info** — runtime identity, uptime, session counts, and error counters

Every page polls the Admin API on a short interval so the data stays current without a page refresh.

---

## Multi-Protocol Awareness

FluxMQ speaks MQTT v3, MQTT v5, AMQP 1.0, AMQP 0.9.1, and HTTP. The sessions page surfaces the protocol each client is using, so you can see at a glance whether you have a mix of MQTT and AMQP clients, where the load is concentrated, and whether any sessions are stuck or disconnected unexpectedly.

---

## Design Decisions

**Server-side API calls.** The Admin API is only reachable from the backend, not the browser. All FluxMQ API calls go through Next.js API routes, which keeps credentials and internal URLs out of the client bundle.

**Environment-driven configuration.** The broker URL is set via `FLUXMQ_API_URL`, and for cluster deployments `FLUXMQ_NODE_URLS` takes a comma-separated list so per-node stats can be fetched in parallel. No hardcoded values, no rebuilds for different environments.

**Mock fallback.** If `FLUXMQ_API_URL` isn't set, the dashboard falls back to mock data. This makes local development and UI iteration possible without a running broker.

---

## Running It

The easiest way to get started is docker compose:

```bash
docker compose -f deployments/docker/compose.yaml up -d
```

This starts FluxMQ and the dashboard together. The dashboard is available at `http://localhost:3000/dashboard`.

For a three-node cluster:

```bash
make docker-cluster-up
docker compose -f deployments/cluster/docker-compose.yaml up -d dashboard
```

The dashboard connects to node 1 by default and fans out per-node stats across all three nodes.

---

## What's Next

The current dashboard covers the core operational view. Upcoming work includes alert thresholds, historical trend data, and a connections page for filtering active clients by IP or client ID. If you have a specific use case or a gap you're running into, open an issue.
