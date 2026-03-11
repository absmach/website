---
slug: running-proplet-in-tee
title: "Running WebAssembly Workloads in TEE Environments"
description: Deploy and run WebAssembly workloads securely with Propeller inside Trusted Execution Environments using Intel TDX and AMD SEV.
date: "2026-03-11"
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

In today's cloud-native landscape, securing sensitive workloads during execution is paramount. Organizations require not just encryption at rest and in transit, but also protection during computation. This is where Trusted Execution Environments (TEEs) combined with WebAssembly (Wasm) runtimes create a powerful paradigm for confidential computing.

[Propeller](https://propeller.absmach.eu/) is a distributed WebAssembly orchestration platform designed for edge computing and IoT environments. Built on this foundation, Propeller enables secure execution of WebAssembly workloads within hardware-protected enclaves, ensuring that even cloud providers cannot access your data during processing. The platform consists of a central Manager that orchestrates workloads and Proplet agents that execute WebAssembly modules on edge devices. Propeller is developed as part of the [ELASTIC project](https://elasticproject.eu/), a European initiative focused on building secure and trustworthy edge computing infrastructure.

![Propeller TEE Architecture](/img/blogs/running-proplet-in-tee/architecture.svg)

This guide explores how to deploy Propeller's Proplet agents inside TEE environments, leveraging hardware-based isolation to execute WebAssembly workloads with confidentiality and integrity guarantees.

## Understanding the TEE Landscape

A [Trusted Execution Environment](https://en.wikipedia.org/wiki/Trusted_execution_environment) (TEE) is a secure area inside a processor that protects code and data from unauthorized access through hardware-based isolation. TEEs ensure that even privileged software, system administrators, or cloud providers cannot read or modify workload data during execution.

### Modern TEE Technologies

The confidential computing ecosystem currently supports several hardware-based TEE implementations:

- **Intel TDX** (Trust Domain Extensions) — Full VM-level isolation for confidential virtual machines
- **AMD SEV-SNP** (Secure Encrypted Virtualization with Secure Nested Paging) — Hardware-encrypted virtual machines
- **Intel SGX** (Software Guard Extensions) — Application-level enclaves for process isolation

Propeller leverages TDX and SEV-SNP to provide VM-level isolation, enabling entire WebAssembly runtime environments to execute within protected memory regions.

## Why WebAssembly in TEEs?

WebAssembly offers several compelling advantages for confidential computing workloads. Its compact runtime keeps the **Trusted Computing Base** small and auditable, making security verification practical. Wasm modules demonstrate exceptional **portability**, running consistently across different TEE implementations without modification. The technology delivers **near-native execution speed** with hardware acceleration, while built-in **sandboxing** complements TEE security boundaries for defense-in-depth protection. Additionally, WebAssembly's **lightweight** nature results in a significantly reduced memory footprint compared to container-based solutions.

By combining Wasm with hardware TEEs, Proplet provides defense-in-depth: software-level sandboxing within hardware-enforced isolation.

## Propeller TEE Architecture

Propeller's TEE integration follows a layered security model:

![Propeller Architecture](/img/blogs/running-proplet-in-tee/proplet-arch.svg)

### Component Interaction Flow

The workflow begins with **detection** as Proplet identifies TEE capabilities at startup by checking for `/dev/tdx_guest`, `/dev/sev-guest`, and TSM support. When the Manager publishes encrypted workload requests via MQTT, Proplet receives the **task** and proceeds to download encrypted OCI images from container registries. The **Attestation Agent** then generates hardware-backed proof of the TEE environment, allowing the **Key Broker Service** to validate this attestation and release decryption keys. Once authenticated, image layers are **decrypted** inside the protected memory region, enabling Wasmtime to **execute** the Wasm module within the TEE. Finally, encrypted results are published back to the Manager via MQTT, completing the secure execution cycle.

![Attestation Flow](/img/blogs/running-proplet-in-tee/attestation.svg)

## Hardware Abstraction Layer (HAL)

Proplet provides a Hardware Abstraction Layer that automates the creation and configuration of Confidential VMs. The HAL script — [hal/ubuntu/qemu.sh](https://github.com/absmach/propeller/blob/main/hal/ubuntu/qemu.sh) — handles the entire lifecycle from image building to VM execution.

### What HAL Does

The script operates in two phases controlled by positional arguments:

- **`build`** — Downloads Ubuntu Noble cloud image, creates QCOW2 disk, generates cloud-init configuration with credentials, packages, and systemd services
- **`run`** — Detects TDX/SEV support, assembles QEMU command for confidential mode, boots the VM
- **`all`** (default) — Executes both phases sequentially

On first boot, cloud-init automatically orchestrates the complete build and deployment process. It begins by installing essential system packages including `build-essential`, `libssl-dev`, `protobuf-compiler`, `libtss2-dev`, and `tpm2-tools`. The setup continues by pulling the latest Wasmtime release from GitHub, then compiling the Attestation Agent with all attesters enabled, followed by building both the CoCo Keyprovider and Proplet from source. Before proceeding, the system verifies that all binaries exist successfully. Finally, it enables and starts three systemd services in strict dependency order: `attestation-agent` → `coco-keyprovider` → `proplet`.

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

When TDX is active, the script configures a comprehensive confidential computing environment. It sets up a `memory-backend-memfd` shared memory object and creates a `tdx-guest` machine object with vsock quote generation on CID 2, port 4050. The `q35` machine type is configured with `confidential-guest-support=tdx0` and `kernel-irqchip=split` for proper interrupt handling. Network virtualization uses `virtio-net-pci` with `iommu_platform=true` for DMA protection, and the system boots with OVMF firmware via `-bios /usr/share/ovmf/OVMF.fd`.

#### AMD SEV Mode

When SEV is active, the script configures an environment optimized for AMD's confidential computing. It creates a `sev-guest` object with `cbitpos=47` and `reduced-phys-bits=1` for memory encryption, then boots a `q35` machine with `memory-encryption=sev0` to enable hardware-level protection. The system uses the `EPYC` CPU model for proper virtualization support and configures pflash OVMF firmware with per-VM OVMF variables for secure boot and configuration isolation.

#### Regular Mode

Without CVM, the script uses `q35` with `host` CPU passthrough and the same pflash OVMF drives.

### Port Forwarding

All TEE modes automatically forward specific ports from the host to the guest VM for communication and management. The SSH service is accessible on port 2222 (host) to port 22 (guest), while the Attestation Agent gRPC API is available on port 50010 on both host and guest. The CoCo Keyprovider gRPC API uses port 50011 similarly for secure key exchange operations.

| Host Port | Guest Port | Service                    |
| --------- | ---------- | -------------------------- |
| `2222`    | `22`       | SSH                        |
| `50010`   | `50010`    | Attestation Agent gRPC API |
| `50011`   | `50011`    | CoCo Keyprovider gRPC API  |

## Key Broker Service (KBS) Setup

The server-side attestation stack is provided by [Trustee](https://github.com/confidential-containers/trustee), consisting of three integrated components. The **Key Broker Service (KBS)** stores encryption keys and validates attestation reports before releasing secrets. The **Attestation Service (AS)** verifies TEE evidence submitted by guests, ensuring that the environment meets security requirements. Completing the stack, the **Reference Value Provider Service (RVPS)** manages reference values for evidence verification, providing the baseline against which guest attestations are compared.

### Starting Trustee with Docker Compose

```bash
git clone https://github.com/confidential-containers/trustee
cd trustee
openssl genpkey -algorithm ed25519 > kbs/config/private.key
openssl pkey -in kbs/config/private.key -pubout -out kbs/config/public.pub
docker compose up -d
```

This starts KBS on `http://localhost:8080` (configurable in `docker-compose.yml`).

![KBS Setup](/img/blogs/running-proplet-in-tee/kbs-setup.svg)

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

For testing outside a TEE, you can set a permissive policy. However, production deployments should always use strict attestation policies to maintain security:

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

![Image Encryption](/img/blogs/running-proplet-in-tee/image-encryption.svg)

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

Critical fields for encrypted workloads ensure proper security and execution. The `encrypted: true` field instructs Proplet to use the TEE runtime and attestation, while `image_url` specifies the location of the encrypted OCI image. The `kbs_resource_path` field defines the path to the decryption key in KBS, which must match the exact path used during encryption. Importantly, you should omit the `file` field for encrypted workloads and use `image_url` instead.

### Execution Flow

When the Manager publishes this task, the secure execution begins. Proplet receives the task via MQTT and immediately downloads the encrypted OCI image from the registry. The Attestation Agent then generates TEE evidence directly from the hardware, creating cryptographic proof of the trusted environment. The CoCo Keyprovider contacts the KBS with this attestation proof, and upon successful validation, KBS releases the decryption key. The Keyprovider then decrypts the image layers exclusively inside TEE memory, ensuring they never exist in plaintext outside the protected region. Wasmtime executes the decrypted Wasm module securely, and finally, the results are encrypted and published back to the Manager via MQTT.

![Encrypted Task Execution](/img/blogs/running-proplet-in-tee/encrypted-task-execution.svg)

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

Running Proplet inside TEEs ensures that code and data remain encrypted until they are loaded into TEE memory. Encryption keys are released only after successful remote attestation, preventing unauthorized access. Memory pages benefit from hardware encryption through TDX or SEV memory encryption technologies, and even the untrusted host OS cannot inspect or modify TEE memory contents.

### Integrity

The TEE architecture guarantees integrity through multiple mechanisms. Attestation reports provide cryptographic proof of the exact code running inside the TEE, while hardware measurements immediately detect any tampering with bootloader, firmware, or kernel components. Cryptographic hashes verify Wasm module integrity before execution, and TEE boundaries effectively prevent unauthorized code injection or modification.

### Isolation

Hardware-enforced memory access controls form the foundation of isolation, with DMA protection preventing peripheral devices from accessing TEE memory regions. Interrupt and exception handlers are completely isolated from untrusted components, and network and storage I/O can be encrypted end-to-end for additional security.

### Verifiability

Remote attestation enables third parties to independently verify TEE configuration and ensure the environment meets security requirements. Attestation reports include comprehensive details such as firmware versions, CPU microcode, and loaded code hashes. Reproducible builds allow verification of Wasm module binaries, and comprehensive audit logs track the complete workload lifecycle and all attestation events for compliance and monitoring.

## Hardware Requirements

### Intel TDX

To run TDX, you need an Intel Xeon Scalable processor (Sapphire Rapids or later) with TDX enabled in the BIOS firmware settings. The system requires a [Linux kernel version 6.2](https://www.phoronix.com/news/Intel-TDX-Guest-Driver-Linux) or later that includes TDX support and the `tdx_guest` module.

Verify TDX availability:

```bash
grep tdx /proc/cpuinfo
dmesg | grep -i tdx
dmesg | grep "virt/tdx: module initialized"
```

### AMD SEV

For AMD SEV support, you need an AMD EPYC processor (Milan, Genoa, or later) with SEV enabled in the BIOS firmware settings. The system must run a Linux kernel with SEV support enabled.

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

## Conclusion

Running Proplet inside Trusted Execution Environments combines the portability and efficiency of WebAssembly with hardware-based confidential computing. This architecture enables secure execution of sensitive workloads in untrusted environments, with cryptographic verification that your code and data remain protected even from privileged attackers.

The integration of Propeller with Intel TDX and AMD SEV provides comprehensive security capabilities. It delivers **end-to-end confidentiality** from encrypted image distribution through to in-memory execution, ensuring protection throughout the entire workload lifecycle. **Verifiable security** is achieved through remote attestation that proves TEE configuration before releasing any secrets. **Operational simplicity** is enabled by automated deployment via HAL with minimal manual configuration required. Finally, **platform independence** allows Wasm portability across different TEE implementations, providing flexibility in deployment choices.

As confidential computing becomes critical for AI/ML workloads, federated learning, and privacy-preserving computation, Proplet's TEE integration positions it as a robust platform for secure WebAssembly execution at scale.

For production deployments, combine Propeller with comprehensive monitoring, strict attestation policies, and defense-in-depth security practices to maximize the security guarantees provided by hardware TEEs.

## Additional Resources

- [Propeller GitHub Repository](https://github.com/absmach/propeller)
- [Confidential Containers Project](https://confidentialcontainers.org/)
- [Trustee Attestation Stack](https://github.com/confidential-containers/trustee)
- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [AMD SEV Documentation](https://developer.amd.com/sev/)
- [WebAssembly WASI](https://wasi.dev/)
- [Wasmtime Runtime](https://wasmtime.dev/)
