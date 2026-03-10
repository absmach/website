---
slug: "29-wasm-instances-on-esp32s3"
title: "Up to 29 Concurrent WebAssembly Instances on a $4 Microcontroller"
description: "How many concurrent WASM instances can a $4 ESP32-S3 run? We benchmarked WAMR under both FreeRTOS (29 CPU instances) and Zephyr RTOS (24), and explain every difference."
date: "2026-03-09"
author:
  name: "Jeff Mboya"
  picture: "https://avatars.githubusercontent.com/u/44696487?s=96&v=4"
coverImage: "/img/blogs/wasm-instances-on-esp32s3/wasm-instances-on-esp32s3.svg"
ogImage:
  url: "/img/blogs/wasm-instances-on-esp32s3/wasm-instances-on-esp32s3.svg"
tags:
  - WebAssembly
  - ESP32
  - WAMR
  - Embedded
  - FreeRTOS
  - Zephyr
  - Propeller
  - Edge Computing
category: blog
featured: false
draft: false
---

The ESP32-S3-WROOM-1 costs about $4. It has two Xtensa LX7 cores clocked at 240 MHz, 512 KB of internal SRAM, and no memory management unit. Docker is not an option. Linux is not an option. The OS is FreeRTOS.

But it *can* run WebAssembly.

This post documents an experiment to find the hard limit: **how many concurrent WASM workloads can one ESP32-S3 execute before memory or scheduling makes it impossible?**

The answer is **29 parallel CPU-bound WASM instances**, consuming roughly 15 KB of DRAM each, at a combined system throughput of thousands of iterations per second. Memory-intensive and messaging workloads top out at 3 instances each due to the 64 KB WASM linear memory page cost.

---

## The Hardware

**ESP32-S3-WROOM-1** development board (ESP32-S3 SoC):

| Resource      | Amount                         |
| ------------- | ------------------------------ |
| CPU cores     | 2 × Xtensa LX7 @ 240 MHz       |
| Internal SRAM | 512 KB                         |
| Flash         | 4 MB (on-module)               |
| PSRAM         | None (on the -WROOM-1 variant) |
| FreeRTOS      | SMP, dual-core                 |
| SDK           | ESP-IDF v5.3.2                 |

At startup, after FreeRTOS, ESP-IDF system heap, WAMR runtime, and the benchmark harness claim their share, we have roughly **412 KB of free internal DRAM** to allocate WASM instances into. The largest contiguous block is smaller — fragmentation and heap metadata trim this further.

There is no virtual memory. There is no page file. When you run out of heap, `malloc` returns NULL. That is your OOM condition.

---

## WebAssembly on Microcontrollers — WAMR

The [WebAssembly Micro Runtime (WAMR)](https://github.com/bytecodealliance/wasm-micro-runtime) is Bytecode Alliance's embedded WASM interpreter. It ships as an ESP-IDF component via the `idf-component-manager` and supports several execution modes:

- **Interpreter**: pure bytecode interpretation, slowest, most portable
- **Fast interpreter**: pre-processes bytecode at load time into an optimised internal form; roughly 2–3× faster than plain interpreter on Xtensa, but **modifies the bytecode buffer in-place**
- **AOT**: ahead-of-time compilation to native code; fastest, but requires a cross-compilation toolchain step

We use **fast-interpreter** (`CONFIG_WAMR_INTERP_FAST=y`). This is the sweet spot for microcontrollers: no LLVM toolchain needed, native-speed-ish execution, small runtime footprint.

### The shared-module architecture

The key insight for parallelism is that WAMR separates the *loaded module* from its *instance*:

![Shared module architecture diagram](/img/blogs/wasm-instances-on-esp32s3/shared-module-arch.svg)
*Figure 1. WAMR shared-module architecture: one parsed module spawns multiple isolated instances, each with its own linear memory and execution state.*

`wasm_runtime_load()` parses and pre-processes the WASM bytecode once. Every `wasm_runtime_instantiate()` call creates an independent module instance — with its own linear memory and execution state — that shares the immutable parsed representation. This means N instances cost roughly:

```bash
1 × parse/load cost  +  N × (instance overhead)
```

rather than N × (full parse cost), which would be prohibitive.

### Memory cost per instance

Each instance needs:

- **WAMR interpreter stack** (`wasm_stack_bytes`): operand stack for bytecode evaluation. We use 4 KB.
- **Linear memory** (if the WASM module declares a memory section): one page = 64 KB minimum. CPU workloads have no memory section; they only use local variables. MEM and MSG workloads declare `(memory 1 1)` which forces a 64 KB DRAM allocation per instance.
- **`wasm_module_inst_t` struct**: ~1–2 KB internal bookkeeping.
- **`wasm_exec_env_t` struct**: ~1 KB.
- **FreeRTOS pthread stack**: the native C stack for the OS thread running this instance. We use 6 KB (`task_stack_kb = 6`).
- **WAMR internal overhead**: miscellaneous allocations during `wasm_runtime_instantiate`. Empirically ~8–10 KB.

For CPU workloads (no linear memory page): **~15–16 KB per instance**.
For MEM/MSG workloads (with 64 KB linear memory): **~80–90 KB per instance**.

![Memory cost comparison chart](/img/blogs/wasm-instances-on-esp32s3/memory-cost-comparison.svg)
*Figure 2. Per-instance DRAM cost: CPU workloads without linear memory cost ~16 KB, while MEM/MSG workloads with a 64 KB WASM page cost ~88 KB each.*

---

## The Benchmark Design

The benchmark has three workload types, each compiled to a hand-crafted minimal WASM binary. The binaries were written directly in WAT (WebAssembly Text Format) and assembled with `wat2wasm` — no compiler involved. This keeps them tiny (90–170 bytes) and makes their behaviour fully transparent.

### Why hand-crafted WASM?

A TinyGo or Rust WASM binary for even a trivial function starts at 50–200 KB because it includes a runtime, panic handler, memory allocator stubs, and DWARF debug info. At that size, `wasm_runtime_load` takes longer, the shared module consumes more RAM, and the benchmark measures compiler overhead as much as the runtime. By writing the bytecode by hand we get binaries small enough that **loading is near-instant** and each binary does exactly one thing.

![Binary size comparison chart](/img/blogs/wasm-instances-on-esp32s3/binary-size-comparison.svg)
*Figure 3. WASM binary size: hand-crafted WAT (72–170 bytes) vs compiler-generated TinyGo/Rust (50–200 KB) — roughly 1000× difference.*

---

### CPU workload — 90 bytes

**What it does**: Runs the [FNV-1a](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) (Fowler–Noll–Vo) non-cryptographic hash function for 10,000 iterations, seeded from the iteration counter.

**Why FNV-1a?** It is a tight two-operation loop — XOR then multiply — with no branches other than the loop condition, no memory access, and no function calls. This makes it a pure integer ALU stress test. The Xtensa LX7 has a 32-bit multiply instruction (`mull`) which executes in 1 cycle; FNV-1a exercises it continuously. 10,000 iterations were chosen to produce a call duration of ~73 ms at single-instance, long enough to measure accurately but short enough to keep the benchmark from running for hours at 29 instances.

**No linear memory**: The entire computation uses two WASM local variables (`$hash` and `$i`) — these map to WAMR's interpreter operand stack, which lives in DRAM allocated at instantiation time. There is no `(memory ...)` section in this binary. This is the crucial reason it costs only ~16 KB per instance rather than ~88 KB.

```wat
(module
  (func (export "main") (param i32 i32) (result i32)
    (local $hash i32)
    (local $i    i32)
    ;; FNV offset basis
    (local.set $hash (i32.const 0x811c9dc5))
    (block $break
      (loop $loop
        ;; if i >= 10000: break
        (br_if $break (i32.ge_u (local.get $i) (i32.const 10000)))
        ;; hash = (hash XOR i) * FNV prime
        (local.set $hash
          (i32.mul
            (i32.xor (local.get $hash) (local.get $i))
            (i32.const 0x01000193)))
        ;; i++
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )
    (i32.const 0)  ;; return 0
  )
)
```

The raw binary is 90 bytes. On WAMR fast-interpreter on Xtensa LX7 @ 240 MHz: **~73 ms per call** at 1 instance, rising to ~96 ms at 29 instances (interpreter overhead from context switching).

---

### MEM workload — 145 bytes

**What it does**: Runs 100 outer rounds. In each round it first writes 1,024 bytes of linear memory sequentially, then reads all 1,024 bytes back. The written value at address `i` is `i & 0xFF` (the low byte of the address).

**Why this pattern?** Sequential write-then-read exercises WASM linear memory access through the WAMR interpreter's bounds-checking path (`i32.store8` / `i32.load8_u`). On a real microcontroller there is no L1 data cache — every access goes directly to SRAM. The pattern mimics a sensor data buffer: fill a buffer with a frame of samples, then scan it for processing. 100 rounds × 1,024 bytes = 102,400 memory operations per call.

**Linear memory requirement**: The module declares `(memory 1 1)` — one 64 KB page, fixed size. WAMR allocates this page from DRAM at `wasm_runtime_instantiate` time. This single allocation is why each MEM instance costs ~88 KB instead of ~16 KB.

```wat
(module
  (memory 1 1)  ;; 1 page = 65536 bytes, fixed
  (func (export "main") (param i32 i32) (result i32)
    (local $round i32)
    (local $i     i32)
    (local $tmp   i32)
    (block $break
      (loop $outer
        ;; if round >= 100: break
        (br_if $break (i32.ge_u (local.get $round) (i32.const 100)))

        ;; Write pass: mem[i] = i & 0xFF  for i in 0..1024
        (local.set $i (i32.const 0))
        (block $wbreak (loop $wloop
          (br_if $wbreak (i32.ge_u (local.get $i) (i32.const 1024)))
          (i32.store8 (local.get $i)
                      (i32.and (local.get $i) (i32.const 0xFF)))
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $wloop)
        ))

        ;; Read pass: tmp = mem[i]  for i in 0..1024  (result discarded)
        (local.set $i (i32.const 0))
        (block $rbreak (loop $rloop
          (br_if $rbreak (i32.ge_u (local.get $i) (i32.const 1024)))
          (local.set $tmp (i32.load8_u (local.get $i)))
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $rloop)
        ))

        (local.set $round (i32.add (local.get $round) (i32.const 1)))
        (br $outer)
      )
    )
    (i32.const 0)
  )
)
```

On WAMR fast-interpreter: **~14 ms per call** at 1 instance. Faster than CPU despite more operations because the loop body is simpler (load/store + increment) than the FNV-1a multiply chain.

---

### MSG workload — 170 bytes

**What it does**: Simulates a single-producer single-consumer (SPSC) ring buffer entirely within WASM linear memory. The ring buffer has 256 slots of 4 bytes each (1 KB total), stored starting at memory address 0. Two control variables — `head` (consumer pointer) and `tail` (producer pointer) — are stored as 32-bit integers at addresses 1024 and 1028 respectively.

The workload runs 1,000 producer iterations:

1. **Produce**: Write a value derived from the iteration counter into slot `tail & 0xFF`, then increment `tail`.
2. **Flow control**: If the buffer is more than 64 slots full (`tail - head >= 64`), advance `head` by 1 (simulate a consumer draining one entry).

This models an IoT message pipeline where a sensor or protocol decoder produces messages into a ring buffer and a downstream consumer drains them. The flow-control check prevents the producer from running infinitely ahead. The 64-slot threshold means the buffer is kept at most 25% full (64/256), which is a typical real-world backpressure threshold.

```wat
(module
  (memory 1 1)  ;; slots[0..255] at addr 0..1023, head at 1024, tail at 1028
  (func (export "main") (param i32 i32) (result i32)
    (local $iter i32)

    ;; Initialise head=0, tail=0
    (i32.store (i32.const 1024) (i32.const 0))
    (i32.store (i32.const 1028) (i32.const 0))

    (block $break
      (loop $loop
        ;; if iter >= 1000: break
        (br_if $break (i32.ge_u (local.get $iter) (i32.const 1000)))

        ;; slots[(tail & 0xFF) * 4] = iter * LARGE_CONST + OFFSET
        (i32.store
          (i32.mul (i32.and (i32.load (i32.const 1028)) (i32.const 0xFF))
                   (i32.const 4))
          (i32.add (i32.mul (local.get $iter) (i32.const 0x0866_4DED))
                   (i32.const 0x2CE0)))

        ;; tail++
        (i32.store (i32.const 1028)
          (i32.add (i32.load (i32.const 1028)) (i32.const 1)))

        ;; if (tail - head) >= 64: head++
        (if (i32.ge_u
              (i32.sub (i32.load (i32.const 1028))
                       (i32.load (i32.const 1024)))
              (i32.const 64))
          (then
            (i32.store (i32.const 1024)
              (i32.add (i32.load (i32.const 1024)) (i32.const 1)))))

        (local.set $iter (i32.add (local.get $iter) (i32.const 1)))
        (br $loop)
      )
    )
    (i32.const 0)
  )
)
```

On WAMR fast-interpreter: **~8–10 ms per call** at 1 instance. The loop body is heavier than MEM (multiple `i32.load`/`i32.store` plus a conditional branch), but 1,000 iterations is 10× fewer than the CPU workload's 10,000 and 100× fewer memory operations than MEM.

---

### Why the binary sizes differ

| Workload | Bytes | Memory section | Sections present                         |
| -------- | ----- | -------------- | ---------------------------------------- |
| CPU      | 90    | No             | type, function, export, code             |
| MEM      | 145   | Yes (1 page)   | type, function, **memory**, export, code |
| MSG      | 170   | Yes (1 page)   | type, function, **memory**, export, code |

The memory section (`0x05`) adds 3 bytes to the binary. The extra size in MEM and MSG comes entirely from more complex code sections — more instructions, more LEB128-encoded constants. The CPU binary has no memory section at all, which is why it sidesteps the 64 KB linear memory page allocation and the WAMR GC heap alignment issue entirely.

### Benchmark loop

```text
for n = 1 to MAX_INSTANCES:
    sample heap before
    if heap < estimated_cost: print "OOM"; break
    spawn_instance(n)
    wait scale_delay_ms (300ms) for instance to initialise
    if instance died: print "TASK_DIED"; break
    wait measure_delay_ms (2000ms)
    sample heap, CPU, uptime
    print metrics row
```

Each instance runs in its own pthread. Instances loop: call WASM `main`, record latency, `vTaskDelay(5ms)` to yield to FreeRTOS IDLE (required to avoid watchdog timeout), repeat.

---


## Results

### CPU workload: 29 concurrent instances

```text
=== WASM Stress Benchmark ===
workload=cpu  mode=shared_module  wasm_stack=4KB  wasm_heap=8KB

instances=1    heap=394KB  latency 72819us
instances=10   heap=250KB  latency 78422us
instances=20   heap=90KB   latency 87634us
instances=29   heap=14KB   latency 96034us
instances=30   OOM (heap=14KB < ~28KB needed)

--- Peak: 29 concurrent WASM instances (zero errors) ---
Post-teardown heap: 412KB free
```

**Key observations**: Each CPU instance costs ~**16 KB DRAM**. Latency scales from 73 ms (1 instance) to 96 ms (29 instances) — only 31% degradation. Zero errors, zero leaks.

![Heap vs instances graph](/img/blogs/wasm-instances-on-esp32s3/heap-vs-instances.svg)
*Figure 4. Free heap vs CPU instance count: starting at 412 KB, each instance consumes ~16 KB until OOM at instance 30.*

### MEM workload: 3 concurrent instances

Each MEM instance costs **~88 KB** (64 KB linear memory page dominates). Peak: 3 instances before OOM. Latency: 14–15 ms vs 73 ms for CPU.

### MSG workload: 3 concurrent instances

Similar to MEM — ring-buffer uses linear memory. Peak: 3 instances. Latency: ~8–10 ms per call.

### Summary

| Workload               | Peak instances | Per-instance DRAM cost | Latency (1 inst) | Bottleneck        |
| ---------------------- | -------------- | ---------------------- | ---------------- | ----------------- |
| CPU (no linear mem)    | **29**         | ~16 KB                 | 73 ms            | DRAM for stacks   |
| MEM (64 KB linear mem) | **3**          | ~88 KB                 | 14 ms            | WASM memory pages |
| MSG (64 KB linear mem) | **3**          | ~88 KB                 | 8 ms             | WASM memory pages |

---

## Understanding the Limits

**Memory breakdown**: Starting free DRAM is **412 KB**. Each CPU instance costs 4 KB WAMR stack + 6 KB pthread stack + ~6 KB WAMR overhead = **~16 KB total**. Post-teardown heap returns to exactly 412 KB — no leaks.

**Scheduler**: With 29 threads on 2 cores, each worker calls `vTaskDelay(5ms)` after every WASM call. This is **critical** — without it, workers never yield to the FreeRTOS IDLE task, triggering watchdog resets.

![Scheduler timeline diagram](/img/blogs/wasm-instances-on-esp32s3/scheduler-timeline.svg)
*Figure 5. FreeRTOS scheduler timeline: 29 WASM threads time-sliced across 2 cores, with 5 ms vTaskDelay yields to prevent watchdog timeout.*

**The binding constraint** is DRAM for FreeRTOS pthread stacks (6 KB each). Reducing stack sizes would allow ~35–40 instances at the cost of less headroom. For MEM/MSG workloads, **PSRAM** (8 MB on ESP32-S3R8) could push to 40+ concurrent instances by keeping linear memory pages in PSRAM while stacks stay in DRAM.

---

## Diverse Workloads: Five Different Tasks

The homogeneous benchmark scaled 29 identical instances. But real deployments run *different* functions at once — a protocol decoder, sensor filter, ring-buffer aggregator, etc. To test this, we run **five distinct WASM modules**, each separately loaded, scaling by adding full sets until OOM.

### The five tasks

| Task       | What it computes                             | Binary size | Linear memory   |
| ---------- | -------------------------------------------- | ----------- | --------------- |
| `add`      | Sum integers 0..49,999 (50 K iterations)     | 72 bytes    | No              |
| `mul`      | Multiply acc × 1,000,003 for 20 K iterations | 78 bytes    | No              |
| `fib`      | Compute fib(30) iteratively, 500 times       | 113 bytes   | No              |
| `checksum` | Write + XOR-read 4 KB of memory, 100 rounds  | 145 bytes   | **Yes (64 KB)** |
| `popcount` | Kernighan bit-count of integers 0..49,999    | 99 bytes    | No              |

Each task is a separate WASM binary hand-crafted in WAT and compiled with `wat2wasm`. Each gets its own `wasm_module_t` load — no sharing between tasks. The benchmark architecture:

```text
wasm_module_t (add)      → instance 0  (add)
wasm_module_t (mul)      → instance 1  (mul)
wasm_module_t (fib)      → instance 2  (fib)
wasm_module_t (checksum) → instance 3  (checksum)
wasm_module_t (popcount) → instance 4  (popcount)
  ↓ set 2
                         → instance 5  (add)
                         → instance 6  (mul)
                         → instance 7  (fib)
                         → instance 8  (checksum)
                         → instance 9  (popcount)
```

![Five tasks architecture diagram](/img/blogs/wasm-instances-on-esp32s3/five-tasks-arch.svg)
*Figure 6. Five different WASM modules running concurrently: each task has its own wasm_module_t, unlike the shared-module approach above.*

This is fundamentally different from the shared-module architecture of the first benchmark. Each module is independently loaded, independently parsed, and independently owned. The five `wasm_module_t` structs coexist in DRAM simultaneously.

### Task design rationale

Each task was chosen to exercise a distinct instruction mix so that the latency results expose different aspects of the WAMR fast-interpreter on Xtensa LX7. All five are hand-written in WAT and assembled with `wat2wasm` — no compiler, no runtime, no padding.

---

#### add — 72 bytes

Accumulates the sum of integers 0–49,999 (50,000 iterations, 13 instructions per loop). Pure arithmetic baseline establishing the floor for interpreter dispatch cost.

```wat
(module
  (func (export "main") (param i32 i32) (result i32)
    (local $sum i32)   ;; local[2]: running total
    (local $i   i32)   ;; local[3]: loop counter
    (block $break
      (loop $loop
        ;; exit when i >= 50000
        (br_if $break (i32.ge_u (local.get $i) (i32.const 50000)))
        ;; sum += i
        (local.set $sum (i32.add (local.get $sum) (local.get $i)))
        ;; i++
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )
    (i32.const 0)
  )
)
```

Raw binary: **72 bytes**. Measured on device: **72 ms per call** at 1 instance.

---

#### mul — 78 bytes

Multiplies an accumulator by prime 1,000,003 for 20,000 iterations. Same 13-instruction structure as add with `i32.mul` substituted — tests whether multiply vs add affects throughput (spoiler: no, both cost ~1.5 µs/iteration). **30 ms per call**.

---

#### fib — 113 bytes

Iterative Fibonacci: 500 outer rounds × 30 inner steps = 15,000 inner iterations per call. Tests nested-loop overhead and multi-local-variable access patterns (5 locals, 3-way swap per iteration). **45 ms per call**.

---

#### checksum — 145 bytes

100 rounds of write-then-XOR over 4,096 bytes of linear memory = **819,200 bounds-checked memory accesses** per call. Requires one 64 KB WASM memory page, making each instance cost ~88 KB (vs ~16 KB for arithmetic-only tasks). Memory access through WAMR costs ~50× more per operation than pure arithmetic.

```wat
(module
  (memory 1 1)   ;; 65536 bytes, non-growable
  (func (export "main") (param i32 i32) (result i32)
    (local $round i32)   ;; local[2]: outer counter
    (local $i     i32)   ;; local[3]: inner address
    (local $acc   i32)   ;; local[4]: XOR accumulator
    (block $break
      (loop $outer
        (br_if $break (i32.ge_u (local.get $round) (i32.const 100)))

        ;; Write pass: mem[i] = i & 0xFF  for i in 0..4095
        (local.set $i (i32.const 0))
        (block $wb (loop $wl
          (br_if $wb (i32.ge_u (local.get $i) (i32.const 4096)))
          (i32.store8 (local.get $i)
                      (i32.and (local.get $i) (i32.const 0xFF)))
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $wl)
        ))

        ;; XOR-read pass: acc ^= mem[i]  for i in 0..4095
        (local.set $i (i32.const 0))
        (block $rb (loop $rl
          (br_if $rb (i32.ge_u (local.get $i) (i32.const 4096)))
          (local.set $acc
            (i32.xor (local.get $acc) (i32.load8_u (local.get $i))))
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $rl)
        ))

        (local.set $round (i32.add (local.get $round) (i32.const 1)))
        (br $outer)
      )
    )
    (i32.const 0)
  )
)
```

Raw binary: **145 bytes** (includes 64 KB memory section). Measured on device: **1,779 ms per call** at 1 instance (25× slower than add).

---

#### popcount — 99 bytes

Counts set bits in integers 0–49,999 using [Kernighan's algorithm](https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetKernighan). Unlike other tasks, this produces a **variable inner loop depth** (average 8 iterations per outer step), testing whether WAMR's branch dispatch handles irregular trip counts. No linear memory. **903 ms per call** (~2.2 µs per inner iteration).

---

### Binary size summary

| Task       | Bytes | Memory section  | Locals | Inner loops             |
| ---------- | ----- | --------------- | ------ | ----------------------- |
| `add`      | 72    | No              | 2      | 0                       |
| `mul`      | 78    | No              | 2      | 0                       |
| `fib`      | 113   | No              | 5      | 1 (fixed depth 30)      |
| `checksum` | 145   | **Yes (64 KB)** | 3      | 2 (fixed depth 4096)    |
| `popcount` | 99    | No              | 3      | 1 (variable depth 0–16) |

Binary size tracks with code complexity: more locals, more blocks, more instructions.

### Diverse Workload Results

```text
DIVERSE WORKLOAD BENCHMARK: 5 tasks × N concurrent sets

set_size=1 (5 instances):  heap=235KB, zero errors
set_size=2 (10 instances): heap=116KB, zero errors
set_size=3: OOM

--- Peak: 10 total WASM instances of 5 different types ---
Post-teardown heap: 353KB free
```

### Analysis

**Peak: 10 simultaneous WASM instances of 5 different types** — 10 independently executing, isolated WASM functions on a $4 microcontroller.

The dominant cost is `checksum`: each instance needs a 64 KB linear memory page (128 KB for two). The other 8 instances together cost only ~90 KB total. Remove checksum and you could run 4–5 sets (16–20 instances) before hitting OOM.

**Key insight**: mul at 30 ms (20K iterations) vs add at 72 ms (50K iterations) shows identical per-iteration cost (~1.5 µs). **Interpreter dispatch overhead dominates, not arithmetic.** Checksum at 1,779 ms exposes WAMR's bounds-checking cost: ~2.2 µs per memory access (2× arithmetic cost).

Zero errors across all 10 instances — five different modules, 10 separate execution environments, no cross-contamination.

### Multi-module overhead

Loading 5 separate modules costs ~28 KB more than the initial WAMR runtime base (~5–6 KB per module struct). For larger real-world WASM modules, shared-module architecture becomes more valuable.

---

## Zephyr RTOS Port

The ESP-IDF benchmark above runs under FreeRTOS — the default RTOS bundled with Espressif's SDK. FreeRTOS is well-supported and low-overhead, but it is not a production-grade embedded OS in the Linux Foundation / open-standards sense. For deployments that need POSIX threading semantics, a vendor-neutral board support layer, or integration with the Zephyr device driver model, **Zephyr RTOS** is the natural alternative.

Zephyr is used in production across a wide range of constrained hardware — Nordic nRF SoCs, STM32 families, RISC-V targets, and ESP32 variants. It ships a full Kconfig build system, a native thread API (`k_thread_create`), and a rich set of synchronisation primitives, all without requiring a Linux kernel. Porting the benchmark to Zephyr lets us answer: *does the WASM instance count hold up when the OS changes?*

### What Changed

The workloads, WAT binaries, and WAMR shared-module architecture are identical to the ESP-IDF run (see [The Benchmark Design](#the-benchmark-design) above). Everything that changed is in the harness layer:

| Dimension               | ESP-IDF                                               | Zephyr                                                                     |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| RTOS thread API         | `pthread_create` / `pthread_join`                     | `k_thread_create` / `k_thread_join`                                        |
| Thread stack allocation | Dynamic, from `heap_caps_malloc(MALLOC_CAP_INTERNAL)` | Static, `K_THREAD_STACK_ARRAY_DEFINE` (`.noinit` section)                  |
| Thread stack size       | 6 KB per thread                                       | 4 KB per thread                                                            |
| Heap API                | `heap_caps_malloc(MALLOC_CAP_INTERNAL)`               | `malloc` backed by a 192 KB arena (`CONFIG_COMMON_LIBC_MALLOC_ARENA_SIZE`) |
| Heap stats              | `heap_caps_get_free_size(MALLOC_CAP_INTERNAL)`        | `malloc_runtime_stats_get()`                                               |
| CPU utilisation         | `uxTaskGetSystemState()` over all tasks               | `k_thread_runtime_stats_all_get()`                                         |
| Timer                   | `esp_timer_get_time()` (µs, direct)                   | `k_cycle_get_64()` + `k_cyc_to_us_floor64()`                              |
| WAMR execution mode     | **Fast interpreter**                                  | **Classic interpreter**                                                    |
| Entry point             | `app_main()` (FreeRTOS task)                          | `main()` (Zephyr main thread)                                              |
| Build system            | ESP-IDF CMake + `idf.py`                              | West + Zephyr CMake                                                        |
| CPU cores used          | 2 (SMP FreeRTOS)                                      | 1 (`esp32s3_devkitc/esp32s3/procpu`)                                       |

The most consequential changes are the last three: **WAMR execution mode**, **memory architecture**, and **core count**.

#### WAMR Classic vs Fast Interpreter

The ESP-IDF build enables WAMR's fast interpreter (`CONFIG_WAMR_INTERP_FAST=y`). As described in [WebAssembly on Microcontrollers — WAMR](#webassembly-on-microcontrollers--wamr), fast-interp pre-processes bytecode in-place at load time. Zephyr's WAMR platform integration defaults to the classic interpreter (`WASM_ENABLE_FAST_INTERP=0`) — a safer default given that Zephyr's memory protection model can mark code regions as non-writable, and fast-interp's in-place modification would fault on such regions.

Classic interpreter is roughly 2–3× slower per iteration than fast-interp on the same hardware. For a benchmark of *how many* concurrent instances fit rather than *how fast each runs*, execution speed affects iterations-per-second but not peak instance count.

A side effect: because classic interpreter never modifies the bytecode buffer, the WASM bytes could in principle be loaded directly from read-only flash (DROM). The harness still copies them to the malloc arena before calling `wasm_runtime_load` — matching the ESP-IDF approach and ensuring forward compatibility if fast-interp is ever enabled.

#### Memory Architecture

On ESP-IDF, thread stacks and WAMR allocations compete from the same internal DRAM heap (~412 KB free at start). On Zephyr, they are segregated into two pools:

```text
Zephyr DRAM layout (399 KB usable dram0_0_seg):
  Zephyr kernel + BSS          ~100 KB  (code, globals, kernel data structures)
  Thread stacks (24 × 4 KB)     96 KB   (.noinit, static — never touches malloc arena)
  Malloc arena (WAMR)           192 KB  (CONFIG_COMMON_LIBC_MALLOC_ARENA_SIZE)
  Remaining headroom             ~11 KB
```

The segregation means WAMR instantiation cannot accidentally exhaust thread stack memory, and vice versa. The trade-off is that the maximum number of concurrent instances is bounded by whichever pool runs out first: the 24 pre-allocated stack slots, or the 192 KB arena.

#### Single-Core Target

The Zephyr board target `esp32s3_devkitc/esp32s3/procpu` runs exclusively on core 0. Unlike ESP-IDF's SMP FreeRTOS (which distributes threads across both LX7 cores), Zephyr's procpu target is single-core. This halves raw throughput for CPU-bound workloads but simplifies scheduling and eliminates SMP-related sources of non-determinism.

### Results

The same three workloads from the ESP-IDF run were executed in sequence (EXPERIMENT 0). Serial output captured at 115200 baud via `west espressif monitor`:

#### CPU workload: 24 concurrent instances

```text
=== WASM Stress Benchmark (Zephyr) ===
workload=cpu  wasm_stack=4KB
thread_stack=4KB (pre-allocated, 24 slots)  core=-1

instances=1    heap=185KB  min=185KB  cpu= 84%  up=3s
  +instance cost ~6KB  latency 0us
instances=2    heap=178KB  min=178KB  cpu=100%  up=5s
  +instance cost ~6KB  latency 0us
...
instances=16   heap= 91KB  min= 91KB  cpu=100%  up=38s
  +instance cost ~6KB  latency 0us
...
instances=24   heap= 40KB  min= 40KB  cpu=100%  up=56s
  +instance cost ~6KB  latency 0us

--- Peak: 24 concurrent WASM instances ---

  id  task   iters  errors  latency_us
   0  cpu      311       0           0
   1  cpu      239       0           0
  ...
  23  cpu        6       0           0
---

Post-teardown heap: 191KB free
```

**Key observations**: Each CPU instance costs **~6 KB from the malloc arena**. The arena starts at 191 KB free (1 KB used by WAMR runtime overhead); at 24 instances, 40 KB remains — the run stopped because all 24 pre-allocated stack slots were consumed, *not* because memory ran out. Post-teardown the full 191 KB is recovered: no leaks.

The `latency 0us` is a measurement gap: `k_cycle_get_64()` on this Zephyr/ESP32-S3 target does not advance at the expected rate, producing zero-width elapsed times. Actual call duration can be inferred from the iteration counts: instance 0 ran from t ≈ 3 s to t ≈ 56 s (53 s total) and completed 311 iterations, giving **~170 ms per call** at 24-instance load on a single core. On ESP-IDF fast-interp with 29 instances across 2 cores, the per-call time was 96 ms — consistent with classic interpreter overhead (≈ 1.8×) and half the core count partially compensating.

CPU utilisation jumps to 100% immediately at 2 instances (single core, 100% wall-clock busy), vs the ESP-IDF dual-core run which could absorb more threads before saturation.

#### MEM workload: 2 concurrent instances

```text
instances=1   heap=120KB  min=40KB  cpu=98%  up=62s
  +instance cost ~70KB  latency 0us
instances=2   heap= 50KB  min=40KB  cpu=100% up=65s
  +instance cost ~70KB  latency 0us
[wrn] bench: [2] instantiate failed: allocate linear memory failed
instances=3   TASK_DIED (errors=1)

--- Peak: 2 concurrent WASM instances ---
Post-teardown heap: 191KB free
```

Each MEM instance consumes **~70 KB** from the 192 KB arena (64 KB WASM linear memory page + ~6 KB overhead). Two instances occupy 140 KB, leaving 50 KB — insufficient for a third at 70 KB. The failure message is identical in meaning to the ESP-IDF OOM: `wasm_runtime_instantiate` returns false when linear memory allocation fails.

#### MSG workload: 2 concurrent instances

```text
instances=1   heap=120KB  min=40KB  cpu=68%  up=72s
  +instance cost ~70KB  latency 0us
instances=2   heap= 50KB  min=40KB  cpu=100% up=74s
  +instance cost ~70KB  latency 0us
[wrn] bench: [2] instantiate failed: allocate linear memory failed
instances=3   TASK_DIED (errors=1)

--- Peak: 2 concurrent WASM instances ---
Post-teardown heap: 191KB free
```

Same pattern as MEM — both workloads declare `(memory 1 1)`. At 2 instances, 50 KB remains: the ring-buffer simulation even at full 100% single-core load has no errors.

### Summary

| Workload               | Zephyr peak | ESP-IDF peak | Per-instance arena cost | Limiting factor                    |
| ---------------------- | ----------- | ------------ | ----------------------- | ---------------------------------- |
| CPU (no linear mem)    | **24**      | **29**       | ~6 KB                   | Stack-slot pool (24 pre-allocated) |
| MEM (64 KB linear mem) | **2**       | **3**        | ~70 KB                  | 192 KB malloc arena                |
| MSG (64 KB linear mem) | **2**       | **3**        | ~70 KB                  | 192 KB malloc arena                |

### Analysis

#### CPU: stack-slot ceiling, not an OOM

The Zephyr CPU result is **not comparable to the ESP-IDF result at face value**. On ESP-IDF, the run stopped at 29 because the heap was exhausted (~14 KB remaining, below the estimated 28 KB needed for the next instance). On Zephyr, it stopped at 24 because the pre-allocated stack array was full, with **40 KB of malloc arena still free**.

With 40 KB remaining at 6 KB per instance, the arena can accommodate roughly 6 more instances before OOM. A 30-slot stack pool would push the CPU peak to approximately **29–30 instances** — matching or slightly exceeding the ESP-IDF result, despite the Zephyr malloc arena being less than half the size of the ESP-IDF heap (192 KB vs ~412 KB). The difference is the segregated stack pool: on ESP-IDF, each 6 KB pthread stack competes with WAMR for the same heap; on Zephyr, stacks are pre-reserved in `.noinit` and never touch the arena.

#### MEM/MSG: arena size, not a fundamental limit

The Zephyr MEM/MSG cap of 2 (vs 3 on ESP-IDF) is a configuration ceiling: 3 × 70 KB = 210 KB > 192 KB arena. Increasing `CONFIG_COMMON_LIBC_MALLOC_ARENA_SIZE` to 224 KB (and reducing thread stack slots to reclaim the extra ~32 KB in `.noinit`) would push MEM/MSG to 3 instances — matching ESP-IDF. The Zephyr DRAM segment has ~11 KB of headroom above current usage, which limits how far the arena can be expanded without reducing stack slots.

#### Classic interpreter per-instance overhead

Classic interpreter does not pre-process bytecode at load time, so `wasm_module_t` is smaller than fast-interp's processed representation. The measured **~6 KB per CPU instance** from the Zephyr malloc arena breaks down as:

- WAMR interpreter stack: 4 KB (`wasm_stack_kb = 4`)
- `wasm_module_inst_t` + `wasm_exec_env_t`: ~1–2 KB
- WAMR internal allocations during instantiate: minimal (no fast-interp pre-process buffer)

Compare to ESP-IDF's ~16 KB per CPU instance, which includes the 6 KB pthread stack allocated from the same heap. The true per-instance WAMR overhead is similar (~6–10 KB in both cases); the apparent difference is that Zephyr accounts for thread stacks outside the arena.

---

## Comparison with Other Platforms

| Platform              | RAM         | WASM Runtime        | OS/RTOS                | Concurrent instances | Cost |
| --------------------- | ----------- | ------------------- | ---------------------- | -------------------- | ---- |
| ESP32-S3 — ESP-IDF    | 512 KB SRAM | WAMR fast-interp    | FreeRTOS SMP (2 cores) | **29 CPU, 3 MEM**    | ~$4  |
| ESP32-S3 — Zephyr     | 512 KB SRAM | WAMR classic-interp | Zephyr (1 core)        | **24¹ CPU, 2² MEM**  | ~$4  |
| Raspberry Pi Zero 2W  | 512 MB RAM  | Wasmtime            | Linux                  | ~200+                | ~$15 |
| Raspberry Pi 4 (2GB)  | 2 GB RAM    | Wasmtime            | Linux                  | 1000+                | ~$35 |

¹ Stack-slot limited at 24; malloc arena still had 40 KB free. A 30-slot pool reaches ~29–30 instances.
² Arena-size limited at 192 KB; a 224 KB arena allows 3 instances.

The same $4 chip reaches **29 CPU instances under ESP-IDF** and **24 under Zephyr** — the difference is configuration (stack-slot pool size and arena size), not a fundamental platform gap.

---

## What This Means for Propeller

Propeller's model is straightforward: a manager node dispatches compiled WASM binaries over MQTT to a fleet of embedded devices. Each device — running the Propeller proplet — receives the binary, loads it via WAMR, and runs it. A device might be running functions from several different deployments simultaneously: a temperature aggregator from one pipeline, a protocol decoder from another, a checksum validator from a third.

This benchmark characterises the limits of that model on the ESP32-S3 across both supported RTOS environments:

- **Up to 29 concurrent stateless functions** per device under ESP-IDF (~16 KB each, including thread stack). Under Zephyr, 24 with the default configuration — and ~29–30 with a larger stack-slot pool. A fleet of 100 boards can sustain nearly 3,000 concurrent WASM executions with commodity hardware totalling ~$400.
- **Up to 3 concurrent stateful functions** per device under ESP-IDF (64 KB linear memory page each); 2 under Zephyr with its 192 KB arena, or 3 with a 224 KB arena. If your pipeline stages maintain local state, budget accordingly — or target ESP32-S3R8 (8 MB PSRAM) for 40+ concurrent stateful instances.
- **RTOS choice is tunable, not binding**: the benchmark ran cleanly on both FreeRTOS (via ESP-IDF) and Zephyr RTOS. Teams that need Zephyr's vendor-neutral board support or POSIX compliance can adopt it without sacrificing WASM concurrency — the numbers are within configuration range of the ESP-IDF baseline.
- **Isolation is real**: across every experiment — 29 homogeneous instances under FreeRTOS, 24 under Zephyr, 10 heterogeneous instances in the diverse workload — zero errors, zero cross-contamination. Propeller's per-function isolation guarantee holds down to bare metal, regardless of the underlying RTOS.
- **Binary size matters for load time**: our hand-crafted WASM binaries are 72–170 bytes. A real TinyGo or Rust binary is 50–200 KB, which increases load time and shared-module memory cost. For production, keep function binaries small and strip debug info.

---

## Conclusion

A $4 microcontroller with 512 KB of SRAM can run 29 concurrent WebAssembly instances under FreeRTOS and 24 under Zephyr — with the Zephyr run stopping at a stack-slot ceiling rather than an OOM, meaning the memory headroom exists for more. Each instance is fully isolated: its own linear memory, its own execution state, its own call stack, regardless of which RTOS is underneath. When we swapped in five different task types on ESP-IDF, the system handled 10 simultaneous instances of mixed workloads without a single error.

Memory is the binding constraint, not CPU cycles. Linear memory pages cost 64 KB each, which is why memory-intensive workloads top out at 3 instances (ESP-IDF) or 2 (Zephyr with its 192 KB arena) while CPU-bound workloads scale to 29 and 24 respectively. PSRAM variants of the ESP32-S3 could push both figures dramatically higher, but even on the base hardware the numbers are striking: multi-tenant, sandboxed code execution on a chip smaller than a thumbnail, drawing 240 mW.

The Zephyr port adds something beyond raw numbers: it demonstrates that the WASM concurrency model is not tied to any one RTOS. The harness required adapting the thread and heap APIs, but the WAMR runtime, the workload binaries, and the shared-module architecture transferred unchanged. Teams choosing Zephyr for its hardware abstraction layer, POSIX compliance, or upstream tooling can run Propeller functions without re-benchmarking from scratch — the limits are governed by SRAM, not the scheduler.

This is what edge computing looks like when you strip away the container runtime and the orchestrator. Just a microcontroller, a WASM interpreter, and the functions you need to run.

Propeller is open source. The ESP-IDF benchmark source is at [examples/esp32s3-wasm-benchmark-espidf](https://github.com/absmach/propeller/tree/main/examples/esp32s3-wasm-benchmark-espidf) and the Zephyr port at [examples/esp32s3-wasm-benchmark-zephyr](https://github.com/absmach/propeller/tree/main/examples/esp32s3-wasm-benchmark-zephyr).

---

*ESP-IDF measurements: ESP32-S3-WROOM-1, ESP-IDF v5.3.2, WAMR fast-interpreter, FreeRTOS SMP dual-core, `esp_timer_get_time()` for timing. Zephyr measurements: same hardware, Zephyr 4.3.99, WAMR classic interpreter, single core (`procpu`), `k_cycle_get_64()` for timing (latency values unreliable — see note in Zephyr section). All benchmarks run in-process with no external tooling.*
