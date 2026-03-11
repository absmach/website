---
slug: "wasm-instances-esp32s3-zephyr"
title: "Up to 24 Concurrent WebAssembly Instances on an ESP32-S3 Running Zephyr"
description: "How many concurrent WASM instances can an ESP32-S3 running Zephyr handle? We push WAMR's classic interpreter to its limits: 24 CPU-bound instances, 2 stateful instances — all isolated, zero errors."
date: "2026-03-11"
author:
  name: "Jeff Mboya"
  picture: "https://avatars.githubusercontent.com/u/44696487?s=96&v=4"
coverImage: "/img/blogs/wasm-instances-on-esp32s3/zephyr-cover.svg"
ogImage:
  url: "/img/blogs/wasm-instances-on-esp32s3/zephyr-cover.svg"
tags:
  - WebAssembly
  - ESP32
  - WAMR
  - Embedded
  - Zephyr
  - Propeller
  - Edge Computing
category: blog
featured: false
draft: false
---

How many concurrent WebAssembly instances can you run on a $4 microcontroller? We tested it on an ESP32-S3 running Zephyr RTOS, using [WAMR](https://github.com/bytecodealliance/wasm-micro-runtime)'s classic interpreter and three hand-crafted WAT workloads. The answer: **24 CPU-bound instances** and **2 stateful instances** — all isolated, zero errors, no operating system in sight.

---

## Hardware

The test board is an **[ESP32-S3-WROOM-1](https://www.espressif.com/en/products/modules/esp32-s3-wroom-1)** — a dual-core Xtensa LX7 at 240 MHz with 512 KB of internal SRAM and no external RAM. At roughly $4 in quantity, it sits at the low end of what embedded teams reach for when they need processing headroom on a budget.

| Attribute      | Value                          |
| -------------- | ------------------------------ |
| SoC            | ESP32-S3                       |
| CPU            | 2 × Xtensa LX7 @ 240 MHz       |
| Internal SRAM  | 512 KB                         |
| Flash          | 8 MB (WROOM-1 module)          |
| External RAM   | None                           |
| Price          | ~$4                            |
| RTOS           | Zephyr 4.3.99                  |
| WASM Runtime   | WAMR classic interpreter       |
| Active cores   | 1 (`esp32s3_devkitc/esp32s3/procpu`) |

The Zephyr target `esp32s3_devkitc/esp32s3/procpu` pins execution to Core 0. Core 1 is not used. This is a deliberate choice: Zephyr's Xtensa SMP support on ESP32-S3 was still maturing at the time of this test, and single-core removes any SMP scheduling variables from the results. Everything measured here comes from 240 MHz of a single Xtensa LX7.

---

## WAMR on Zephyr

[WAMR (WebAssembly Micro Runtime)](https://github.com/bytecodealliance/wasm-micro-runtime) is the Bytecode Alliance's embedded WASM interpreter, designed to run on devices where Linux and a full runtime like Wasmtime are not an option. It ships multiple execution tiers — AOT, fast interpreter, classic interpreter — and a platform abstraction layer (PAL) that handles threading, memory, and time across different RTOS environments.

Zephyr's WAMR integration defaults to the **classic interpreter** (`WASM_ENABLE_FAST_INTERP=0`). The classic interpreter evaluates WASM opcodes directly from the bytecode buffer without modifying it. This is a safer default on Zephyr: the RTOS can mark memory regions non-writable, and any runtime that modifies its own bytecode buffer would fault. The classic interpreter leaves the buffer untouched, which also allows WASM bytes to be stored in read-only flash regions and copied to RAM only when needed.

### Shared-Module Architecture

The key to running many concurrent instances on constrained hardware is WAMR's shared-module architecture. Instead of loading a separate copy of the WASM module for each task, you parse the bytecode once and instantiate it many times.

![Shared module architecture diagram](/img/blogs/wasm-instances-on-esp32s3/shared-module-arch.svg)
*Figure 1. WAMR shared-module architecture: `wasm_runtime_load()` parses bytecode once into an immutable `wasm_module_t`; each `wasm_runtime_instantiate()` creates an isolated instance with its own linear memory and interpreter stack.*

The API maps directly:

```c
// Parse once — produces an immutable wasm_module_t
wasm_module_t module = wasm_runtime_load(wasm_bytes, wasm_size, err, sizeof(err));

// Instantiate N times — each gets isolated linear memory + stack
for (int i = 0; i < n; i++) {
    inst[i] = wasm_runtime_instantiate(module, stack_kb * 1024, heap_kb * 1024, err, sizeof(err));
    env[i]  = wasm_runtime_create_exec_env(inst[i], stack_kb * 1024);
}
```

The parsed `wasm_module_t` is shared and immutable. Each `wasm_module_inst_t` carries its own linear memory (for workloads that declare `(memory ...)`), its own interpreter stack, and its own execution environment. Instances cannot observe each other's memory.

### Instance Lifecycle

Every instance follows the same lifecycle from load to teardown:

![WASM instance lifecycle diagram](/img/blogs/wasm-instances-on-esp32s3/wasm-lifecycle.svg)
*Figure 2. WASM instance lifecycle: load → instantiate → execute → destroy → unload. Multiple instances share the single `wasm_module_t` produced by load; unload happens once, after all instances are destroyed.*

Each Zephyr thread runs one instance to completion, then calls `wasm_runtime_destroy_exec_env` and `wasm_runtime_deinstantiate`. Once all threads have finished, `wasm_runtime_unload` releases the shared module. Post-teardown heap measurements confirm that WAMR leaves no allocations behind.

---

## Benchmark Design

Three workloads, all hand-written in WAT (WebAssembly Text Format) and assembled with `wat2wasm`. WAT lets us control the binary exactly — no compiler passes, no runtime libraries, no hidden allocations. What you see in the source is what runs.

The `.wat` sources and a `gen_headers.py` script to regenerate the C header arrays live in [`examples/esp32s3-wasm-benchmark-zephyr/wat/`](https://github.com/absmach/propeller/tree/main/examples/esp32s3-wasm-benchmark-zephyr/wat). Requires [`wat2wasm`](https://github.com/WebAssembly/wabt) from the WABT toolchain.

### CPU Workload — FNV-1a Hash Loop

No linear memory. Pure computation: hash a 32-bit seed across 10 000 iterations of FNV-1a, accumulate into a global, repeat forever.

```wat
(module
  (global $acc (mut i32) (i32.const 2166136261))
  (func $fnv_iter (result i32)
    (local $i i32)
    (local $h i32)
    (local.set $h (global.get $acc))
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $i) (i32.const 10000)))
        (local.set $h
          (i32.mul
            (i32.xor (local.get $h) (local.get $i))
            (i32.const 16777619)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)))
    (global.set $acc (local.get $h))
    (local.get $h))
  (export "fnv_iter" (func $fnv_iter)))
```

Binary size: **90 bytes**. Per-instance malloc cost: ~6 KB (4 KB WAMR interpreter stack + ~1–2 KB bookkeeping, no linear memory page).

### MEM Workload — Linear Memory Write/Read

Declares one 64 KB linear memory page. Writes a byte pattern across 1 KB, reads it back 100 times per call, returns a checksum.

```wat
(module
  (memory 1 1)
  (func $mem_stress (result i32)
    (local $i i32) (local $sum i32)
    (block $outer_break
      (loop $outer
        (br_if $outer_break (i32.ge_u (local.get $i) (i32.const 100)))
        (local $j i32)
        (block $inner_break
          (loop $inner
            (br_if $inner_break (i32.ge_u (local.get $j) (i32.const 1024)))
            (i32.store8 (local.get $j)
              (i32.and (i32.add (local.get $i) (local.get $j)) (i32.const 255)))
            (local.set $j (i32.add (local.get $j) (i32.const 1)))
            (br $inner)))
        (local.set $j (i32.const 0))
        (block $read_break
          (loop $read
            (br_if $read_break (i32.ge_u (local.get $j) (i32.const 1024)))
            (local.set $sum
              (i32.add (local.get $sum)
                (i32.load8_u (local.get $j))))
            (local.set $j (i32.add (local.get $j) (i32.const 1)))
            (br $read)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $outer)))
    (local.get $sum))
  (export "mem_stress" (func $mem_stress)))
```

Binary size: **145 bytes**. Per-instance malloc cost: ~70 KB (64 KB WASM linear memory page + ~6 KB overhead).

### MSG Workload — SPSC Ring Buffer

Declares one 64 KB linear memory page. Simulates a single-producer single-consumer ring buffer: writes 64 messages of 32 bytes each, reads them back, returns the count.

```wat
(module
  (memory 1 1)
  (global $head (mut i32) (i32.const 0))
  (global $tail (mut i32) (i32.const 0))
  (func $msg_stress (result i32)
    (local $count i32) (local $i i32) (local $slot i32)
    ;; produce 64 messages
    (block $prod_break
      (loop $prod
        (br_if $prod_break (i32.ge_u (local.get $i) (i32.const 64)))
        (local.set $slot
          (i32.mul (i32.rem_u (global.get $head) (i32.const 64)) (i32.const 32)))
        (i32.store (local.get $slot) (local.get $i))
        (global.set $head (i32.add (global.get $head) (i32.const 1)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $prod)))
    ;; consume 64 messages
    (local.set $i (i32.const 0))
    (block $cons_break
      (loop $cons
        (br_if $cons_break (i32.ge_u (local.get $i) (i32.const 64)))
        (local.set $slot
          (i32.mul (i32.rem_u (global.get $tail) (i32.const 64)) (i32.const 32)))
        (drop (i32.load (local.get $slot)))
        (global.set $tail (i32.add (global.get $tail) (i32.const 1)))
        (local.set $count (i32.add (local.get $count) (i32.const 1)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $cons)))
    (local.get $count))
  (export "msg_stress" (func $msg_stress)))
```

Binary size: **170 bytes**. Per-instance malloc cost: ~70 KB (same as MEM — same `(memory 1 1)` declaration).

---

## Memory Architecture

Understanding the results requires understanding where every byte lives on Zephyr.

### DRAM Layout

The ESP32-S3's 512 KB SRAM is divided between the Zephyr kernel, pre-allocated thread stacks, the malloc arena, and a small headroom margin.

![Zephyr DRAM layout diagram](/img/blogs/wasm-instances-on-esp32s3/zephyr-dram-layout.svg)
*Figure 3. Zephyr DRAM layout on ESP32-S3: thread stacks are pre-allocated in `.noinit` and never compete with the malloc arena used by WAMR.*

```text
Zephyr DRAM layout (399 KB usable dram0_0_seg):
  Zephyr kernel + BSS          ~100 KB  (code, globals, kernel data structures)
  Thread stacks (24 × 4 KB)     96 KB   (.noinit — never touches malloc arena)
  Malloc arena (WAMR)           192 KB  (CONFIG_COMMON_LIBC_MALLOC_ARENA_SIZE)
  Remaining headroom             ~11 KB
```

Thread stacks are declared with `K_THREAD_STACK_ARRAY_DEFINE`, which places them in the `.noinit` section. They are reserved at boot and never appear in the malloc arena accounting. WAMR calls `malloc` / `free` for module loads, instance allocations, and interpreter stacks. The two pools are completely separate: WAMR cannot accidentally exhaust thread stack memory, and creating a new thread cannot reduce the WAMR arena.

The trade-off is that the stack pool is fixed at boot. The benchmark pre-allocates 24 slots (96 KB). If the experiment needs more threads, the source constant must be changed and the firmware rebuilt.

### Scheduling and Concurrency Limits

All threads run on Core 0. The Zephyr scheduler time-slices them cooperatively and preemptively. With 24 threads simultaneously active, the CPU is 100% utilised from the moment the second instance starts.

![Zephyr scheduling and concurrency limits diagram](/img/blogs/wasm-instances-on-esp32s3/zephyr-scheduling-arena-stack.svg)
*Figure 4. Two independent ceilings bound concurrency: stack slots cap CPU-bound workloads at 24; the 192 KB malloc arena caps stateful workloads at 2.*

Two independent ceilings determine the peak:

- **Stack-slot ceiling**: 24 pre-allocated slots. CPU workloads hit this first because their per-instance arena cost is small (~6 KB × 24 = 144 KB, leaving 40 KB of arena still free when the run stops).
- **Arena ceiling**: 192 KB. Stateful workloads (MEM, MSG) consume ~70 KB each; two instances leave 50 KB, which is not enough for a third (70 KB required).

---

## Results

All three workloads run in the same firmware image under `EXPERIMENT 0`. Serial output captured at 115200 baud.

### CPU Workload — 24 Concurrent Instances

```text
=== WASM Stress Benchmark (Zephyr) ===
workload=cpu  wasm_stack=4KB
thread_stack=4KB (pre-allocated, 24 slots)  core=-1

instances=1    heap=185KB  min=185KB  cpu= 84%  up=3s
  +instance cost ~6KB  latency 0us
instances=2    heap=178KB  min=178KB  cpu=100%  up=5s
  +instance cost ~6KB  latency 0us
instances=4    heap=163KB  min=163KB  cpu=100%  up=10s
  +instance cost ~6KB  latency 0us
instances=8    heap=137KB  min=137KB  cpu=100%  up=19s
  +instance cost ~6KB  latency 0us
instances=16   heap= 91KB  min= 91KB  cpu=100%  up=38s
  +instance cost ~6KB  latency 0us
instances=24   heap= 40KB  min= 40KB  cpu=100%  up=56s
  +instance cost ~6KB  latency 0us

--- Peak: 24 concurrent WASM instances ---

  id  task   iters  errors  latency_us
   0  cpu      311       0           0
   1  cpu      239       0           0
   2  cpu      201       0           0
  ...
  23  cpu        6       0           0
---

Post-teardown heap: 191KB free
```

Each CPU instance costs **~6 KB from the malloc arena**: 4 KB WAMR interpreter stack plus ~1–2 KB of runtime bookkeeping. No linear memory page is allocated because the CPU workload declares none.

The run stopped at 24 because all pre-allocated stack slots were consumed — not because memory ran out. At peak, **40 KB of arena remained free**. Post-teardown, the full 191 KB returns: WAMR is clean.

The `latency 0us` values are a known measurement gap: `k_cycle_get_64()` on this Zephyr/ESP32-S3 target does not advance at the expected rate and produces zero-width elapsed times. Actual per-call duration can be read from iteration counts: instance 0 ran from t ≈ 3 s to t ≈ 56 s (53 seconds total) and completed 311 iterations — approximately **170 ms per call** at 24-instance load on a single 240 MHz core.

CPU utilisation hits 100% at 2 instances. With 24 threads all running WASM on one core, the scheduler is fully saturated, which is expected and correct.

### MEM Workload — 2 Concurrent Instances

```text
=== WASM Stress Benchmark (Zephyr) ===
workload=mem  wasm_stack=4KB
thread_stack=4KB (pre-allocated, 24 slots)  core=-1

instances=1   heap=120KB  min=40KB  cpu=98%  up=62s
  +instance cost ~70KB  latency 0us
instances=2   heap= 50KB  min=40KB  cpu=100% up=65s
  +instance cost ~70KB  latency 0us
[wrn] bench: [2] instantiate failed: allocate linear memory failed
instances=3   TASK_DIED (errors=1)

--- Peak: 2 concurrent WASM instances ---
Post-teardown heap: 191KB free
```

Each MEM instance consumes **~70 KB** from the 192 KB arena: 64 KB for the WASM linear memory page declared by `(memory 1 1)`, plus ~6 KB of overhead. Two instances occupy 140 KB, leaving 50 KB. A third instance requires 70 KB — the arena cannot provide it.

The error is clean: `wasm_runtime_instantiate` returns false, the thread reports the failure and exits. No memory is leaked; the two surviving instances continue running without error.

### MSG Workload — 2 Concurrent Instances

```text
=== WASM Stress Benchmark (Zephyr) ===
workload=msg  wasm_stack=4KB
thread_stack=4KB (pre-allocated, 24 slots)  core=-1

instances=1   heap=120KB  min=40KB  cpu=68%  up=72s
  +instance cost ~70KB  latency 0us
instances=2   heap= 50KB  min=40KB  cpu=100% up=74s
  +instance cost ~70KB  latency 0us
[wrn] bench: [2] instantiate failed: allocate linear memory failed
instances=3   TASK_DIED (errors=1)

--- Peak: 2 concurrent WASM instances ---
Post-teardown heap: 191KB free
```

Identical pattern to MEM. The MSG workload also declares `(memory 1 1)`, so the per-instance cost is the same 70 KB. At 2 instances, 50 KB remains and both run cleanly at 100% single-core utilisation with zero errors.

### Summary

| Workload               | Peak instances | Per-instance arena cost | Limiting factor                    |
| ---------------------- | -------------- | ----------------------- | ---------------------------------- |
| CPU (no linear mem)    | **24**         | ~6 KB                   | Stack-slot pool (24 pre-allocated) |
| MEM (64 KB linear mem) | **2**          | ~70 KB                  | 192 KB malloc arena                |
| MSG (64 KB linear mem) | **2**          | ~70 KB                  | 192 KB malloc arena                |

Arena consumption across all three experiments:

![Arena consumption chart](/img/blogs/wasm-instances-on-esp32s3/arena-consumption.svg)
*Figure 5. Malloc arena consumption as instance count grows for each workload. CPU workloads spend ~6 KB per instance; MEM/MSG spend ~70 KB. The 192 KB ceiling terminates MEM/MSG at 2 instances; CPU hits the stack-slot ceiling first at 24, with 40 KB of arena still available.*

---

## What This Means for Propeller

[Propeller](https://github.com/absmach/propeller) is an open-source orchestration system for WebAssembly workloads on embedded devices. A manager node compiles tasks to WASM and dispatches them over MQTT to a fleet of proplets — worker nodes that load and run the binaries. A single proplet might serve tasks from several independent deployments simultaneously.

![Propeller edge dispatch diagram](/img/blogs/wasm-instances-on-esp32s3/propeller-edge-dispatch.svg)
*Figure 6. Propeller dispatch model: the manager sends compiled WASM binaries over MQTT; each proplet loads the binary via WAMR and runs it in an isolated instance. Multiple concurrent instances run within the same proplet process.*

This benchmark answers the capacity question for the Zephyr proplet configuration:

- **24 concurrent stateless functions** per device with the default configuration. The 24-slot stack pool is a single constant in source; rebuilding with 30 slots gives ~29–30 instances (the arena would run out before the stack pool at ~29 instances, where 6 KB × 29 ≈ 174 KB leaves only ~18 KB — enough for ~3 more instances before OOM).
- **2 concurrent stateful functions** per device with the default 192 KB arena. If your pipeline stages maintain local state (ring buffers, accumulators, running statistics), budget 70 KB per concurrent instance. The ESP32-S3R8 variant (8 MB PSRAM) lifts this ceiling substantially.
- **Isolation is guaranteed by construction**: WAMR instances cannot access each other's linear memory. Across every experiment — 24 CPU instances, 2 MEM instances, 2 MSG instances — zero cross-contamination errors were observed. Propeller's per-function isolation guarantee holds at the microcontroller level.
- **Zephyr's vendor-neutral HAL is compatible**: the WAMR runtime, the WASM binaries, and the shared-module architecture work unchanged on Zephyr. Teams that need to target an nRF5340, an STM32L5, and an ESP32-S3 from the same codebase can deploy Propeller proplets across all three without re-benchmarking.

---

## Conclusion

A $4 ESP32-S3 running Zephyr RTOS can sustain **24 concurrent WebAssembly instances** for CPU-bound workloads and **2 concurrent instances** for workloads with 64 KB linear memory — all isolated, all zero-error, on a single 240 MHz core with no external RAM.

The limits are deterministic and configurable:

- The CPU ceiling is a **stack-slot count**, not an OOM. Pre-allocate more stack slots at compile time and the arena absorbs more instances — the 192 KB arena still had 40 KB free when the 24-slot pool was exhausted.
- The MEM/MSG ceiling is a **`Kconfig` parameter**. `CONFIG_COMMON_LIBC_MALLOC_ARENA_SIZE` is one line; increasing it (and the headroom permits a small increase) directly lifts stateful instance capacity.

WAMR's shared-module architecture is what makes this possible: parsing happens once, and each `wasm_runtime_instantiate()` costs only the per-instance overhead — not a full copy of the module. On Zephyr, thread stacks are segregated into the `.noinit` section and never compete with the WAMR malloc arena, which keeps the accounting clean and the limits predictable.

The benchmark source is at [examples/esp32s3-wasm-benchmark-zephyr](https://github.com/absmach/propeller/tree/main/examples/esp32s3-wasm-benchmark-zephyr). Propeller is open source at [github.com/absmach/propeller](https://github.com/absmach/propeller).

---

*Measurements: ESP32-S3-WROOM-1, Zephyr 4.3.99, WAMR classic interpreter, single core (`esp32s3_devkitc/esp32s3/procpu`). Timing via `k_cycle_get_64()` — latency values unreliable on this target; iteration counts used for duration estimates. All experiments run in-process with no external tooling.*
