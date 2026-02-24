---
slug: fml
title: "Running Federated Machine Learning on Propeller (Docker Compose Edition)"
description: "A practical, end-to-end guide to running federated machine learning on Propeller using Docker Compose."
date: "2026-02-23"
author:
  name: "Jeff Mboya"
  picture: "https://avatars.githubusercontent.com/u/44696487?s=96&v=4"
coverImage: "/img/blogs/federated-ml/Federated__Machine_Learning.jpg"
ogImage:
  url: "/img/blogs/federated-ml/Federated__Machine_Learning.jpg"
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

You have machine learning models running on factory sensors, roadside traffic
cameras, and mobile devices. The data they produce is too large to move, too
sensitive to centralize, or collected in places that are not always online.

But you still need a single base model that improves over time.

This is the problem federated machine learning (FML) solves. In this post, you
will see how [Propeller](https://propeller.absmach.eu/) runs federated learning
end to end using [Docker Compose](https://docs.docker.com/compose/).

## What you need to know

[Propeller](https://propeller.absmach.eu/) is a
[WebAssembly](https://webassembly.org/) (WASM) orchestrator. You write your
workloads as WASM modules, push them to an
[OCI registry](https://opencontainers.org/), and Propeller takes care of running them
wherever they make sense - on edge devices or in the cloud. It handles the
unglamorous parts for you: scheduling work to the right place, moving messages
around, and managing the lifecycle of each task.

Federated machine learning builds on a simple idea: learning stays close to
where the data is created. A good example is autocomplete and predictive text
on your phone. Your device learns from how you type, and that data never leaves
your phone. Instead, it occasionally sends a small update describing what it
learned - never the actual text. Those updates are combined with updates from
millions of other phones to improve a shared model, which is then sent back
out. The model gets better for everyone, without collecting private data or
moving large datasets across the network.

The most important thing to understand is that federated learning in Propeller
is not a separate execution mode. There is not a special "FML runner" hidden
somewhere in the system. It is the same WASM task runner you would use for any
other workload.

What changes is the context. When a task is started with a small set of
environment variables - such as `ROUND_ID`, `MODEL_URI`, and `HYPERPARAMS` - the
[Proplet](https://propeller.absmach.eu/) (the edge worker)
recognizes that it is participating in a federated learning round. Instead of
just executing a one-off workload, it fetches the current model, runs your
training code locally using a local dataset, and sends the resulting update to
the coordinator. From the operator's point of view, it is still just running a
WASM task; the federated learning behavior comes automatically from the
information you pass in.

For detailed component behavior and configuration, refer to the
[Propeller docs](https://propeller.absmach.eu/).

![Simple view of who does what in federated learning: operator, devices, coordinator, and model store](/img/blogs/federated-ml/federated-ml-simple-who-does-what.svg)

This diagram shows the main roles in plain terms: you start a round, devices learn locally, the coordinator combines updates, and the model store keeps the improved version.

## The key idea

When a task starts with `ROUND_ID` set in its environment, the Proplet
immediately knows it is taking part in a federated learning round. There is no
special execution mode to enable. From the Proplet's point of view, it is still
just running a WASM task.

What changes is the context.

With `ROUND_ID`, `MODEL_URI`, and `HYPERPARAMS` present, the Proplet follows a
slightly different flow:

- it fetches the base model from the model registry using `MODEL_URI`
- if a local training dataset is available, it loads that too
- it runs your WASM training code as usual
- instead of producing a final result, it sends a model update to the
  federated learning coordinator
- once enough devices have reported back, the coordinator aggregates those
  updates and produces a new version of the model

Propeller keeps this simple by building everything on three objects:

- Task: one piece of WASM code running on one device. In federated learning,
  that task happens to be a training workload, started with a few extra
  environment variables.
- Round: the same task running across many devices once. Each device trains
  locally, sends its update, and stops.
- Experiment: stitches multiple rounds together. It defines which devices
  participate, how training is configured, how many updates are required to move
  forward, and when the whole process is done.

![Simple decision flow showing when a task runs normally versus federated learning mode](/img/blogs/federated-ml/federated-ML-fml-simple-decision-flow.svg)

This means the system checks one thing first: if it is a learning round, it trains locally and sends a small update; otherwise it runs as a normal task.

That is the core model: the same task runner you already use, applied repeatedly
with a bit more coordination.

## Minimal model used in this demo

To keep things simple, this example uses a
[logistic regression](https://en.wikipedia.org/wiki/Logistic_regression) model
for binary classification.

The model itself is small and easy to reason about. It is represented as a JSON
object with two parts: a set of weights and a bias term. In this case, there
are three input features, so the model starts with three weights and a single
bias, all initialized to zero.

```json
{
  "w": [0.0, 0.0, 0.0],
  "b": 0.0
}
```

The model is stored in a model registry - a simple HTTP service that keeps
track of different versions of the global model. Each version is referenced by
a URI, such as `fl/models/global_model_v0`. When a training round finishes and
updates are combined, a new version of the model is created and stored. Over
time, this gives you a clear, versioned history of how the model evolves.

## How training works

Each Proplet receives the current version of the model and trains it locally
using its own data. The training process follows standard logistic regression
with
[stochastic gradient descent](https://en.wikipedia.org/wiki/Stochastic_gradient_descent).

For each training example, the Proplet makes a prediction, compares it to the
true label, and adjusts the model slightly. This happens entirely on the
device, using only local data. No raw samples are shared.

Once training is done, the Proplet sends back an update. That update contains
the trained weights and bias, along with some basic metadata like how many
samples were used and which model version the training started from.

![Simple round loop: share model, train locally, send updates, combine updates, and repeat](/img/blogs/federated-ml/federated-ml-simple-round-loop.svg)

This is the full round in one line: send model out, learn on devices, collect updates, combine them, then start the next round with a better model.

## How aggregation works

The coordinator collects updates from all participating Proplets. Once enough
updates have arrived, it combines them using
[Federated Averaging](https://arxiv.org/abs/1602.05629).

Each update contributes in proportion to the amount of data used during
training. The result is a new set of weights and a new bias that reflect what
was learned across all devices in that round.

That aggregated model is then stored back in the registry as the next version
of the global model, ready to be sent out again.

![Simple privacy and bandwidth story comparing raw data upload with federated updates](/img/blogs/federated-ml/federated-ml-simple-privacy-story.svg)

The key takeaway here is that raw data stays on devices, while only lightweight learning updates move over the network.

## Run the FML demo with Docker Compose

Use the repo root for all commands. First, set a reusable compose command:

```bash
COMPOSE="docker compose -f docker/compose.yaml -f examples/fl-demo/compose.yaml --env-file docker/.env"
```

### 1. Build and start services

Bring everything up and confirm the manager and coordinator are healthy:

```bash
$COMPOSE up -d --build
$COMPOSE ps

curl -sS http://localhost:7070/health | jq .
curl -sS http://localhost:8086/health | jq .
```

If things are working, you should see your containers in `Up` state and both
health endpoints returning JSON.

### 2. Provision [SuperMQ](https://docs.supermq.absmach.eu/) resources

If you are running the demo against a fresh volume (or you just wiped state),
run the provisioning script:

```bash
(cd examples/fl-demo && python3 provision-smq.py)
```

That script writes updated credentials into `docker/.env`, so restart the key
services to pick them up:

```bash
$COMPOSE up -d --force-recreate manager coordinator-http proplet proplet-2 proplet-3 proxy
$COMPOSE ps manager coordinator-http proplet proplet-2 proplet-3 proxy
```

### 3. Build and push the FL WASM client image

If you already have a usable image, reuse it. Otherwise, build the WASM binary:

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

Use the `id` values (UUIDs) as participants. Do not use instance labels like
`proplet-1`.

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

This demo starts from a simple all-zero model. Create it once:

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

If you re-run the demo a lot, you may already have a v0. In that case, you can
also guard the create step:

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

Now you are ready to kick off a federated training round. Create a unique round
ID and experiment ID, then call the manager API:

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

You should get back a response indicating the experiment was configured. At
this point, the manager does the fan-out for you: it tells the coordinator
about the round, creates one task per participant, and injects the federated
learning environment variables each Proplet needs.

### 7. Watch the round run

First, confirm tasks were created for your round:

```bash
curl -sS http://localhost:7070/tasks \
  | jq --arg rid "$ROUND_ID" '.tasks[] | select(.name | startswith("fl-round-"+$rid)) | {id,name,state,proplet_id}'
```

You should see three tasks, one per participant.

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

Once the round completes, aggregation should have happened and a new model
version should exist.

Check the coordinator logs for this round:

```bash
$COMPOSE logs coordinator-http | grep "$ROUND_ID"
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

If everything worked, the weights and bias in v1 should differ from the all
zero values in v0.

### 9. Run a second round

Federated learning gets interesting when you repeat the process. Start a second
round from `v1` to produce `v2`:

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

Sometimes you want full control over a single device, or you are debugging one
participant. In that case, you can bypass experiment orchestration and run a
single federated task directly.

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
      \"MODEL_REGISTRY_URL\": \"http://model-registry:8081\"
    }
  }" | jq .
```

Start the task:

```bash
TASK_ID="<task-id-from-response>"
curl -sS -X POST http://localhost:7070/tasks/$TASK_ID/start | jq .
```

For task lifecycle and API details, see the
[Propeller docs](https://propeller.absmach.eu/).

## Limitations and good practices

Federated learning assumes devices can reach both the coordinator and the model
registry. If a device is offline or intermittently connected, it will not
contribute to that round. Choose timeout values that reflect real network
conditions.

Each Proplet typically runs one task at a time. If a device is already busy,
new tasks will wait. For higher throughput, avoid overloading individual
devices.

Model size matters. Large models take longer to fetch and produce larger
updates. Start with small models, then scale up once the flow is stable.

Be careful with `k_of_n`. If it equals the total number of participants, a
single failure will block the round. Lowering it gives you fault tolerance.

Timeouts should account for model fetch time, training time, and network
latency. Short timeouts are fine for small experiments, but production workloads
usually need more headroom.

If your WASM registry requires authentication, make sure credentials are
configured correctly. Proplets must be able to fetch training images and models
without manual intervention.

Finally, the coordinator matters. If it is unavailable, training rounds simply
do not finish. In production, this means planning for failure - whether that is
redundancy, recovery, or both - so model training can continue even when parts
of the system go down.
