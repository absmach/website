---
slug: fml
title: "Running Federated Machine Learning on Propeller (Docker Compose Edition)"
description: "A practical, end-to-end guide to running federated machine learning on Propeller using Docker Compose."
date: "2026-02-23"
author:
  name: "Jeff Mboya"
  picture: "https://avatars.githubusercontent.com/u/44696487?s=96&v=4"
coverImage: "/img/blogs/federated-ml/propeller-mental-model.svg"
ogImage:
  url: "/img/blogs/federated-ml/propeller-mental-model.svg"
tags:
  - "Federated Learning"
  - "Machine Learning"
  - "Edge Computing"
  - "WebAssembly"
  - "Propeller"
category: blog
featured: false
draft: false
---

# Running Federated Machine Learning on Propeller (Docker Compose Edition)

You have machine learning models running on factory sensors, roadside traffic cameras, and mobile devices. That data is often too sensitive to share, too large to move, or simply unavailable.

But you still need one shared base model that continuously improves across all those devices.

This is exactly the problem that federated machine learning, or FML, was designed to solve. Here you will see [Propeller](https://www.absmach.eu/products/propeller/) run full federated learning end to end with [Docker Compose](https://docs.docker.com/compose/).

## What you need to know

[Propeller](https://www.absmach.eu/products/propeller/) is a [WebAssembly](https://webassembly.org/) (WASM) orchestrator designed to run your workloads reliably at the edge. You write WASM modules, push them to an [OCI registry](https://opencontainers.org/), and Propeller runs them everywhere. It handles scheduling, message routing, and task lifecycle management so you do not have to.

Federated machine learning is built on one simple idea: keep learning close to the data. Think of autocomplete and predictive text on your phone as a perfect illustrative example here. Your device learns from your typing patterns, and that personal data never leaves your phone. Instead, it occasionally sends a small update describing what it learned, never the actual text. Those updates from millions of phones are combined together to improve one shared global model. The model improves for everyone without collecting private data or moving large datasets across networks.

The key point is that federated learning in Propeller is not a separate execution mode. There is no special "FML runner" hiding somewhere deep inside the Propeller system at all. It is simply the same WASM task runner you would use for any other workload.

The only thing that changes between a regular task and a federated one is context. When those variables are set, the [Proplet](https://www.absmach.eu/products/propeller/) immediately knows it is in a federated round. It fetches the model from the model registry and the training dataset from the local data store, passes both to your WASM module as environment variables, and sends the resulting update to the coordinator once training completes. For the operator, it looks like any ordinary WASM task running on the edge device.

For more detailed information about all component behavior and configuration, refer to the [Propeller docs](https://www.absmach.eu/products/propeller/).

![Simple view of who does what in federated learning: operator, devices, coordinator, and model store](/img/blogs/federated-ml/simple-who-does-what.svg)

This diagram shows four roles: operator, devices, coordinator, and the model store that saves progress.

## The key idea

Any task that launches with `ROUND_ID` in its environment is automatically a federated learning round. There is absolutely no special or separate execution mode that you need to enable here. From the Proplet's own point of view, it is still just running a WASM task.

What actually changes between a normal workload and a federated one is only the context.

When `ROUND_ID`, `MODEL_URI`, and `HYPERPARAMS` are all present, the Proplet follows this slightly different flow:

- it fetches the base model from the model registry by resolving the version from `MODEL_URI` and calling `GET /models/{version}`, then injects the result as `MODEL_DATA` into the WASM environment
- it fetches the training dataset for this device from the local data store at `DATA_STORE_URL/datasets/{proplet_id}`, then injects it as `DATASET_DATA` into the WASM environment
- it runs your WASM training code, which reads both variables directly from its environment without making any network calls
- the WASM module outputs a JSON model update to stdout, which the Proplet captures
- the Proplet POSTs that update to the coordinator at `COORDINATOR_URL/update`
- once enough devices have reported back, the coordinator delegates aggregation to a separate aggregator service, which applies the [Federated Averaging](https://arxiv.org/abs/1602.05629) algorithm and returns the new model
- the coordinator saves the aggregated model to the model registry as a new version

Propeller keeps this simple by building everything on three objects:

- Task: one piece of WASM code that runs a single training job on one device. In federated learning, it is a training workload started with a few extra environment variables.
- Round: the same training task deployed and run across many devices at the same time. Each participating device trains on local data, sends back one small update, and then stops.
- Experiment: the high-level structure that stitches multiple rounds together into a full federated learning process. It defines participating devices, training configuration, how many updates are needed, and the stopping condition.

![Simple decision flow showing when a task runs normally versus federated learning mode](/img/blogs/federated-ml/simple-decision-flow.svg)

With `ROUND_ID` set, the Proplet trains locally and sends an update; otherwise it runs normally.

The same task runner you already use is applied repeatedly with just a little coordination.

## Demo services

The Docker Compose demo runs six FL-specific services alongside the standard Propeller stack:

- **manager**: the Propeller manager, extended with FL endpoints. `POST /fl/experiments` is the entry point for starting a round; it forwards the config to the coordinator and then fans out one task per participant via MQTT.
- **coordinator-http** (port 8086): tracks active rounds, collects model updates, triggers aggregation once k-of-n updates arrive, and saves the result to the model registry. Also publishes a round-complete notification to MQTT topic `fl/rounds/next`.
- **aggregator** (port 8085): a stateless HTTP service. The coordinator calls `POST /aggregate` with all updates; the aggregator applies Federated Averaging and returns the combined model.
- **model-registry** (port 8084): a versioned HTTP store for global model checkpoints. Each round produces a new version.
- **local-data-store** (port 8083): seeds and serves per-device training datasets. On startup it auto-seeds a synthetic dataset for each proplet ID listed in the environment. Proplets call `GET /datasets/{proplet_id}` to fetch their local training data.
- **local-registry** (port 5000): a local [OCI registry](https://opencontainers.org/) for serving the FL WASM client image without pushing to an external registry.

## Minimal model used in this demo

To keep things simple, this demo example uses a [logistic regression](https://en.wikipedia.org/wiki/Logistic_regression) model for binary classification.

The model itself is intentionally small and straightforward, making it very easy to reason about. Represented as a JSON object, it has two parts: a weights array and a bias. For three input features, the model starts with three weights and one bias, all zero.

```json
{
  "w": [0.0, 0.0, 0.0],
  "b": 0.0
}
```

The model lives in a model registry, an HTTP service that tracks global model versions. Each stored version of the global model is uniquely referenced by a URI like `fl/models/global_model_v0`. After each round, combined updates are saved as a new version of the global model. Over time, this gives you a clear, versioned history showing exactly how the model evolves.

## How training works

Each Proplet receives the current model and trains it locally using only its own data. Before the WASM module runs, the Proplet fetches the model from the model registry and the training dataset from the local data store, then injects both as environment variables (`MODEL_DATA` and `DATASET_DATA`). The WASM module reads them directly without making any network calls.

The training process follows standard logistic regression updated via [stochastic gradient descent](https://en.wikipedia.org/wiki/Stochastic_gradient_descent) on each example.

For each example, the Proplet predicts, compares to the label, and adjusts the model slightly. All of this happens entirely on the device itself, using only the local data available. Critically, no raw training samples from the device are ever shared with any other participant.

Once training is complete, the WASM module writes its update to stdout as JSON. The Proplet captures that output and POSTs it to the coordinator. The update includes the trained weights and bias, the sample count, and the starting model version.

![Simple round loop: share model, train locally, send updates, combine updates, and repeat](/img/blogs/federated-ml/simple-round-loop.svg)

Send model out, train locally, collect updates, combine them, then repeat with the improved model.

## How aggregation works

The coordinator's primary job is to collect model updates from all of the participating Proplets. Once the required number of updates arrive, the coordinator calls the aggregator service at `POST /aggregate` with all collected updates. The aggregator applies the [Federated Averaging](https://arxiv.org/abs/1602.05629) algorithm and returns the combined model, which the coordinator then saves to the model registry as a new version.

Devices that trained on more data always contribute proportionally more to the final aggregated result. Aggregation produces new weights and a bias capturing everything all devices collectively learned that round.

![Simple privacy and bandwidth story comparing raw data upload with federated updates](/img/blogs/federated-ml/simple-privacy-story.svg)

Raw data stays put on devices; only lightweight model update payloads move across the network.

## Run the FML demo with Docker Compose

Use the repo root as your working directory for every command shown in this guide. First, set a reusable compose command:

```bash
COMPOSE="docker compose -f docker/compose.yaml -f examples/fl-demo/compose.yaml --env-file docker/.env"
```

### 1. Build and start services

Bring everything up and confirm all key services are healthy:

```bash
$COMPOSE up -d --build
$COMPOSE ps

curl -sS http://localhost:7070/health | jq .
curl -sS http://localhost:8086/health | jq .
curl -sS http://localhost:8085/health | jq .
curl -sS http://localhost:8083/health | jq .
```

When things are working, containers appear in `Up` state and all health endpoints return JSON.

### 2. Provision [SuperMQ](https://docs.supermq.absmach.eu/) resources

If you are running the demo against a fresh volume (or you just wiped state), run the provisioning script:

```bash
(cd examples/fl-demo && python3 provision-smq.py)
```

That script writes updated credentials into `docker/.env`, so restart the key services to pick them up:

```bash
$COMPOSE up -d --force-recreate manager coordinator-http proplet proplet-2 proplet-3 proxy local-data-store
$COMPOSE ps manager coordinator-http proplet proplet-2 proplet-3 proxy local-data-store
```

The local data store is included because it uses proplet IDs from `docker/.env` to seed per-device training datasets on startup.

### 3. Build and push the FL WASM client image

If a usable image from a previous build exists, skip ahead and just reuse it. Otherwise, build the WASM binary:

```bash
cd examples/fl-demo/client-wasm
GOOS=wasip1 GOARCH=wasm go build -o fl-client.wasm fl-client.go
cd ../../..
```

Now push it to the local OCI registry using [ORAS](https://oras.land/):

```bash
docker run --rm \
  -v "$(pwd)/examples/fl-demo/client-wasm:/workspace" \
  -w /workspace \
  --network host \
  ghcr.io/oras-project/oras:v1.3.0 \
  push localhost:5000/fl-client-wasm:latest \
  fl-client.wasm:application/wasm
```

A quick sanity check:

```bash
docker run --rm \
  --network host \
  ghcr.io/oras-project/oras:v1.3.0 \
  manifest fetch localhost:5000/fl-client-wasm:latest | jq .
```

Set the image reference you will pass into the experiment payload:

```bash
TASK_WASM_IMAGE="local-registry:5000/fl-client-wasm:latest"
echo "$TASK_WASM_IMAGE"
```

### 4. Confirm Proplets are registered

List Proplets and confirm they are alive:

```bash
curl -sS http://localhost:7070/proplets | jq '.proplets[] | {id,name,alive}'
```

Always use the `id` values, which are UUIDs, when specifying participants in your experiment payload. Instance labels like `proplet-1` are only for Docker and will not work as participant identifiers.

If you want to pull them directly from `docker/.env`, export them like this:

```bash
export PROPLET_CLIENT_ID=$(grep '^PROPLET_CLIENT_ID=' docker/.env | grep -v '=""' | tail -1 | cut -d '=' -f2 | tr -d '"')
export PROPLET_2_CLIENT_ID=$(grep '^PROPLET_2_CLIENT_ID=' docker/.env | cut -d '=' -f2 | tr -d '"')
export PROPLET_3_CLIENT_ID=$(grep '^PROPLET_3_CLIENT_ID=' docker/.env | cut -d '=' -f2 | tr -d '"')

echo "$PROPLET_CLIENT_ID"
echo "$PROPLET_2_CLIENT_ID"
echo "$PROPLET_3_CLIENT_ID"
```

### 5. Initialize the model registry (v0)

This demo always begins from a simple all-zero model so each training round starts clean. Create it once:

```bash
curl -sS -X POST http://localhost:8084/models \
  -H "Content-Type: application/json" \
  -d '{
    "version": 0,
    "model": {
      "w": [0.0, 0.0, 0.0],
      "b": 0.0
    }
  }' | jq .
```

Then confirm it exists:

```bash
curl -sS http://localhost:8084/models/0 | jq .
```

Rerunning this demo often means a v0 model may already exist from an earlier session. In that case, you can also guard the create step:

```bash
if ! curl -fsS http://localhost:8084/models/0 >/dev/null; then
  curl -sS -X POST http://localhost:8084/models \
    -H "Content-Type: application/json" \
    -d '{
      "version": 0,
      "model": {
        "w": [0.0, 0.0, 0.0],
        "b": 0.0
      }
    }' | jq .
fi
```

### 6. Configure and start an experiment

At this point you are fully ready to kick off a real federated training round. Create a unique round ID and experiment ID, then call the manager API:

```bash
TS=$(date +%s)
ROUND_ID="r-$TS"
EXPERIMENT_ID="exp-$TS"
MODEL_REF="fl/models/global_model_v0"

curl -sS -X POST http://localhost:7070/fl/experiments \
  -H "Content-Type: application/json" \
  -d "{
    \"experiment_id\": \"$EXPERIMENT_ID\",
    \"round_id\": \"$ROUND_ID\",
    \"model_ref\": \"$MODEL_REF\",
    \"participants\": [\"$PROPLET_CLIENT_ID\", \"$PROPLET_2_CLIENT_ID\", \"$PROPLET_3_CLIENT_ID\"],
    \"hyperparams\": {\"epochs\": 1, \"lr\": 0.01, \"batch_size\": 16},
    \"k_of_n\": 3,
    \"timeout_s\": 60,
    \"task_wasm_image\": \"$TASK_WASM_IMAGE\"
  }" | jq .
```

You should receive a response confirming that the experiment has been successfully configured and accepted. The manager forwards the config to the coordinator, then publishes a round-start message over MQTT. The manager's MQTT subscriber picks that up and creates one task per participant, each with `ROUND_ID`, `MODEL_URI`, and `HYPERPARAMS` set in the task environment.

### 7. Watch the round run

First, confirm tasks were created for your round:

```bash
curl -sS http://localhost:7070/tasks \
  | jq --arg rid "$ROUND_ID" '.tasks[] | select(.name | startswith("fl-round-"+$rid)) | {id,name,state,proplet_id}'
```

You should see exactly three tasks listed in the output, one task for each participant.

You can also watch the manager logs for that round ID:

```bash
$COMPOSE logs manager | grep "$ROUND_ID"
```

Finally, ask the coordinator whether the round is complete:

```bash
curl -sS http://localhost:8086/rounds/$ROUND_ID/complete | jq .
```

When the round is done, you will see a response like:

```json
{
  "round_id": "r-1735689600",
  "completed": true,
  "num_updates": 3
}
```

### 8. Verify aggregation and the new global model

Once the round completes, the coordinator will have called the aggregator and saved a new model version.

Check the coordinator logs for this round:

```bash
$COMPOSE logs coordinator-http | grep "$ROUND_ID"
```

Check the aggregator logs:

```bash
$COMPOSE logs fl-demo-aggregator | grep -i "aggregat"
```

Fetch model version 1:

```bash
curl -sS http://localhost:8084/models/1 | jq .
```

Compare it to v0:

```bash
echo "Model v0:"
curl -sS http://localhost:8084/models/0 | jq .

echo "Model v1:"
curl -sS http://localhost:8084/models/1 | jq .
```

Success means the weights and bias values in v1 will differ from the all-zero v0.

### 9. Run a second round

Federated learning gets more interesting and useful when you run it through multiple successive rounds. Start a second round from `v1` to produce `v2`:

```bash
TS2=$(date +%s)
ROUND_ID_2="r-$TS2"
EXPERIMENT_ID_2="exp-$TS2"
MODEL_REF_2="fl/models/global_model_v1"

curl -sS -X POST http://localhost:7070/fl/experiments \
  -H "Content-Type: application/json" \
  -d "{
    \"experiment_id\": \"$EXPERIMENT_ID_2\",
    \"round_id\": \"$ROUND_ID_2\",
    \"model_ref\": \"$MODEL_REF_2\",
    \"participants\": [\"$PROPLET_CLIENT_ID\", \"$PROPLET_2_CLIENT_ID\", \"$PROPLET_3_CLIENT_ID\"],
    \"hyperparams\": {\"epochs\": 1, \"lr\": 0.01, \"batch_size\": 16},
    \"k_of_n\": 3,
    \"timeout_s\": 60,
    \"task_wasm_image\": \"$TASK_WASM_IMAGE\"
  }" | jq .
```

Then check completion and fetch the new model:

```bash
curl -sS http://localhost:8086/rounds/$ROUND_ID_2/complete | jq .
curl -sS http://localhost:8084/models/2 | jq .
```

## Optional: run one federated task manually

Sometimes you want full control over a single device, or you are debugging one participant. In that case, you can bypass experiment orchestration and run a single federated task directly.

Create the task:

```bash
curl -sS -X POST http://localhost:7070/tasks \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"fl-manual-$ROUND_ID\",
    \"image_url\": \"$TASK_WASM_IMAGE\",
    \"proplet_id\": \"$PROPLET_CLIENT_ID\",
    \"env\": {
      \"ROUND_ID\": \"manual-$ROUND_ID\",
      \"MODEL_URI\": \"fl/models/global_model_v0\",
      \"HYPERPARAMS\": \"{\\\"epochs\\\":1,\\\"lr\\\":0.01,\\\"batch_size\\\":16}\",
      \"COORDINATOR_URL\": \"http://coordinator-http:8080\",
      \"MODEL_REGISTRY_URL\": \"http://model-registry:8081\",
      \"DATA_STORE_URL\": \"http://local-data-store:8083\"
    }
  }" | jq .
```

Start the task:

```bash
TASK_ID="<task-id-from-response>"
curl -sS -X POST http://localhost:7070/tasks/$TASK_ID/start | jq .
```

For complete task lifecycle documentation and full API details, refer to the [Propeller API docs](https://www.absmach.eu/docs/propeller/manager).

## Limitations and good practices

Federated learning assumes every device in a round can reach the coordinator, model registry, and local data store. If a device is offline or intermittently connected, it will not contribute to that round. Always choose timeout values that accurately reflect the real network conditions of your deployment environment.

Keep in mind that each individual Proplet typically runs only one task at a time. When a device is already busy, newly scheduled tasks will simply wait until it finishes. For higher system throughput in production, try to avoid scheduling too many tasks per device.

Model size has a significant impact on how quickly rounds can complete across your devices. Large models take considerably longer to fetch and they produce much larger update payloads too. Start with small models first, then scale up gradually once the training flow is stable.

You should be very careful when choosing the `k_of_n` setting, as it affects fault tolerance. If it equals the total number of participants, a single failure will block the round. Lowering `k_of_n` below the total participant count gives your system practical and valuable fault tolerance.

Timeout values should account for model fetch time, dataset fetch time, local training time, and overall network latency. Short timeouts are fine for small local experiments, but production workloads usually need more headroom.

If your WASM image registry requires authentication, make absolutely sure your credentials are configured correctly. Proplets must be fully able to fetch training images and model files without manual intervention.

Finally, the coordinator and aggregator are critical components and deserve very careful operational attention. If either goes down, active training rounds will stall. In production, plan for failure through redundancy or recovery so training can always continue.
