/** Content for the public product catalogue, grounded in project documentation. */
export type ProductGroup = "AI" | "Infrastructure" | "Hardware";
export type ProductVisualKind =
  | "atomic"
  | "parallax"
  | "motif"
  | "synth"
  | "atom"
  | "fluxmq"
  | "magistrala"
  | "propeller"
  | "a0"
  | "a1"
  | "quarc";

export interface IdentityProduct {
  slug: string;
  name: string;
  group: ProductGroup;
  eyebrow: string;
  tagline: string;
  summary: string;
  description: string;
  stage: string;
  visual: ProductVisualKind;
  image?: string;
  pricing?: string;
  features: Array<{ title: string; description: string }>;
  workflow: Array<{ title: string; description: string }>;
  related: string[];
  resources: Array<{ label: string; href: string }>;
}

export const products: IdentityProduct[] = [
  {
    slug: "atomic",
    name: "Atomic",
    group: "AI",
    eyebrow: "AI application builder",
    tagline: "An idea. A conversation. An application.",
    summary:
      "Turn a brief into a working web application, with source history, build previews, and a path to publication.",
    description:
      "Atomic brings application creation into a conversation. Describe what you need, review a working build, and ask for changes. Source history and previews give each iteration something concrete to inspect.\n\nTeams work in shared workspaces. Each published application runs in its own runtime, with Atom providing identity and application data. Atomic is in active development; we work through deployment and operational requirements with early users.",
    stage: "In development",
    visual: "atomic",
    features: [
      {
        title: "Build through conversation",
        description:
          "Generate and revise application source from a brief, with visible progress and a preview of the resulting build.",
      },
      {
        title: "Keep the source in view",
        description:
          "Browse verified versions, download source, and restore a previous working version as your application evolves.",
      },
      {
        title: "Work as a team",
        description:
          "Organise builders and applications in shared workspaces, with roles and access for app collaborators.",
      },
      {
        title: "Publish with a history",
        description:
          "Promote a verified frontend, track deployments, and roll back application code. Application data remains separate from code history.",
      },
    ],
    workflow: [
      {
        title: "Describe",
        description:
          "Start with the people, tasks, and information your application needs to support.",
      },
      {
        title: "Build and review",
        description:
          "Try the generated application, inspect the source, and refine it through further conversation.",
      },
      {
        title: "Publish",
        description:
          "Publish a verified version to its own application runtime and choose how users get access.",
      },
    ],
    related: ["atom", "motif", "synth"],
    resources: [
      {
        label: "Arrange an Atomic walkthrough",
        href: "/contact/?product=Atomic",
      },
      {
        label: "Explore the identity foundation",
        href: "/products/atom/",
      },
    ],
  },
  {
    slug: "parallax",
    name: "Parallax",
    group: "AI",
    eyebrow: "Predictive infrastructure",
    tagline: "Explore the change before you make it.",
    summary:
      "Evaluate how a Kubernetes system may respond to a proposed change, before that change reaches production.",
    description:
      "A deployment changes more than code. Parallax combines recent system telemetry with a proposed action to explore possible future behaviour: risk, time to degradation, alternatives, and potential mitigations.\n\nA read-only customer agent gathers the context. A learned, action-conditioned model evaluates scenarios, while a decision workflow keeps the evidence and rationale together. Parallax is advisory: the operator remains responsible for deciding and applying changes.",
    stage: "Research preview",
    visual: "parallax",
    features: [
      {
        title: "Look beyond the current state",
        description:
          "Evaluate a proposed deployment or supported action against recent telemetry and a model of how the system may evolve.",
      },
      {
        title: "Compare possible futures",
        description:
          "Review the proposal alongside a no-change baseline and mitigation scenarios on common scales.",
      },
      {
        title: "Keep the cluster read-only",
        description:
          "The customer agent observes and prepares bounded requests. Parallax does not apply, restart, scale, or delete workloads.",
      },
      {
        title: "Make decisions traceable",
        description:
          "Keep scenarios, evidence, decisions, and subsequent outcomes connected, including coverage and uncertainty.",
      },
    ],
    workflow: [
      {
        title: "Observe",
        description:
          "Collect a bounded window of Kubernetes and monitoring context through a read-only agent.",
      },
      {
        title: "Explore",
        description:
          "Submit a proposed change and compare the model’s possible trajectories and alternatives.",
      },
      {
        title: "Decide",
        description:
          "Review the evidence, record a decision, and compare predictions with observed outcomes.",
      },
    ],
    related: ["atom", "magistrala", "atomic"],
    resources: [
      {
        label: "Discuss a Parallax evaluation",
        href: "/contact/?product=Parallax",
      },
      { label: "Explore our research", href: "/research/" },
    ],
  },
  {
    slug: "motif",
    name: "Motif",
    group: "AI",
    eyebrow: "AI for go-to-market teams",
    tagline: "Product knowledge, put to work.",
    summary:
      "Turn product documentation and source material into informed content, with a workflow for review and publishing.",
    description:
      "The most useful product stories begin with knowing the product. Motif builds a knowledge base from documentation, source repositories, and configured sources, then uses that context to support content creation.\n\nIts current foundation covers blog posts, social content, release notes, carousels, and video workflows. The broader direction is an AI-assisted go-to-market team. Motif, previously Clara, is in development; broader sales and revenue workflows remain part of the product direction.",
    stage: "In development",
    visual: "motif",
    features: [
      {
        title: "Start from product knowledge",
        description:
          "Bring documentation, repositories, and selected sources into a knowledge base that provides context for generation.",
      },
      {
        title: "Create across formats",
        description:
          "Develop blog posts, release notes, social posts, and carousels from the same product understanding.",
      },
      {
        title: "Keep review in the workflow",
        description:
          "Revise generated material and use approval workflows before publishing through configured integrations.",
      },
      {
        title: "Build a wider picture",
        description:
          "Use SEO and search tracking, media discovery, and content workflows as the foundation for broader go-to-market work.",
      },
    ],
    workflow: [
      {
        title: "Connect knowledge",
        description:
          "Bring in the documentation, repositories, and sources that explain the product.",
      },
      {
        title: "Develop the story",
        description:
          "Create and revise material for the format, audience, and purpose you have in mind.",
      },
      {
        title: "Review and publish",
        description:
          "Review the work, approve it, and publish through your configured channels.",
      },
    ],
    related: ["atomic", "atom", "synth"],
    resources: [
      {
        label: "Arrange a Motif walkthrough",
        href: "/contact/?product=Motif",
      },
      { label: "Meet Abstract Machines", href: "/company/" },
    ],
  },
  {
    slug: "synth",
    name: "Synth",
    group: "AI",
    eyebrow: "AI-assisted electronics",
    tagline: "Circuit boards, built from code.",
    summary:
      "A compiler for electronic design: turn readable circuit source into KiCad schematics, PCB layouts, and bills of materials.",
    description:
      "Synth brings a software development workflow to electronics. Components, connections, and board constraints live in readable circuit source. A typed compiler checks that source and generates outputs engineers can inspect in KiCad.\n\nAn AI agent can find parts, write circuit code, read diagnostics, and refine a design through Synth’s MCP tools. Engineers retain the source, the checks, and the generated artifacts. Community provides the open compiler; Enterprise adds a managed workflow and team support.",
    stage: "Community + Enterprise",
    visual: "synth",
    features: [
      {
        title: "A design you can review",
        description:
          "Store components, connections, and constraints as text. Review changes in Git and preserve design intent in the source.",
      },
      {
        title: "A compiler at the centre",
        description:
          "Use typed compilation, deterministic placement and routing, and structured diagnostics to guide the design process.",
      },
      {
        title: "Checks with evidence",
        description:
          "Run electrical and physical checks. Required verification that cannot run is reported as unknown, rather than treated as a pass.",
      },
      {
        title: "A practical KiCad handoff",
        description:
          "Generate schematics, PCB layouts, and bills of materials. Inspect the outputs in KiCad before downstream engineering and manufacturing.",
      },
    ],
    workflow: [
      {
        title: "Describe the circuit",
        description:
          "Write SynthSpec source directly or ask an MCP-connected agent to develop it from a board brief.",
      },
      {
        title: "Compile and refine",
        description:
          "Resolve parts, run checks, and use structured diagnostics to revise the design.",
      },
      {
        title: "Inspect the outputs",
        description:
          "Open generated KiCad schematics and boards, review the BOM, and complete the required engineering checks.",
      },
    ],
    related: ["a0", "a1", "quarc"],
    resources: [
      {
        label: "Read the documentation",
        href: "https://www.absmach.eu/docs/synth/",
      },
      {
        label: "Explore the source on GitHub",
        href: "https://github.com/absmach/synth",
      },
      {
        label: "Read the prompt-to-PCB walkthrough",
        href: "https://www.absmach.eu/blog/prompt-to-pcb-with-synth/",
      },
    ],
  },
  {
    slug: "atom",
    name: "Atom",
    group: "Infrastructure",
    eyebrow: "Identity & access",
    tagline: "One model for who can do what.",
    summary:
      "Identity, authentication, and runtime authorization for people, devices, services, applications, and AI agents.",
    description:
      "As systems grow, permissions spread across services, devices, and applications. Atom brings identity and access decisions into a shared control plane: who an entity is, how it authenticated, and what it can do now.\n\nPeople and machines use the same identity model. Tenants, roles, policies, and resource definitions give product teams a foundation for access control, with decisions evaluated against current state and explanations available for review.",
    stage: "Open source",
    visual: "atom",
    features: [
      {
        title: "People and machines, together",
        description:
          "Represent users, devices, services, workloads, and applications as entities in a common identity model.",
      },
      {
        title: "Permissions evaluated at runtime",
        description:
          "Evaluate the current policy state for each authorization decision, so access changes do not depend on reissuing permission-bearing tokens.",
      },
      {
        title: "Boundaries for every tenant",
        description:
          "Model tenants, groups, resources, and roles with explicit ownership and permission boundaries.",
      },
      {
        title: "Understand the decision",
        description:
          "Inspect why access was allowed or denied, and use the public API to make security part of the application workflow.",
      },
    ],
    workflow: [
      {
        title: "Model",
        description:
          "Define the entities, resources, tenants, and actions that matter in your application.",
      },
      {
        title: "Authenticate",
        description:
          "Issue the credentials and sessions your people and machine clients need.",
      },
      {
        title: "Authorize",
        description:
          "Evaluate access against live policies and use the decision in your application.",
      },
    ],
    related: ["atomic", "magistrala", "fluxmq"],
    resources: [
      {
        label: "Read the documentation",
        href: "https://www.absmach.eu/docs/atom/",
      },
      {
        label: "Explore the source on GitHub",
        href: "https://github.com/absmach/atom",
      },
    ],
  },
  {
    slug: "fluxmq",
    name: "FluxMQ",
    group: "Infrastructure",
    eyebrow: "Messaging infrastructure",
    tagline: "Keep your systems in conversation.",
    summary:
      "An open-source message broker that connects devices and services across MQTT, WebSocket, HTTP, and CoAP.",
    description:
      "A connected system depends on messages reaching the right place. FluxMQ provides a shared broker core for devices and services that speak different protocols, with durable queues and a deployment model built around a Go binary.\n\nUse it independently or as part of the Magistrala platform. Configure transport security, storage, and clustering for the environment you operate, and observe message handling through metrics and structured logs.",
    stage: "Open source",
    visual: "fluxmq",
    features: [
      {
        title: "Meet clients where they are",
        description:
          "Support MQTT 3.1.1 and 5.0 over TCP and WebSocket, with HTTP-MQTT and CoAP bridges.",
      },
      {
        title: "Make delivery durable",
        description:
          "Use persistent queues, consumer groups, acknowledgement semantics, and dead-letter handling for message-processing workflows.",
      },
      {
        title: "Operate across nodes",
        description:
          "Configure broker clustering and distributed coordination for deployments that extend beyond a single instance.",
      },
      {
        title: "Secure and observe the flow",
        description:
          "Configure TLS or mutual TLS, rate limits, and authentication, with metrics and logs for day-to-day operations.",
      },
    ],
    workflow: [
      {
        title: "Configure",
        description:
          "Set your listeners, storage, credentials, and transport security for the deployment.",
      },
      {
        title: "Connect",
        description:
          "Connect publishers and subscribers using the protocols your devices and services already support.",
      },
      {
        title: "Operate",
        description:
          "Monitor traffic and delivery, manage queues, and configure clustering as your needs grow.",
      },
    ],
    related: ["magistrala", "atom", "a0"],
    resources: [
      {
        label: "Read the documentation",
        href: "https://www.absmach.eu/docs/fluxmq/",
      },
      {
        label: "Explore the source on GitHub",
        href: "https://github.com/absmach/fluxmq",
      },
    ],
  },
  {
    slug: "magistrala",
    name: "Magistrala",
    group: "Infrastructure",
    eyebrow: "Connected operations",
    tagline: "Bring connected assets into focus.",
    summary:
      "A platform for device connectivity, access control, and operational visibility, built on open-source infrastructure.",
    description:
      "Magistrala connects devices, routes telemetry, and gives teams a common place to work with their connected systems. Atom supplies the identity foundation, while FluxMQ handles multi-protocol messaging.\n\nThe open-source core and Community Edition support self-hosted deployments. Enterprise adds dashboards, rules, alarms, reporting, and audit capabilities. Managed options are available for teams that want Abstract Machines to operate the platform with them.",
    stage: "Community + Enterprise",
    visual: "magistrala",
    image: "/preview/ai/media/products/magistrala-dashboard.webp",
    pricing: "/magistrala/pricing/",
    features: [
      {
        title: "Connect a varied fleet",
        description:
          "Bring MQTT, CoAP, HTTP, and WebSocket clients into a common platform for connected devices.",
      },
      {
        title: "Define access consistently",
        description:
          "Use Atom-backed identity, domains, clients, channels, and policies to manage who can reach which resources.",
      },
      {
        title: "Turn telemetry into action",
        description:
          "Enterprise rules transform messages, trigger alarms, and connect operational events to notifications and storage.",
      },
      {
        title: "Choose how to operate",
        description:
          "Start with the self-hosted Community Edition, discuss Enterprise capabilities, or work with us on a managed deployment.",
      },
    ],
    workflow: [
      {
        title: "Connect assets",
        description:
          "Create a domain, register clients and channels, and connect devices with their supported protocols.",
      },
      {
        title: "Organise the data",
        description:
          "Route telemetry and define the access, storage, and processing your application needs.",
      },
      {
        title: "Build the operation",
        description:
          "Use the appropriate edition to add dashboards, rules, alarms, and reporting to your workflow.",
      },
    ],
    related: ["atom", "fluxmq", "a1"],
    resources: [
      {
        label: "Read the documentation",
        href: "https://www.absmach.eu/docs/magistrala/",
      },
      {
        label: "Explore the source on GitHub",
        href: "https://github.com/absmach/magistrala",
      },
      {
        label: "Explore existing deployments",
        href: "https://deployments.absmach.eu/",
      },
    ],
  },
  {
    slug: "propeller",
    name: "Propeller",
    group: "Infrastructure",
    eyebrow: "WebAssembly orchestration",
    tagline: "Move the workload closer to the work.",
    summary:
      "Deploy and manage portable WebAssembly workloads across cloud servers, edge gateways, and microcontrollers.",
    description:
      "Some work belongs close to the devices and data it serves. Propeller orchestrates WebAssembly workloads across cloud and edge environments, giving teams a way to deploy application logic where it is needed.\n\nPackage workloads in an OCI registry, assign them through the manager, and run them on distributed workers called proplets. Sandboxed runtimes support local processing, automation, and inference, with WAMR on Zephyr extending the approach to constrained devices.",
    stage: "Open source",
    visual: "propeller",
    features: [
      {
        title: "Place work where it matters",
        description:
          "Deploy WebAssembly applications across cloud servers, Linux gateways, and supported microcontrollers.",
      },
      {
        title: "Use a familiar delivery path",
        description:
          "Store and distribute workloads through OCI-compliant registries, keeping deployment connected to your build workflow.",
      },
      {
        title: "Run in a sandbox",
        description:
          "Execute application logic in isolated WebAssembly runtimes, including WAMR on Zephyr for constrained devices.",
      },
      {
        title: "Keep execution in view",
        description:
          "Manage jobs and workers, inspect logs, and follow workload status across your deployment.",
      },
    ],
    workflow: [
      {
        title: "Build the workload",
        description:
          "Compile your processing, automation, or inference logic into a WebAssembly module for the target runtime.",
      },
      {
        title: "Publish and deploy",
        description:
          "Push the module to an OCI registry and use Propeller to assign it to the appropriate workers.",
      },
      {
        title: "Observe and update",
        description:
          "Review execution status and logs, then deploy revised workloads as your application evolves.",
      },
    ],
    related: ["magistrala", "a0", "a1"],
    resources: [
      {
        label: "Read the documentation",
        href: "https://www.absmach.eu/docs/propeller/",
      },
      {
        label: "Explore the source on GitHub",
        href: "https://github.com/absmach/propeller",
      },
    ],
  },
  {
    slug: "a0",
    name: "A0",
    group: "Hardware",
    eyebrow: "Zephyr gateway",
    tagline: "Connect intelligence at the edge.",
    summary:
      "An ESP32-C6 gateway platform running Zephyr, connecting constrained devices with cloud and edge software.",
    description:
      "A0 brings a compact, embedded gateway to connected systems. Built around the ESP32-C6 and Zephyr RTOS, it provides a programmable foundation for connecting sensors and local devices to a broader application.\n\nThe platform combines wireless connectivity with interfaces for embedded development. It belongs to the same systems story as our software: connect devices, manage access, and move useful data between the physical world and applications.",
    stage: "Hardware platform",
    visual: "a0",
    image: "/preview/ai/media/products/a0.webp",
    features: [
      {
        title: "Built on Zephyr",
        description:
          "Develop on an open-source real-time operating system with an established embedded toolchain and driver ecosystem.",
      },
      {
        title: "ESP32-C6 foundation",
        description:
          "Use a RISC-V microcontroller platform with Wi-Fi 6, Bluetooth LE, and IEEE 802.15.4 radio capabilities.",
      },
      {
        title: "An embedded development path",
        description:
          "Work with the board’s documented interfaces and firmware to develop the connectivity your application needs.",
      },
      {
        title: "Part of a connected system",
        description:
          "Bring edge devices into messaging and device-management workflows built with the Abstract Machines software stack.",
      },
    ],
    workflow: [
      {
        title: "Define the edge",
        description:
          "Identify the sensors, interfaces, and connectivity needed by the installation.",
      },
      {
        title: "Develop the firmware",
        description:
          "Use the A0 documentation and Zephyr tooling to configure and build for the board.",
      },
      {
        title: "Connect the application",
        description:
          "Link the gateway to your messaging and platform services, then validate the complete system.",
      },
    ],
    related: ["a1", "fluxmq", "magistrala"],
    resources: [
      {
        label: "Read the hardware documentation",
        href: "https://www.absmach.eu/docs/hardware/a0/",
      },
      {
        label: "Discuss an A0 deployment",
        href: "/contact/?product=A0",
      },
    ],
  },
  {
    slug: "a1",
    name: "A1",
    group: "Hardware",
    eyebrow: "Linux edge gateway",
    tagline: "More capability, closer to the system.",
    summary:
      "A Linux gateway architecture combining RISC-V compute with embedded connectivity for edge applications.",
    description:
      "A1 extends the gateway concept to Linux workloads. Its architecture combines the A0 connectivity platform with BeagleV-Fire RISC-V compute, creating room for applications that need more than a microcontroller.\n\nThe Linux environment supports richer edge software and integration work. The documented platform is a starting point for engineering a gateway around your actual connectivity, processing, and deployment requirements.",
    stage: "Hardware platform",
    visual: "a1",
    image: "/preview/ai/media/products/a1.webp",
    features: [
      {
        title: "Linux at the edge",
        description:
          "Use a Linux environment for gateway services, local processing, and application integration.",
      },
      {
        title: "RISC-V compute",
        description:
          "Build on BeagleV-Fire’s PolarFire SoC platform and its combination of processor cores and FPGA fabric.",
      },
      {
        title: "A connected architecture",
        description:
          "Combine the A0 embedded connectivity layer with the capabilities of the Linux compute platform.",
      },
      {
        title: "An open engineering foundation",
        description:
          "Work from the hardware documentation and software stack to adapt the gateway to your installation.",
      },
    ],
    workflow: [
      {
        title: "Plan the gateway",
        description:
          "Map the local devices, network boundaries, and software workloads the gateway will serve.",
      },
      {
        title: "Bring up the platform",
        description:
          "Prepare the Linux compute board and embedded connectivity using the hardware guides.",
      },
      {
        title: "Integrate and validate",
        description:
          "Deploy the edge software and test the complete path from devices to applications.",
      },
    ],
    related: ["a0", "magistrala", "quarc"],
    resources: [
      {
        label: "Read the hardware documentation",
        href: "https://www.absmach.eu/docs/hardware/a1/",
      },
      {
        label: "Discuss an A1 deployment",
        href: "/contact/?product=A1",
      },
    ],
  },
  {
    slug: "quarc",
    name: "Quarc",
    group: "Hardware",
    eyebrow: "Post-quantum hardware research",
    tagline: "A foundation for the next security era.",
    summary:
      "A post-quantum secure-element project, exploring hardware-backed cryptography through an FPGA prototype.",
    description:
      "Quarc explores a hardware foundation for post-quantum security. The project combines a RISC-V control processor with cryptographic acceleration, moving from software models into FPGA implementation and verification.\n\nThis is active hardware research, not a finished secure-element chip. Current work includes FPGA bring-up on BeagleV-Fire, with further platform work planned. We welcome conversations about research, evaluation, and potential integration requirements.",
    stage: "FPGA prototype",
    visual: "quarc",
    features: [
      {
        title: "Post-quantum direction",
        description:
          "Explore hardware support for cryptographic methods designed for a world with quantum-capable adversaries.",
      },
      {
        title: "RISC-V control",
        description:
          "Combine a programmable control architecture with dedicated cryptographic building blocks.",
      },
      {
        title: "FPGA-first development",
        description:
          "Develop and verify the hardware design on an FPGA platform before progressing towards a physical secure element.",
      },
      {
        title: "A research collaboration",
        description:
          "Evaluate architecture, interfaces, and integration requirements together while the project is in development.",
      },
    ],
    workflow: [
      {
        title: "Model the design",
        description:
          "Define the cryptographic operations, processor interfaces, and security requirements.",
      },
      {
        title: "Prototype in hardware",
        description:
          "Implement and bring up the design on the FPGA evaluation platform.",
      },
      {
        title: "Verify and refine",
        description:
          "Use the prototype to test behaviour and inform the next stage of hardware development.",
      },
    ],
    related: ["synth", "a1", "atom"],
    resources: [
      {
        label: "Explore the source on GitHub",
        href: "https://github.com/absmach/quarc",
      },
      {
        label: "Discuss Quarc research",
        href: "/contact/?product=Quarc",
      },
      { label: "Explore our research", href: "/research/" },
    ],
  },
];
