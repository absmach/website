---
slug: remote-nodered-management-with-magistrala-agent
title: "Remote Node-RED Flow Management at the Edge with Magistrala Agent"
description: "Learn how to use Magistrala Agent to remotely deploy and manage Node-RED flows on edge devices over MQTT, tested with a local Docker mock device and Magistrala cloud."
date: "2026-04-02"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/update-agent-with-nodered/cover_page.png"
ogImage:
  url: "/img/blogs/update-agent-with-nodered/cover_page.png"
tags:
  - Magistrala
  - Agent
  - Node-RED
  - IoT
  - Edge Computing
  - Modbus
  - Docker
category: tutorial
---

One of the hardest problems in industrial IoT is not connecting devices to the cloud, it's **managing what happens at the edge after deployment**.

You have a device running Node-RED in the field. Everything works. Then requirements change: you need to update the flow logic, add a new sensor, or fix a bug. Without physical access or an open SSH port, that change becomes a project.

This post shows how **Magistrala Agent** solves that problem by letting you **remotely deploy and update Node-RED flows**, either via its local HTTP API or from the Magistrala cloud over MQTT, demonstrated end-to-end with a local mock Linux device and the Magistrala cloud.

---

## What We're Building

A local **mock Linux device** (Docker Compose) that simulates an edge gateway running:
- **Magistrala Agent**: connects to Magistrala cloud MQTT, manages Node-RED
- **Node-RED**: runs data pipelines, publishes SenML telemetry
- **NATS**: internal message bus between agent services

Connected to the **Magistrala cloud** which receives telemetry, stores it via the Rule Engine, and sends commands back down to the device.

---


## Why Agent + Node-RED?

Node-RED is excellent for visual flow-based IoT pipelines. But once deployed, updating flows typically requires direct access to the device (Node-RED UI on port 1880, which you don't expose publicly).

Magistrala Agent bridges this gap. It acts as a **secure proxy for Node-RED management**, receiving commands from the Magistrala cloud over the same encrypted MQTT channel already used for telemetry, then forwarding them to Node-RED's local REST API.

This means you can:
- Deploy new flows to any device from anywhere
- Fetch and inspect the currently running flows
- Check Node-RED's health and runtime state
- Add individual flow tabs without replacing all flows

All without opening any additional ports or a VPN.

---

## Setting Up the Mock Device

### 1. Provision Magistrala resources

With a running Magistrala instance (cloud or self-hosted), provision the required resources using a Personal Access Token:

```bash
export MG_PAT=<personal-access-token>
export MG_DOMAIN_ID=<domain-id>
make run_provision
```

The provisioning script creates:
1. A Magistrala Client (device identity + credentials)
2. A Channel
3. A Client-Channel connection
4. A Bootstrap configuration
5. A Rule Engine rule with `save_senml` output

All provisioned variables are written directly to `docker/.env`.

![Rule Engine save_senml rule](/img/blogs/update-agent-with-nodered/rule_in_mg_to_save.png)

The rule subscribes to the `data` subtopic on the channel and passes every incoming message straight to Magistrala's Internal DB in SenML format.

### 2. Start the stack

```bash
make all && make docker_dev
make run
```

This starts Agent (`:9999`), Node-RED (`:1880`), and NATS (`:4222`) in Docker.

The Node-RED instance ships with a **default flow** that immediately begins publishing simulated temperature and humidity readings to Magistrala every 30 seconds:

![Default Node-RED flow](/img/blogs/update-agent-with-nodered/starting_default_flow.png)

Within a minute you can confirm the data is arriving in Magistrala by opening the Messages view for your channel:

![Default flow data saved in Magistrala](/img/blogs/update-agent-with-nodered/default_flow_data_saved_in_mg.png)

This verifies the full MQTT pipeline end-to-end before touching any deploy commands.

### 3. Verify everything is running

```bash
# Agent health
curl http://localhost:9999/health
```

Expected response:
```json
{"status":"pass","version":"0.0.0","commit":"ffffffff","description":"agent service","build_time":"1970-01-01_00:00:00","instance_id":""}
```

```bash
# Ping Node-RED via agent
curl -s -X POST http://localhost:9999/nodered \
  -H 'Content-Type: application/json' \
  -d '{"command":"nodered-ping"}'
```

Expected response:
```json
{"service":"agent","response":"..."}
```

---

## Deploying Flows via HTTP (Local)

The agent exposes an HTTP API on `:9999` for local management. This is useful for testing from the same machine before moving to remote MQTT control.

### Deploy a flow

First, base64-encode the flow JSON:

```bash
FLOWS=$(cat examples/nodered/speed-flow.json | base64 -w 0)
```

Then send it to the agent. The agent decodes the flows, patches the MQTT client ID, and forwards them to Node-RED on its behalf:

```bash
curl -s -X POST http://localhost:9999/nodered \
  -H 'Content-Type: application/json' \
  -d "{\"command\":\"nodered-deploy\",\"flows\":\"$FLOWS\"}"
```

Expected response:
```json
{
  "service": "agent",
  "response": ""
}
```

An empty `response` body is expected: Node-RED's `POST /flows` returns `204 No Content` on success.

### Fetch current flows

```bash
curl -s -X POST http://localhost:9999/nodered \
  -H 'Content-Type: application/json' \
  -d '{"command":"nodered-flows"}'
```

Expected response (abbreviated):
```json
{
  "service": "agent",
  "response": "[{\"id\":\"flow-speed\",\"type\":\"tab\",\"label\":\"Speed Sensor\",\"disabled\":false,\"info\":\"\"},...]\n"
}
```

The `response` field contains the raw JSON array of all deployed Node-RED flow objects.

### Get runtime state

```bash
curl -s -X POST http://localhost:9999/nodered \
  -H 'Content-Type: application/json' \
  -d '{"command":"nodered-state"}'
```

Expected response:
```json
{
  "service": "agent",
  "response": "{\"state\":\"start\"}\n"
}
```

`"start"` means all flows are active and running.

---

## Deploying Flows via MQTT (from Magistrala Cloud)

This is the core use case: sending commands from the Magistrala cloud to the device over MQTT.

### Single Channel, Three Subtopics

The agent uses a single Magistrala channel with three subtopics to separate concerns:

| Subtopic | Direction | Used by | Purpose |
|----------|-----------|---------|----------|
| `m/<domain-id>/c/<channel-id>/req` | Cloud → Device | Agent | Receives commands (deploy flows, fetch flows, exec, etc.) |
| `m/<domain-id>/c/<channel-id>/data` | Device → Cloud | Node-RED | Publishes SenML telemetry upstream |
| `m/<domain-id>/c/<channel-id>/res` | Device → Cloud | Agent | Publishes command responses back to the cloud |

The agent and Node-RED share the same channel but use different MQTT client IDs: `<client-id>` for the agent and `<client-id>-nr` for Node-RED. The `-nr` suffix is automatically patched into flows by the agent at deploy time, preventing session conflicts on the broker.

### SenML command format

All agent commands use [SenML](https://tools.ietf.org/html/rfc8428) JSON arrays:

```json
[{"bn": "<request-id>:", "n": "<subsystem>", "vs": "<command>[,<payload>]"}]
```

For Node-RED, `n` is `nodered` and `vs` is `nodered-deploy,<base64-flow>`.

### Deploy a flow remotely

```bash
FLOWS=$(cat examples/nodered/modbus-flow.json | base64 -w 0)

mosquitto_pub \
  -h messaging.magistrala.absmach.eu -p 8883 \
  --capath /etc/ssl/certs \
  -I "Client" \
  -u <client-id> -P <client-secret> \
  -t "m/<domain-id>/c/<channel-id>/req" \
  -m "[{\"bn\":\"req-1:\", \"n\":\"nodered\", \"vs\":\"nodered-deploy,$FLOWS\"}]"
```

![mosquitto_pub deploy command output](/img/blogs/update-agent-with-nodered/mqtt_command_deploy_modbus_flow.png)

The debug output confirms the broker accepted the publish (`CONNACK`, `PUBLISH`, `DISCONNECT`). The agent publishes the result back to the `res` subtopic as SenML. Subscribe to see it:

```bash
mosquitto_sub \
  -h messaging.magistrala.absmach.eu -p 8883 \
  --capath /etc/ssl/certs \
  -I "Client" \
  -u <client-id> -P <client-secret> \
  -t "m/<domain-id>/c/<channel-id>/res"
```

Expected response on the `res` topic:
```json
[{"bn":"req-1:","n":"nodered-deploy","t":1743580812.123,"vs":""}]
```

Open Node-RED on port 1880 and you will see the new **Modbus Holding Registers** tab is now active:

![Modbus flow in Node-RED after deploy](/img/blogs/update-agent-with-nodered/modbus_flow_in_nodered_after_deploy.png)

The flow immediately starts running. Check the Node-RED debug panel to confirm it is publishing SenML every 10 seconds:

![Modbus data in Node-RED debug panel](/img/blogs/update-agent-with-nodered/debug_modbus_data.png)

Backend confirmation --- the Magistrala Messages view shows all four holding-register readings arriving and being stored by the `save_senml` rule:

![Modbus data stored in Magistrala](/img/blogs/update-agent-with-nodered/modbus_data_save_mg.png)

### Fetch flows remotely

```bash
mosquitto_pub \
  -h messaging.magistrala.absmach.eu -p 8883 \
  --capath /etc/ssl/certs \
  -I "Client" \
  -u <client-id> -P <client-secret> \
  -t "m/<domain-id>/c/<channel-id>/req" \
  -m '[{"bn":"req-2:", "n":"nodered", "vs":"nodered-flows"}]'
```

Expected response on the `res` topic:
```json
[{"bn":"req-2:","n":"nodered-flows","t":1743580820.456,"vs":"[{\"id\":\"flow-speed\",\"type\":\"tab\",...}]"}]
```

The `vs` field contains the full flows JSON as a string.

### What happens step by step

![Flow Deploy Sequence](/img/blogs/update-agent-with-nodered/flow-deploy-sequence.svg)

1. Operator publishes a SenML command to the `req` topic on Magistrala
2. Magistrala delivers it to the subscribed agent on the mock device
3. Agent decodes the SenML payload and extracts the base64 flow JSON
4. Agent patches the MQTT `clientid` inside the flow to `<client-id>-nr`
5. Agent calls `POST /flows` on Node-RED's local REST API
6. Node-RED deploys the new flows and starts executing them
7. Agent publishes the result back to the `res` topic as SenML
8. Flows are now active and Node-RED begins publishing sensor data to the `data` subtopic

---

## The Example Flows

### Speed sensor (`examples/nodered/speed-flow.json`)

Simulates a speed/RPM/gear sensor publishing SenML every 15 seconds to `m/<domain-id>/c/<channel-id>/data`:

```json
[
  {"bn": "speed-sensor:", "bt": 1743580800000000000,
   "n": "speed", "u": "km/h", "v": 87},
  {"n": "rpm",   "u": "rpm",  "v": 2340},
  {"n": "gear",              "v": 4}
]
```

### Modbus holding registers (`examples/nodered/modbus-flow.json`)

Simulates polling 4 Modbus FC03 holding registers every 10 seconds:

| Register | Measurement | Unit |
|----------|-------------|------|
| HR0 | Voltage | V |
| HR1 | Current (scaled ×10) | A |
| HR2 | Power | W |
| HR3 | Temperature | °C |

Published SenML:
```json
[
  {"bn": "modbus-device:", "bt": 1743580800000000000,
   "n": "hr0", "u": "V",   "v": 231},
  {"n": "hr1", "u": "A",   "v": 14.2},
  {"n": "hr2", "u": "W",   "v": 3280},
  {"n": "hr3", "u": "Cel", "v": 47}
]
```

The Magistrala Rule Engine's `save_senml` rule stores every message automatically.

---

## Command Reference

| Command | HTTP payload | MQTT `vs` |
|---------|-------------|-----------|
| Deploy flows | `{"command":"nodered-deploy","flows":"<base64>"}` | `nodered-deploy,<base64>` |
| Fetch flows | `{"command":"nodered-flows"}` | `nodered-flows` |
| Ping | `{"command":"nodered-ping"}` | `nodered-ping` |
| Runtime state | `{"command":"nodered-state"}` | `nodered-state` |
| Add single flow | `{"command":"nodered-add-flow","flows":"<base64>"}` | `nodered-add-flow,<base64>` |

---

## Taking It to Real Hardware

The same stack runs unchanged on a real Raspberry Pi. Swap the Docker mock for the actual device:

1. Build the agent binary for ARM: `GOARCH=arm64 make all`
2. Copy `build/magistrala-agent` and `configs/config.toml` to the Pi
3. Install Node-RED on the Pi: `npm install -g --unsafe-perm node-red`
4. Run the agent (it reads credentials from `config.toml` or environment variables)
5. For a real Modbus device: replace the simulation function node in `modbus-flow.json` with a `modbus-read` node pointing to your device's IP and port

![Raspberry Pi + Modbus Architecture](/img/blogs/update-agent-with-nodered/raspi-modbus-architecture.svg)

Provisioning, flow deployment, telemetry, and MQTT commands all work identically. The mock device exists precisely to let you validate the full integration locally before touching hardware.

---

## Repository

The agent code, example flows, Docker Compose stack, and provisioning script are all available at:

[github.com/absmach/agent](https://github.com/absmach/agent)
