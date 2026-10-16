---
title: "Multi-Protocol Messaging in Magistrala: Sending IoT Data over HTTP, MQTT, WebSocket, and CoAP"
slug: "multi-protocol-messaging"
description: "A practical guide to sending messages in Magistrala using HTTP, MQTT, WebSocket, and CoAP — understand when to use each protocol and how to get started with real examples."
excerpt: "Learn how Magistrala supports four major IoT messaging protocols out of the box — HTTP, MQTT, WebSocket, and CoAP — and how to send your first messages using each one."
date: "2026-02-18"
author:
  name: "Felix Gateru"
  picture: "https://avatars.githubusercontent.com/u/flagisover?v=4"
coverImage: "/img/blogs/multi-protocol-messaging/hero.png"
ogImage:
  url: "/img/blogs/multi-protocol-messaging/hero.png"
tags:
  - iot
  - magistrala
  - messaging
  - mqtt
  - http
  - coap
  - websocket
  - protocols
  - real-time-processing
---

IoT systems are rarely the same. A temperature sensor on a factory floor communicates differently than a dashboard running in a browser. An embedded device on a limited network has very different needs compared to a backend service that processes millions of events every second. This is why flexibility in protocols is important. If your IoT platform only uses HTTP, you miss out on the lightweight, ongoing, and real-time communication that modern connected systems require.

[Magistrala](https://magistrala.absmach.eu/) solves this by supporting four major messaging protocols out of the box: **HTTP**, **MQTT**, **WebSocket**, and **CoAP**. Each one serves a different purpose, and all of them work with the same channels, clients, and authorization model. Your devices and applications can communicate using whichever protocol fits their constraints — and Magistrala handles the rest.

In this guide, we'll walk through each protocol, explain when to use it, and show you exactly how to send and receive messages using real CLI examples.

## Before You Start

Before sending any messages, you need three things in place:

1. **A domain** — the workspace where your IoT resources live.
2. **A client** — the device or application that will send or receive data. Each client has a unique `client_id` and `client_secret` used for authentication.
3. **A channel** — the communication pathway. Clients connect to channels with publish, subscribe, or both permissions.

If you're new to Magistrala, the [Getting Started with Magistrala UI](https://absmach.eu/blog/magistrala-ui-guide/) guide covers how to set up domains, clients, and channels through the visual interface.

Once your client is connected to a channel, you're ready to send messages.

### A Note on Security

Magistrala supports secure versions of all four protocols — HTTPS, MQTTS, WSS, and CoAPS. TLS and DTLS are used for TCP and UDP connections respectively. The CA certificates used to sign Magistrala server certificates come from [Let's Encrypt](https://letsencrypt.org/), a widely trusted Certificate Authority. On most workstations, your default CA chain already includes Let's Encrypt. For embedded devices, you may need to download the [CA certificate](https://letsencrypt.org/certs/gen-y/root-x2-by-x1.pem) separately.

## The Topic Structure

Regardless of which protocol you use, Magistrala follows a consistent topic format for routing messages:

```
m/<domain_id>/c/<channel_id>
```

- `m/` is the messaging prefix.
- `<domain_id>` identifies the workspace.
- `c/` is the channel prefix.
- `<channel_id>` identifies the specific channel.

You can also append **subtopics** for finer-grained routing:

```
m/<domain_id>/c/<channel_id>/bedroom/temperature
```

Subtopics are multilevel and flexible — you can use `/` or `.` as separators, and they can be as deep as you need. Authorization is enforced at the channel level, so access to a channel automatically grants access to all its subtopics.

This consistent structure means that whether you're sending data over HTTP or MQTT, the addressing is the same. Only the transport changes.

## HTTP — The Universal Fallback

**Best for:** Request-response workflows, backend service integrations, environments where simplicity wins over efficiency.

HTTP is the most widely understood protocol on the internet. Every language, framework, and platform supports it. In IoT, it's ideal for situations where a device or service needs to push data on demand — a sensor reading every few minutes, a batch upload from an edge gateway, or an application posting processed results.

The trade-off is that HTTP is stateless. There's no persistent connection, no native pub/sub, and each message requires a full request-response cycle. For high-frequency, real-time use cases, other protocols are a better fit. But for straightforward data ingestion, HTTP is hard to beat.

### Sending a Message via HTTP

Use `curl` or any HTTP client. The message is sent as a `POST` request to the channel endpoint:

```bash
curl -s -S -i --cacert /etc/ssl/certs/ca-certificates.crt \
  -X POST \
  -H "Content-Type: application/senml+json" \
  -H "Authorization: Client <client_secret>" \
  https://messaging.magistrala.absmach.eu/http/m/<domain_id>/c/<channel_id> \
  -d '[{"bn":"some-base-name:","bt":1.276020076001e+09,"bu":"A","bver":5,"n":"voltage","u":"V","v":120.1},{"n":"current","t":-5,"v":1.2},{"n":"current","t":-4,"v":1.3}]'
```

A few things to note:

- The `Authorization` header uses the format `Client <client_secret>`.
- If you're using [SenML](https://datatracker.ietf.org/doc/html/rfc8428) as your message format, the payload must always be a JSON array.
- The `Content-Type` should match your payload format — `application/senml+json` for SenML.

HTTP is the default when you send messages through the Magistrala UI as well. The UI's "Send Message" modal uses HTTP behind the scenes.

## MQTT — The IoT Workhorse

**Best for:** Persistent connections, real-time telemetry, battery-constrained devices, pub/sub architectures.

MQTT was designed specifically for IoT. It's lightweight, supports persistent connections, provides quality-of-service (QoS) levels, and uses a publish-subscribe model that decouples data producers from consumers. If your devices need to stream data continuously or receive commands in real-time, MQTT is the natural choice.

Magistrala's MQTT adapter integrates seamlessly with standard MQTT tooling. You can use [Mosquitto](https://mosquitto.org/) clients, [Eclipse Paho](https://www.eclipse.org/paho/), or any MQTT library that supports v3.1.1 or v5.

### Publishing a Message via MQTT

Using the Mosquitto CLI:

```bash
mosquitto_pub -I <client_name> \
  -u <client_id> \
  -P <client_secret> \
  -t m/<domain_id>/c/<channel_id> \
  -h messaging.magistrala.absmach.eu \
  -m '[{"bn":"some-base-name:","bt":1.276020076001e+09,"bu":"A","bver":5,"n":"voltage","u":"V","v":120.1},{"n":"current","t":-5,"v":1.2},{"n":"current","t":-4,"v":1.3}]'
```

### Subscribing to a Channel via MQTT

```bash
mosquitto_sub -I <client_name> \
  -u <client_id> \
  -P <client_secret> \
  -t m/<domain_id>/c/<channel_id> \
  -h messaging.magistrala.absmach.eu
```

The `-I` flag sets the MQTT client ID, `-u` is the Magistrala client ID, and `-P` is the client secret. The topic follows the same `m/<domain_id>/c/<channel_id>` structure.

For TLS-secured connections, add the CA certificate flag:

```bash
--cafile docker/ssl/certs/ca.crt
```

When subscribing via MQTT, use standard MQTT wildcards (`+` for single-level, `#` for multi-level) to subscribe to multiple subtopics at once.

## CoAP — Built for Constrained Devices

**Best for:** Low-power embedded devices, constrained networks, UDP-based environments, sensor networks.

CoAP (Constrained Application Protocol) is designed for devices that can't afford the overhead of TCP. It runs over UDP, uses a compact binary format, and supports observe patterns for lightweight subscriptions. If you're working with microcontrollers, battery-powered sensors, or networks with high latency and low bandwidth, CoAP is purpose-built for your world.

Magistrala's CoAP adapter implements the protocol with DTLS (Datagram Transport Layer Security) as defined in [RFC 7252](https://tools.ietf.org/html/rfc7252).

You can use [CoAP CLI](https://github.com/absmach/coap-cli) to send and receive messages.

### Sending a Message via CoAP

```bash
coap-cli post m/<domain_id>/c/<channel_id>/subtopic \
  -auth <client_secret> \
  -d "hello world" \
  -h messaging.magistrala.absmach.eu \
  -p 5684 \
  -s
```

### Subscribing via CoAP

```bash
coap-cli get m/<domain_id>/c/<channel_id>/subtopic \
  -auth <client_secret> \
  -o \
  -h messaging.magistrala.absmach.eu \
  -p 5684 \
  -s
```

The `-o` flag enables the CoAP Observe option, which keeps the connection open for incoming messages. The `-s` flag enables DTLS. Port `5684` is the standard CoAP secure port.

CoAP's publish model uses `POST` requests, and its subscribe model uses `GET` with the Observe flag — a simple, RESTful approach that maps naturally to how constrained devices operate.

## WebSocket — Real-Time for the Browser

**Best for:** Browser-based dashboards, real-time visualization, interactive applications, live monitoring.

WebSocket provides full-duplex, persistent connections over a single TCP socket. Unlike HTTP, once the connection is established, data flows freely in both directions without repeated handshakes. This makes it ideal for browser applications that need live data streams — dashboards, monitoring tools, and interactive UIs.

Magistrala's WebSocket adapter lets clients subscribe to channels and receive messages as they arrive, with no polling required.

### Connecting and Subscribing via WebSocket

Using `wscat`:

```bash
wscat -c "wss://messaging.magistrala.absmach.eu/api/ws/m/<domain_id>/c/<channel_id>/<subtopic>/?authorization=<client_secret>"
```

### Sending a Message via WebSocket

```bash
wscat -c "wss://messaging.magistrala.absmach.eu/api/ws/m/<domain_id>/c/<channel_id>/<subtopic>/?authorization=<client_secret>" \
  -x '[{"n":"voltage","bu":"V","u":"V","bt":1761838262251000000,"v":350}]'
```

The `authorization` query parameter carries the client secret, and the `-x` flag sends a single message before disconnecting. For interactive sessions, omit `-x` and type messages directly into the terminal.

### MQTT-over-WebSocket

Magistrala also supports **MQTT-over-WebSocket**, which combines MQTT's pub/sub semantics and QoS guarantees with WebSocket's browser compatibility. This is particularly useful for web applications that need MQTT features without requiring a native MQTT client.

Two recommended JavaScript libraries for browser-based MQTT-over-WS:

1. [Eclipse Paho JavaScript Client](https://www.eclipse.org/paho/index.php?page=clients/js/index.php)
2. [MQTT.js](https://github.com/mqttjs/MQTT.js)

The connection URL follows this pattern:

```
ws://messaging.magistrala.absmach.eu/mqtt
```

Here's a minimal browser example using MQTT.js:

```javascript
const options = {
  clean: true,
  connectTimeout: 4000,
  clientId: "<client_id>",
  username: "<client_id>",
  password: "<client_secret>",
};

const domainId = "<domain_id>";
const channelId = "<channel_id>";
const topic = "m/" + domainId + "/c/" + channelId;

const connectUrl = "ws://messaging.magistrala.absmach.eu/mqtt";
const client = mqtt.connect(connectUrl, options);

client.on("connect", function () {
  console.log("Connected: " + options.clientId);
  client.subscribe(topic, { qos: 0 });
  client.publish(topic, "Hello from the browser!", { qos: 0, retain: false });
});

client.on("message", function (topic, message) {
  console.log("Received: " + message.toString() + " on topic: " + topic);
});
```

This gives your browser apps full MQTT capabilities — subscriptions, QoS, and pub/sub — all running over a WebSocket transport.

## Choosing the Right Protocol

There's no single "best" protocol. The right choice depends on your device capabilities, network constraints, and application requirements.

| Protocol      | Transport | Connection  | Best For                                                    |
| ------------- | --------- | ----------- | ----------------------------------------------------------- |
| **HTTP**      | TCP       | Stateless   | Simple integrations, batch uploads, backend services        |
| **MQTT**      | TCP       | Persistent  | Real-time telemetry, command-and-control, pub/sub workflows |
| **CoAP**      | UDP       | Lightweight | Constrained devices, low-power networks, sensor data        |
| **WebSocket** | TCP       | Persistent  | Browser dashboards, live monitoring, interactive UIs        |

The beauty of Magistrala's approach is that you don't have to choose just one. A sensor on a constrained network can publish over CoAP, while a dashboard in the browser subscribes over WebSocket, and a backend service pulls data over HTTP — all on the same channel, with the same authorization model. Magistrala handles the protocol translation transparently.

## Sending Messages from the UI

If you prefer a visual approach, the Magistrala UI lets you send messages without touching a terminal. Here's the workflow:

1. Navigate to the **Channels** page in your domain.
2. Select the channel you want to send messages to.
3. Click the **Messages** tab.
4. Click **Send Message** and fill in your payload.

The UI sends messages using HTTP by default, with your User ID as the publisher. If you want to use a specific protocol, click **Use CLI Tools** — the UI will generate ready-to-copy CLI commands for MQTT, HTTP, CoAP, and WebSocket, pre-filled with your channel's credentials and IDs. Just paste them into your terminal and run.

> **Note:** To view messages on the channel's message page, you need a rule configured to store messages to the internal database. Check the [Rules Engine guide](https://docs.magistrala.absmach.eu/user-guide/rules-engine/) for setup instructions.

## Subtopics: Adding Structure to Your Data

Beyond basic channel routing, Magistrala supports **subtopics** for finer-grained message organization. Append any path after the channel ID:

```
m/<domain_id>/c/<channel_id>/bedroom/temperature
m/<domain_id>/c/<channel_id>/floor-2/hvac/status
m/<domain_id>/c/<channel_id>/vehicle/engine/rpm
```

Subtopics are multilevel, flexible, and don't require pre-configuration. You can use `/` or `.` as separators (internally, `/` is converted to `.`). Authorization is enforced at the channel level — if a client has access to the channel, it has access to all subtopics.

For MQTT subscriptions, use standard wildcards:

- `+` matches a single level: `m/<domain_id>/c/<channel_id>/+/temperature`
- `#` matches all remaining levels: `m/<domain_id>/c/<channel_id>/#`

For CoAP and WebSocket, subtopics are appended directly to the URL path.

## What Happens After the Message Is Sent?

Sending a message is just the beginning. Once data flows through a channel, Magistrala's [Rules Engine](https://absmach.eu/blog/rules-engine/) can process it in real-time:

- **Store messages** to the internal database or external PostgreSQL instances.
- **Route messages** to other channels for downstream processing.
- **Trigger alarms** when thresholds are breached.
- **Send notifications** via email or Slack.
- **Transform data** using custom Lua or Go scripts.

Rules turn raw messages into actionable workflows — and they work identically regardless of which protocol delivered the data.

## Conclusion

Protocol flexibility isn't a nice-to-have in IoT — it's a requirement. Different devices, networks, and applications demand different communication patterns, and forcing everything through a single protocol creates friction and limitations.

Magistrala gives you four production-ready protocols — HTTP, MQTT, CoAP, and WebSocket — all unified under a single authorization model, a consistent topic structure, and a shared rules engine. Your sensors, gateways, applications, and dashboards can each use the protocol that fits their constraints, and Magistrala makes sure the data gets where it needs to go.

Ready to start sending messages? [Try Magistrala Cloud for free](https://cloud.magistrala.absmach.eu/) or [explore the full messaging documentation](https://docs.magistrala.absmach.eu/user-guide/messaging/).
