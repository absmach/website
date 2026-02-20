---
slug: running-proplet-in-tee
title: "Running Proplet in TEE Environments"
description: Deploy and run WebAssembly workloads securely with Proplet inside Trusted Execution Environments using Intel TDX and AMD SEV.
date: "2026-02-20"
author:
  name: "Rodney Osodo"
  picture: "https://avatars.githubusercontent.com/u/28790446?v=4"
coverImage: "/img/blogs/running-proplet-in-tee/homepage.jpg"
ogImage:
  url: "/img/blogs/running-proplet-in-tee/homepage.jpg"
tags:
  - "Propeller"
  - "TEE"
  - "WASM"
  - "SuperMQ"
  - "Security"
category: blog
---

In today's cloud-native landscape, securing sensitive workloads during execution is paramount. Organizations require not just encryption at rest and in transit, but also protection during computation. This is where Trusted Execution Environments (TEEs) combined with WebAssembly (Wasm) runtimes create a powerful paradigm for confidential computing. Proplet, built on this foundation, enables secure execution of WebAssembly workloads within hardware-protected enclaves, ensuring that even cloud providers cannot access your data during processing.

![Proplet TEE Architecture](/images/tee/architecture.svg)

This guide explores how to deploy Proplet inside TEE environments, leveraging hardware-based isolation to execute WebAssembly workloads with confidentiality and integrity guarantees.

## Understanding the TEE Landscape

A [Trusted Execution Environment](https://en.wikipedia.org/wiki/Trusted_execution_environment) (TEE) is a secure area inside a processor that protects code and data from unauthorized access through hardware-based isolation. TEEs ensure that even privileged software, system administrators, or cloud providers cannot read or modify workload data during execution.

### Modern TEE Technologies

The confidential computing ecosystem currently supports several hardware-based TEE implementations:

- **Intel TDX** (Trust Domain Extensions) — Full VM-level isolation for confidential virtual machines
- **AMD SEV-SNP** (Secure Encrypted Virtualization with Secure Nested Paging) — Hardware-encrypted virtual machines
- **Intel SGX** (Software Guard Extensions) — Application-level enclaves for process isolation

Proplet leverages TDX and SEV-SNP to provide VM-level isolation, enabling entire WebAssembly runtime environments to execute within protected memory regions.

## Why WebAssembly in TEEs?

WebAssembly offers several compelling advantages for confidential computing workloads:

1. **Minimal TCB** — WebAssembly's compact runtime keeps the Trusted Computing Base small and auditable
2. **Portability** — Wasm modules run consistently across different TEE implementations
3. **Performance** — Near-native execution speed with hardware acceleration
4. **Sandboxing** — Built-in isolation model complements TEE security boundaries
5. **Lightweight** — Reduced memory footprint compared to container-based solutions

By combining Wasm with hardware TEEs, Proplet provides defense-in-depth: software-level sandboxing within hardware-enforced isolation.

## Proplet TEE Architecture

Proplet's TEE integration follows a layered security model:

![Proplet Architecture](/img/blogs/running-proplet-in-tee/proplet-arch.svg)

### Component Interaction Flow

1. **Detection** — Proplet detects TEE capabilities at startup (`/dev/tdx_guest`, `/dev/sev-guest`, TSM support)
2. **Task Receipt** — Manager publishes encrypted workload requests via MQTT
3. **Image Pull** — Proplet downloads encrypted OCI images from container registries
4. **Attestation** — Attestation Agent generates hardware-backed proof of TEE environment
5. **Key Retrieval** — Key Broker Service validates attestation and releases decryption keys
6. **Decryption** — Image layers are decrypted inside the protected memory region
7. **Execution** — Wasmtime executes the Wasm module within the TEE
8. **Results** — Encrypted results are published back to Manager via MQTT

![Attestation Flow](/images/tee/attestation.svg)

## Hardware Abstraction Layer (HAL)

Proplet provides a Hardware Abstraction Layer that automates the creation and configuration of Confidential VMs. The HAL script — [hal/ubuntu/qemu.sh](https://github.com/absmach/propeller/blob/main/hal/ubuntu/qemu.sh) — handles the entire lifecycle from image building to VM execution.

### What HAL Does

The script operates in two phases controlled by positional arguments:

- **`build`** — Downloads Ubuntu Noble cloud image, creates QCOW2 disk, generates cloud-init configuration with credentials, packages, and systemd services
- **`run`** — Detects TDX/SEV support, assembles QEMU command for confidential mode, boots the VM
- **`all`** (default) — Executes both phases sequentially

On first boot, cloud-init automatically:

1. Installs system packages (`build-essential`, `libssl-dev`, `protobuf-compiler`, `libtss2-dev`, `tpm2-tools`)
2. Installs latest Wasmtime release from GitHub
3. Compiles Attestation Agent with all attesters enabled
4. Compiles CoCo Keyprovider from source
5. Compiles Proplet from source
6. Verifies all binaries exist before enabling services
7. Enables and starts three systemd services in dependency order: `attestation-agent` → `coco-keyprovider` → `proplet`

First boot takes 10–15 minutes for compilation. Subsequent boots start all services immediately.

## Setting Up the TEE Environment

### Prerequisites

Install QEMU and cloud utilities:

```bash
sudo apt-get update
sudo apt-get install -y \
  qemu-system-x86 \
  cloud-image-utils \
  ovmf \
  wget
```

### Configuration

Export required environment variables before running the HAL script:

```bash
export PROPLET_DOMAIN_ID="a93fa93e-30d0-425e-b5d1-c93cd916dca7"
export PROPLET_CLIENT_ID="c902e51c-5eac-4a2d-a489-660b5f7ab461"
export PROPLET_CLIENT_KEY="75a0fefe-9713-478d-aafd-72032c2d9958"
export PROPLET_CHANNEL_ID="54bdaf41-0009-4d3e-bd49-6d7abda7a832"
export PROPLET_MQTT_ADDRESS="tcp://mqtt.example.com:1883"
export KBS_URL="http://10.0.2.2:8082"
```

The `KBS_URL` uses QEMU user-mode NAT address `10.0.2.2`, which maps to the host's loopback interface. If KBS runs on the host at port 8082, `http://10.0.2.2:8082` reaches it from inside the VM.

### Building and Running the CVM

Execute the HAL script as a regular user (it auto-elevates with `sudo -E` to preserve environment variables):

```bash
cd hal/ubuntu
./qemu.sh
```

For granular control, build and run separately:

```bash
./qemu.sh build
./qemu.sh run
```

### Choosing TEE Mode

The script auto-detects TDX by checking `dmesg` for `virt/tdx: module initialized` and `/proc/cpuinfo` for the `tdx` flag. It detects SEV by checking `/proc/cpuinfo` for the `sev` flag.

Override auto-detection with the `ENABLE_CVM` variable:

```bash
# Auto-detect (default)
./qemu.sh

# Force Intel TDX
ENABLE_CVM=tdx ./qemu.sh

# Force AMD SEV
ENABLE_CVM=sev ./qemu.sh

# Regular VM (no confidential computing)
ENABLE_CVM=none ./qemu.sh
```

### QEMU Configuration Details

#### Intel TDX Mode

When TDX is active, the script configures:

- `memory-backend-memfd` shared memory object
- `tdx-guest` machine object with vsock quote generation on CID 2, port 4050
- `q35` machine with `confidential-guest-support=tdx0` and `kernel-irqchip=split`
- `virtio-net-pci` with `iommu_platform=true`
- OVMF firmware via `-bios /usr/share/ovmf/OVMF.fd`

#### AMD SEV Mode

When SEV is active, the script configures:

- `sev-guest` object with `cbitpos=47` and `reduced-phys-bits=1`
- `q35` machine with `memory-encryption=sev0`
- `EPYC` CPU model
- Pflash OVMF code and per-VM OVMF vars copy

#### Regular Mode

Without CVM, the script uses `q35` with `host` CPU passthrough and the same pflash OVMF drives.

### Port Forwarding

All modes forward these ports from host to guest:

| Host Port | Guest Port | Service                    |
| --------- | ---------- | -------------------------- |
| `2222`    | `22`       | SSH                        |
| `50010`   | `50010`    | Attestation Agent gRPC API |
| `50011`   | `50011`    | CoCo Keyprovider gRPC API  |

## Key Broker Service (KBS) Setup

The server-side attestation stack is provided by [Trustee](https://github.com/confidential-containers/trustee), consisting of three components:

- **KBS** (Key Broker Service) — Stores encryption keys and validates attestation reports
- **AS** (Attestation Service) — Verifies TEE evidence submitted by guests
- **RVPS** (Reference Value Provider Service) — Manages reference values for evidence verification

### Starting Trustee with Docker Compose

```bash
git clone https://github.com/confidential-containers/trustee
cd trustee
openssl genpkey -algorithm ed25519 > kbs/config/private.key
openssl pkey -in kbs/config/private.key -pubout -out kbs/config/public.pub
docker compose up -d
```

This starts KBS on `http://localhost:8080` (configurable in `docker-compose.yml`).

![KBS Setup](/images/tee/kbs-setup.svg)

### Generating and Uploading Encryption Keys

Create a random encryption key:

```bash
openssl rand -base64 32 | tr -d '\n' > private_key
```

Build the KBS client tool:

```bash
cargo build --release
```

Upload the key to KBS:

```bash
./target/release/kbs-client \
  --url http://localhost:8082 \
  config \
  --auth-private-key kbs/config/private.key \
  set-resource \
  --resource-file private_key \
  --path default/key/propeller-wasm
```

### Configuring Resource Policy

For testing outside a TEE, set a permissive policy (production deployments should use strict attestation policies):

```bash
./target/release/kbs-client \
  --url http://127.0.0.1:8082 \
  config \
  --auth-private-key kbs/config/private.key \
  set-resource-policy \
  --policy-file kbs/sample_policies/allow_all.rego
```

Verify the key is retrievable:

```bash
./target/release/kbs-client \
  --url http://127.0.0.1:8082 \
  get-resource --path default/key/propeller-wasm
```

## Encrypting WebAssembly Workloads

### Pushing Wasm to a Registry

Use `wasm-to-oci` to push the Wasm module as an OCI artifact:

```bash
wasm-to-oci push build/workload.wasm \
  docker.io/your-username/tee-wasm-workload:latest \
  --server "docker.io"
```

### Encrypting the Image

Create an output directory and encrypt the image with the CoCo Keyprovider container:

```bash
mkdir -p output

docker run \
  -v "$PWD/output:/output" \
  docker.io/rodneydav/coco-keyprovider:latest \
  /encrypt.sh -k "$(cat ./private_key)" \
  -i kbs:///default/key/propeller-wasm \
  -s docker://docker.io/your-username/tee-wasm-workload:latest \
  -d dir:/output
```

The output directory contains encrypted OCI layers:

```
output/
├── 44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a
├── 76fa8c842f7ee81acc35aa4805f6ad0da144c1f092bc0ce4ecfc4cadf820f7a1
├── manifest.json
└── version
```

![Image Encryption](/images/tee/image-encryption.svg)

### Pushing Encrypted Image to Registry

```bash
skopeo login docker.io
skopeo copy dir:$(pwd)/output \
  docker://your-username/tee-wasm-workload:encrypted
```

## Accessing the Confidential VM

### Console Access

After the VM boots, press `Enter` at the console and log in with:

- **Username**: `propeller`
- **Password**: `propeller`

### SSH Access

SSH is available on the forwarded port:

```bash
ssh -p 2222 propeller@localhost
```

## Verifying Service Status

Check all three systemd services:

```bash
sudo systemctl status attestation-agent coco-keyprovider proplet
```

View real-time logs:

```bash
sudo journalctl -u attestation-agent -f
sudo journalctl -u coco-keyprovider -f
sudo journalctl -u proplet -f
```

Proplet logs on successful startup:

```
2026-02-17T16:16:09.874334Z  INFO Starting Proplet (Rust) - Instance ID: c03a17a9-008c-4d8d-9578-9c91121ca3c9
2026-02-17T16:16:09.874451Z  INFO MQTT client created (TLS: false)
2026-02-17T16:16:09.874516Z  INFO Using external Wasm runtime: /usr/local/bin/wasmtime
2026-02-17T16:16:09.874582Z  INFO Starting MQTT event loop
2026-02-17T16:16:09.901874Z  INFO Starting PropletService
2026-02-17T16:16:09.901921Z  INFO Published discovery message
2026-02-17T16:16:09.901926Z  INFO Subscribed to topic: m/a93fa93e-30d0-425e-b5d1-c93cd916dca7/c/54bdaf41-0009-4d3e-bd49-6d7abda7a832/control/manager/start
```

### Proplet TEE Detection

Proplet logs TEE detection during startup:

```
AMD SEV Detection:
  - AMD CPU: false
  - /dev/sev-guest: false
  - /dev/sev: false
  - TSM support: true
Intel TDX Detection:
  - Intel CPU: true
  - /dev/tdx_guest: true
  - TSM support: true
  - TDX CPU flag: true
2026-02-18T09:06:29.099082Z  INFO TEE runtime initialized successfully
```

## Deploying Encrypted Workloads

Create a task manifest for the encrypted Wasm workload:

```json
{
  "name": "confidential-inference",
  "image_url": "docker.io/your-username/tee-wasm-workload:encrypted",
  "kbs_resource_path": "default/key/propeller-wasm",
  "encrypted": true,
  "cli_args": ["--invoke", "process"],
  "inputs": ["sensitive-data"]
}
```

Critical fields for encrypted workloads:

- `encrypted: true` — Instructs Proplet to use TEE runtime and attestation
- `image_url` — Location of encrypted OCI image
- `kbs_resource_path` — Path to decryption key in KBS (must match the path used during encryption)
- Omit `file` field for encrypted workloads (use `image_url` instead)

### Execution Flow

When the Manager publishes this task:

1. Proplet receives the task via MQTT
2. Downloads encrypted OCI image from registry
3. Attestation Agent generates TEE evidence from hardware
4. CoCo Keyprovider contacts KBS with attestation proof
5. KBS validates attestation and releases decryption key
6. Keyprovider decrypts image layers inside TEE memory
7. Wasmtime executes the decrypted Wasm module
8. Results are encrypted and published back to Manager

![Encrypted Task Execution](/images/tee/encrypted-task-execution.svg)

### Verifying Execution

Example task result:

```json
{
  "id": "37945482-a49f-4f2a-b719-655b590a5e63",
  "name": "confidential-inference",
  "kind": "standard",
  "state": 3,
  "image_url": "docker.io/your-username/tee-wasm-workload:encrypted",
  "cli_args": ["--invoke", "process"],
  "inputs": ["sensitive-data"],
  "encrypted": true,
  "kbs_resource_path": "default/key/propeller-wasm",
  "proplet_id": "c902e51c-5eac-4a2d-a489-660b5f7ab461",
  "results": "processed-output\n",
  "start_time": "2026-02-18T08:31:41.369404362Z",
  "finish_time": "2026-02-18T08:31:47.293671123Z",
  "created_at": "2026-02-18T08:31:38.015840852Z",
  "updated_at": "2026-02-18T08:31:47.293668818Z"
}
```

Proplet logs show the complete decryption and execution flow:

```
2026-02-18T09:08:36.648370Z  INFO Received start command for task: 67c8dfa8-aaa3-40e1-8679-0f18846a8b46
2026-02-18T09:08:36.649837Z  INFO Encrypted workload with image_url: docker.io/your-username/tee-wasm-workload:encrypted
2026-02-18T09:08:36.651747Z  INFO Executing task 67c8dfa8-aaa3-40e1-8679-0f18846a8b46 in spawned task
2026-02-18T09:08:44.172036Z  INFO Task 67c8dfa8-aaa3-40e1-8679-0f18846a8b46 completed successfully
2026-02-18T09:08:44.172663Z  INFO Successfully published result for task 67c8dfa8-aaa3-40e1-8679-0f18846a8b46
```

## Security Guarantees

Running Proplet inside TEEs provides multiple layers of security:

### Confidentiality

- Code and data remain encrypted until loaded into TEE memory
- Encryption keys are released only after successful remote attestation
- Memory pages are hardware-encrypted (TDX/SEV memory encryption)
- Untrusted host OS cannot inspect or modify TEE memory

### Integrity

- Attestation reports prove the exact code running inside the TEE
- Hardware measurements detect tampering with bootloader, firmware, or kernel
- Cryptographic hashes verify Wasm module integrity before execution
- TEE boundaries prevent unauthorized code injection

### Isolation

- Hardware enforces memory access controls
- DMA protection prevents peripheral devices from accessing TEE memory
- Interrupt and exception handlers are isolated from untrusted components
- Network and storage I/O can be encrypted end-to-end

### Verifiability

- Remote attestation allows third parties to verify TEE configuration
- Attestation reports include firmware versions, CPU microcode, and loaded code hashes
- Reproducible builds enable verification of Wasm module binaries
- Audit logs track workload lifecycle and attestation events

## Hardware Requirements

### Intel TDX

- **CPU**: Intel Xeon Scalable (Sapphire Rapids or later)
- **BIOS**: TDX enabled in firmware settings
- **Kernel**: Linux kernel 5.19+ with TDX support and `tdx_guest` module

Verify TDX availability:

```bash
grep tdx /proc/cpuinfo
dmesg | grep -i tdx
dmesg | grep "virt/tdx: module initialized"
```

### AMD SEV

- **CPU**: AMD EPYC processor (Milan, Genoa, or later)
- **BIOS**: SEV enabled in firmware settings
- **Kernel**: Linux kernel with SEV support

Verify SEV availability:

```bash
grep sev /proc/cpuinfo
dmesg | grep -i sev
```

## Running Multiple CVMs

Each CVM requires its own working directory to avoid file conflicts:

```bash
mkdir vm1 vm2
cp hal/ubuntu/qemu.sh vm1/ && cp hal/ubuntu/qemu.sh vm2/

# VM 1
export PROPLET_CLIENT_ID="proplet-worker-01"
export PROPLET_CLIENT_KEY="key-01"
# ... set other vars
(cd vm1 && ./qemu.sh build)

# VM 2
export PROPLET_CLIENT_ID="proplet-worker-02"
export PROPLET_CLIENT_KEY="key-02"
# ... set other vars
(cd vm2 && ./qemu.sh build)
```

Adjust port forwarding in each copy of the script to avoid host port conflicts (e.g., use ports 2223/2224 for SSH, 50012/50013 for Attestation Agent).

## Best Practices

1. **Key Management** — Rotate encryption keys regularly and use different keys for different workloads
2. **Attestation Policies** — Use strict OPA policies in production (avoid `allow_all.rego`)
3. **Network Isolation** — Use TLS for MQTT connections and encrypt all network traffic
4. **Logging** — Aggregate logs to external SIEM for security monitoring
5. **Updates** — Keep OVMF firmware, guest kernel, and attestation components updated
6. **Testing** — Verify attestation flows in non-production environments before deploying sensitive workloads
7. **Monitoring** — Track attestation failures, service restarts, and resource utilization

## Conclusion

Running Proplet inside Trusted Execution Environments combines the portability and efficiency of WebAssembly with hardware-based confidential computing. This architecture enables secure execution of sensitive workloads in untrusted environments, with cryptographic verification that your code and data remain protected even from privileged attackers.

The integration of Proplet with Intel TDX and AMD SEV provides:

- **End-to-end confidentiality** — From encrypted image distribution to in-memory execution
- **Verifiable security** — Remote attestation proves TEE configuration before releasing secrets
- **Operational simplicity** — Automated deployment via HAL with minimal manual configuration
- **Platform independence** — Wasm portability across different TEE implementations

As confidential computing becomes critical for AI/ML workloads, federated learning, and privacy-preserving computation, Proplet's TEE integration positions it as a robust platform for secure WebAssembly execution at scale.

For production deployments, combine Proplet with comprehensive monitoring, strict attestation policies, and defense-in-depth security practices to maximize the security guarantees provided by hardware TEEs.

## Additional Resources

- [Propeller GitHub Repository](https://github.com/absmach/propeller)
- [Confidential Containers Project](https://confidentialcontainers.org/)
- [Trustee Attestation Stack](https://github.com/confidential-containers/trustee)
- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [AMD SEV Documentation](https://developer.amd.com/sev/)
- [WebAssembly WASI](https://wasi.dev/)
- [Wasmtime Runtime](https://wasmtime.dev/)
