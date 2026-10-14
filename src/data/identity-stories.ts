import { identityPhoto } from "./identity-photos";

export const stories = [
  {
    slug: "nokia",
    company: "Nokia",
    subject: "Data marketplace",
    kind: "Platform integration",
    summary:
      "Connecting real-time MQTT streams to Nokia’s Data Marketplace through Magistrala connectors.",
    title: "Connecting live data\nto new possibilities.",
    subtitle:
      "Magistrala connectors bring real-time MQTT data streams into Nokia’s Data Marketplace.",
    photo: identityPhoto("story-nokia.webp"),
    eyebrow: "Connectivity in practice",
    overviewTitle: "Useful data starts\nwith a connection.",
    paragraphs: [
      "Data marketplaces give organisations a way to share information across business boundaries. For connected systems, part of that information arrives continuously: messages from devices, sensors, and operational infrastructure.",
      "Our work with Nokia’s Data Marketplace connects those real-time MQTT streams through Magistrala connectors, supporting the flow of IoT data into a wider data-sharing environment.",
    ],
    details: [
      {
        title: "The setting",
        text: "Nokia’s Data Marketplace was introduced to support trusted exchange of data and AI models between organisations.",
      },
      {
        title: "The connection",
        text: "Magistrala connectors provide the link for real-time MQTT IoT data streams.",
      },
      {
        title: "The purpose",
        text: "Make connected-system data available within the marketplace’s data-sharing and monetisation workflows.",
      },
    ],
    flow: [
      {
        label: "Data sources",
        title: "Connected devices",
        detail: "Real-time MQTT streams",
      },
      {
        label: "Connectivity",
        title: "Magistrala",
        detail: "Marketplace connectors",
      },
      {
        label: "Data exchange",
        title: "Nokia Data Marketplace",
        detail: "Sharing and monetisation",
      },
    ],
    sourceTitle: "About Nokia Data Marketplace",
    sourceDescription:
      "Nokia’s launch announcement explains the marketplace’s purpose, data-sharing model, and industry context.",
    sourceUrl:
      "https://www.nokia.com/newsroom/nokia-launches-blockchain-powered-data-marketplace-for-secure-data-trading-and-ai-models/",
    sourceLabel: "Read Nokia’s announcement",
    note: "",
    other: {
      slug: "intel",
      company: "Intel",
      title: "A historical example of metering at the edge.",
    },
  },
  {
    slug: "intel",
    company: "Intel",
    subject: "Edge metering",
    kind: "Open-source engineering",
    summary:
      "Metering microservices for Mainflux and EdgeX, published in Intel’s open-source engineering archive.",
    title: "A closer view\nof connected systems.",
    subtitle:
      "A historical engineering example from our connectivity portfolio: metering microservices for Mainflux and EdgeX.",
    photo: identityPhoto("story-intel.webp"),
    eyebrow: "Engineering history",
    overviewTitle: "Understanding what\nflows through a system.",
    paragraphs: [
      "The public Intel Middleware-Metering project illustrates a practical monitoring task: counting device readings and messages, alongside local CPU and memory metrics.",
      "Its microservices work with Mainflux and EdgeX, with readings collected and visualised through a time-series stack. It is an example of making the behaviour of connected infrastructure visible to the people operating it.",
    ],
    details: [
      {
        title: "The setting",
        text: "An open-source metering example published by Intel for Mainflux and EdgeX middleware.",
      },
      {
        title: "The work",
        text: "Separate microservices expose device-message counts and local resource measurements.",
      },
      {
        title: "The view",
        text: "Telegraf, InfluxDB, and Chronograf collect, store, and visualise the measurements.",
      },
    ],
    flow: [
      {
        label: "Connected systems",
        title: "Mainflux / EdgeX",
        detail: "Device readings and messages",
      },
      {
        label: "Measurement",
        title: "Metering microservices",
        detail: "Message and resource metrics",
      },
      {
        label: "Observation",
        title: "Time-series dashboards",
        detail: "Collection and visualisation",
      },
    ],
    sourceTitle: "Explore the original engineering",
    sourceDescription:
      "Intel’s repository documents the microservices, data flow, and example configuration. The historical source uses the Mainflux name; our current connectivity portfolio includes Magistrala.",
    sourceUrl: "https://github.com/intel/Middleware-Metering",
    sourceLabel: "View Intel’s repository",
    note: "Intel has discontinued maintenance of this repository. This story describes the published engineering example.",
    other: {
      slug: "ericsson",
      company: "Ericsson",
      title: "Orchestrating IoT services across edge and cloud.",
    },
  },
  {
    slug: "ericsson",
    company: "Ericsson",
    subject: "IoT slice orchestration",
    kind: "Published research · 2019",
    summary:
      "Research by Ericsson and UC3M using Mainflux to explore IoT services across edge and cloud.",
    title: "Connected services.\nCoordinated systems.",
    subtitle:
      "A research prototype by Ericsson and UC3M explored IoT service orchestration with Mainflux, EdgeX Foundry, and Kubernetes.",
    photo: identityPhoto("story-ericsson.webp"),
    eyebrow: "Research in practice",
    overviewTitle: "From individual services\nto a working system.",
    paragraphs: [
      "An IoT application can depend on services running in several places: a gateway close to devices, shared edge infrastructure, and a remote cloud. Coordinating those services is part of making the whole application work.",
      "In a 2019 paper, researchers from Ericsson Spain R&D and Universidad Carlos III de Madrid demonstrated a functional prototype for orchestrating IoT slices. The prototype used Mainflux as its IoT server and EdgeX Foundry as its gateway, with Kubernetes and Helm coordinating deployment.",
    ],
    details: [
      {
        title: "The setting",
        text: "A published research prototype examining how IoT services can share edge and cloud infrastructure.",
      },
      {
        title: "The platform",
        text: "Mainflux supplied IoT server functions, including device provisioning, messaging, and measurement storage.",
      },
      {
        title: "The orchestration",
        text: "Kubernetes and Helm supported the deployment of the microservices needed by each IoT slice.",
      },
    ],
    flow: [
      {
        label: "At the edge",
        title: "EdgeX Foundry",
        detail: "Gateway services near devices",
      },
      {
        label: "IoT services",
        title: "Mainflux",
        detail: "Provisioning, messages, and measurements",
      },
      {
        label: "Across environments",
        title: "Kubernetes & Helm",
        detail: "Microservice deployment and orchestration",
      },
    ],
    sourceTitle: "Read the published research",
    sourceDescription:
      "Enabling the Orchestration of IoT Slices through Edge and Cloud Microservice Platforms was published in Sensors on 5 July 2019. The paper describes the architecture, implementation, and evaluation of the prototype.",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6651043/",
    sourceLabel: "Read the full paper",
    note: "The original research uses the Mainflux name. Magistrala is part of our current connectivity portfolio.",
    other: {
      slug: "target",
      company: "Target",
      title: "Connecting cloud services with the retail edge.",
    },
  },
  {
    slug: "target",
    company: "Target",
    subject: "In-store IoT platform",
    kind: "Engineering talk · 2019",
    summary:
      "An open-source foundation for connecting cloud services and in-store edge infrastructure with Mainflux.",
    title: "From the cloud\nto the shop floor.",
    subtitle:
      "An engineering story from Target’s IoT platform, connecting cloud services with the edge inside retail stores.",
    photo: identityPhoto("story-target.webp"),
    eyebrow: "Connected retail",
    overviewTitle: "A platform that reaches\nwhere the work happens.",
    paragraphs: [
      "Retail systems operate across two distinct environments: shared cloud services and physical stores. An IoT platform provides a way for devices and applications in those environments to exchange information.",
      "At IoTFuse 2019, Target principal engineer Dan Cundiff presented the company’s approach to building an IoT platform. Our published platform history identifies Mainflux as an open-source foundation connecting cloud services and store-level edge infrastructure.",
    ],
    details: [
      {
        title: "The setting",
        text: "Target’s approach to building an IoT platform, presented at the IoTFuse conference in 2019.",
      },
      {
        title: "The foundation",
        text: "Mainflux provided part of the open-source connectivity foundation described in our platform history.",
      },
      {
        title: "The reach",
        text: "A system spanning cloud services and edge infrastructure within retail stores.",
      },
    ],
    flow: [
      {
        label: "Physical environment",
        title: "Store devices",
        detail: "Connected systems in retail spaces",
      },
      {
        label: "Local connectivity",
        title: "Store-level edge",
        detail: "Services close to the devices",
      },
      {
        label: "Shared platform",
        title: "Cloud services",
        detail: "Connectivity across environments",
      },
    ],
    sourceTitle: "Hear the engineering story",
    sourceDescription:
      "Dan Cundiff’s IoTFuse 2019 talk, Building an IoT Platform at Target, presents the company’s engineering perspective. Our Magistrala platform history documents the Mainflux connection and links to the same presentation.",
    sourceUrl: "https://www.youtube.com/watch?v=VenSmkpzC8w&t=1988s",
    sourceLabel: "Watch the conference talk",
    secondarySourceUrl: "https://magistrala.absmach.eu/",
    secondarySourceLabel: "Read our platform history",
    note: "The historical platform was named Mainflux. Explore Magistrala in our current portfolio for today’s connectivity work.",
    other: {
      slug: "nokia",
      company: "Nokia",
      title: "Connecting live data to a wider marketplace.",
    },
  },
];
