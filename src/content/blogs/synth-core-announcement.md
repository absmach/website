---
slug: "synth-core-announcement"
title: "Synth: Open-Source Physical Design for Hardware That Starts as Code"
description: "We are open-sourcing Synth, a compiler and design language for describing electronic hardware, and previewing Synth-EE, an agentic cockpit for turning intent into inspectable KiCad designs."
date: "2026-09-16"
author:
  name: "Sammy Oina"
  picture: "https://avatars.githubusercontent.com/u/44265300?v=4"
coverImage: "/img/blogs/synth-core-announcement/synth-field-node-kicad.png"
ogImage:
  url: "/img/blogs/synth-core-announcement/synth-field-node-kicad.png"
tags:
  - synth
  - synth-ee
  - hardware
  - electronics
  - pcb
  - open-source
category: announcement
featured: true
---

## Hardware should be programmable all the way down

Software engineers can describe a system, compile it, test it, inspect the errors, and iterate. Hardware design still too often begins with a blank schematic canvas, a large component library, and a long chain of manual translation between intent, connectivity, placement, routing, and manufacturing files.

Today we are open-sourcing **Synth**, our first step toward a programmable physical-design stack for electronics. Synth is a compact hardware description language and compiler for expressing boards, components, connections, constraints, and manufacturing intent as source code.

Alongside it, we are previewing **Synth-EE**: a cockpit for exploring what happens when an agent can work with that source, call design tools, inspect compiler and KiCad diagnostics, and iteratively improve a board.

![KiCad schematic generated from Synth source](/img/blogs/synth-core-announcement/synth-schematic-kicad.png)

## Synth core: a small language with a concrete output

Synth is deliberately readable. A board can be described with components and explicit connectivity:

```synth
board "sensor_node" {
  layers 4
  manufacturer "jlcpcb"

  component U1: mcu "rp2350"
  component U2: secure_element "atecc608"
  component C1: capacitor "c_generic_0603"

  connect U1.vdd_io -> C1.p1
  connect U1.gp0 -> U2.sda
}
```

The important part is not the syntax by itself. The source is a durable, reviewable design contract. The compiler can resolve parts, check connectivity, derive an intermediate representation, route what it can, and emit real KiCad artifacts for further inspection and manufacturing workflows.

## From source to KiCad

Synth is designed to work with the tools engineers already use. Its output is intended to be opened and checked in KiCad, where the resulting schematic and PCB can be inspected at native fidelity rather than treated as a decorative preview.

![KiCad PCB render with component placement and routed connectivity](/img/blogs/synth-core-announcement/synth-field-node-kicad.png)

The render above is a representative KiCad output from the Synth design workflow. It shows the direction we are pursuing: components, copper, silkscreen references, and board geometry should remain visible and auditable throughout the process.

## Synth-EE: an agent that can show its work

Synth-EE is the experimental layer on top. The goal is not to ask a model to guess a finished PCB in one response. The goal is to give it a disciplined engineering loop:

1. translate a natural-language requirement into a typed design intent;
2. generate or revise Synth source;
3. compile and inspect structured diagnostics;
4. use constrained repairs for syntax, topology, placement, and routing issues;
5. preserve each step, artifact, and decision for review;
6. export only when the design passes the required gates.

This separation matters. Synth remains useful as a compiler and language even when no model is involved. Synth-EE can then use the compiler as a feedback-rich environment, much like a programming agent uses a language compiler and test suite.

## Why open source it now?

Physical design is too important to hide behind a generated image or a proprietary black box. We want the language, compiler behavior, output artifacts, and failure modes to be inspectable by the people who will rely on them.

Synth is an early project. The compiler and KiCad export path are active work, and Synth-EE is a preview rather than a promise that every board can already be generated autonomously. That is exactly why we are opening the work now: real hardware projects, real compiler errors, and real scrutiny will make the system better.

## What we are building toward

The longer-term direction is a complete, testable loop for electronics design:

- a stable and teachable Synth language;
- first-class compiler diagnostics with actionable repair hints;
- part-registry expansion with provenance and review;
- constraint-aware placement, board sizing, and routing;
- KiCad-native schematic, PCB, 3D, and fabrication outputs;
- durable agent runs that can be resumed, audited, and reproduced;
- human approval at the points where engineering judgment is required.

The model should be able to help with the work, but the compiler and design artifacts must remain the source of truth.

## Try it and follow along

Synth core is open source and available for experimentation today. Synth-EE is being developed alongside it as we work toward a useful agentic hardware-design workflow.

- **Synth core:** [GitHub](https://github.com/absmach/synth)
- **Synth-EE preview:** [Product page](https://www.absmach.eu/synth/)
- **Abstract Machines:** [absmach.eu](https://www.absmach.eu)

If you build with Synth, find a compiler edge case, or have a view on how agents should participate in hardware design, we would like to hear from you.
