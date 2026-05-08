export interface SolutionItem {
  ic: string;
  title: string;
  desc: string;
}

export interface Solution {
  title: string;
  slug: string;
  image: string;
  summary: string;
  description: string;
  heroDetail: string;
  whyMagistrala: string;
  dashboardScreenshots: { src: string; alt: string }[];
  docsPath?: string;
  challenges: { title: string; subtitle: string; items: [SolutionItem, SolutionItem, SolutionItem] };
  howItWorks: { subtitle: string; steps: { title: string; desc: string }[] };
  applications: { title: string; subtitle: string; items: SolutionItem[] };
  benefits: string[];
  faq: { question: string; answer: string }[];
  metaDescription: string;
}

export const solutions: Solution[] = [
  {
    title: "Smart Water Metering",
    slug: "smart-water",
    image: "/img/solutions/smart-water-metering.jpg",
    summary:
      "Most utilities find out about burst pipes from tenant complaints. This pack connects your meters and sensors to a single platform, catches problems in seconds, and files weekly compliance reports automatically.",
    description:
      "The Smart Water Metering pack gives water utilities and facility managers a live view of their distribution networks. Flow, pressure, water quality, pump state, and tank levels all land in pre-built dashboards with detection rules and scheduled reports already wired up.",
    heroDetail:
      "Seven detection rules watch the network around the clock, catching slow leaks, sudden bursts, water quality problems, and devices that go dark, with alerts delivered in seconds over email and the platform.",
    whyMagistrala:
      "Your existing field devices probably already speak MQTT or HTTP, so there's nothing to replace in the field. Raw readings and validated data stay in separate channels, so a sensor glitch never triggers a false alarm. One dashboard template covers any number of zones or customer accounts. Compliance reports go out automatically every week.",
    docsPath: "/docs/user-guide/solution-packs/smart-water-metering/",
    dashboardScreenshots: [
      { src: "/img/solutions/smart-water/kpi-dashboard.png", alt: "KPI Dashboard showing total consumption, network pressure, and water quality status" },
      { src: "/img/solutions/smart-water/real-time-dashboard.png", alt: "Real-Time Monitoring Dashboard with live flow rate, pressure trend, and active alarms" },
      { src: "/img/solutions/smart-water/consumption-dashboard.png", alt: "Consumption Analytics Dashboard with historical usage trends" },
      { src: "/img/solutions/smart-water/alarms-dashboard.png", alt: "Alarm Monitoring Dashboard with active alarms by severity" },
    ],
    challenges: {
      title: "Problems utilities deal with every day",
      subtitle: "The operational and financial costs of reactive water management are well documented.",
      items: [
        { ic: "B!", title: "Finding out about bursts from tenants, not telemetry", desc: "Most utilities hear about burst pipes from a complaint call. By then, the damage is done. The alarm should fire first." },
        { ic: "NR", title: "A CFO who can't explain Non-Revenue Water losses", desc: "NRW of 20–40% is common in ageing networks. Without zone-level flow data, there's no way to know where the losses are." },
        { ic: "RP", title: "Water quality compliance reports assembled by hand", desc: "Pulling pH, turbidity, and TDS data from multiple systems every week, then formatting it for the regulator. Every single week." },
      ],
    },
    howItWorks: {
      subtitle: "Four steps from field device to actionable insight",
      steps: [
        { title: "Ingest", desc: "Meters and sensors send readings over MQTT, HTTP, CoAP, or WebSocket. Every raw reading is saved immediately." },
        { title: "Validate", desc: "Each reading is checked for plausibility before alarm logic runs. Impossible values are discarded. Only clean data moves forward." },
        { title: "Detect", desc: "Rules watch the clean data continuously. Pressure drops while flow spikes? Leak alarm. Flow surges? Burst alarm. pH drifts? Quality alarm. Device goes quiet? Offline alarm." },
        { title: "Report", desc: "Daily consumption, weekly network performance, and weekly water quality reports go out automatically. Long-term records write to PostgreSQL." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "Where utilities and property managers deploy smart metering",
      items: [
        { ic: "MU", title: "Municipal distribution network monitoring", desc: "Flow, pressure, and quality at DMA boundaries. Leaks detected within minutes. NRW trends tracked monthly." },
        { ic: "MP", title: "Multi-site commercial and residential property", desc: "Tenants see their own usage. Building managers get aggregate consumption and burst alarms." },
        { ic: "WQ", title: "Water quality compliance for regulated supplies", desc: "Continuous WHO-threshold monitoring. Weekly compliance reports delivered automatically." },
        { ic: "PS", title: "Pump station and storage tank management", desc: "Live pump state, energy draw, and tank levels. Spot inefficient pump cycles. Schedule refills before pressure drops." },
      ],
    },
    benefits: [
      "Leak alarms fire within seconds of threshold breach, not hours after a tenant complaint",
      "Zone-level flow data identifies where NRW losses are occurring so rehabilitation spend goes to the right places",
      "Water quality compliance reports generate and deliver automatically every week",
      "Device Health Monitor flags offline sensors within 10–20 minutes, preventing silent data gaps in regulatory records",
      "Tag-based templates scale a single dashboard definition across any number of zones without duplicating configuration",
    ],
    faq: [
      { question: "Our meters don't speak MQTT or HTTP. Can we still connect them?", answer: "Yes. A gateway sitting between your field devices and the platform can handle the protocol translation. Magistrala also ships a LoRa adapter and OPC-UA adapter that connect those networks natively." },
      { question: "Can the pack handle multiple pressure zones with different normal operating ranges?", answer: "Yes. You can deploy additional rule instances with zone-specific thresholds and assign each rule to the channel or group corresponding to that zone." },
      { question: "How does the solution support Non-Revenue Water calculation?", answer: "The pack provides the metered volume data that NRW calculation requires: zone-level flow totals, daily consumption, and long-term volume records from the PostgreSQL archive." },
      { question: "What happens if a device goes offline during a quality exceedance event?", answer: "The Device Health Monitor raises a Warning alarm within 10–20 minutes of the last received message. If the device went offline while reporting an out-of-range reading, the quality alarm remains active in the log." },
    ],
    metaDescription: "Monitor water flow, pressure, and tank levels in real time. Detect leaks within seconds, automate compliance reports, and reduce NRW losses with Magistrala.",
  },

  {
    title: "Smart City",
    slug: "smart-city",
    image: "/img/solutions/smart-city.jpg",
    summary:
      "Digitize urban infrastructure and unify civic command centers. Monitor traffic, energy, and public utilities from a single platform.",
    description:
      "Transform disconnected urban infrastructure into a unified, data-driven command center. The Smart City Solution Pack gives municipalities real-time visibility across traffic systems, street lighting, waste management, and public energy grids.",
    heroDetail:
      "The Smart City Solution Pack is built for municipalities and city operators who need to move beyond manual monitoring and siloed systems. It addresses the complete urban IoT lifecycle: from device onboarding and multi-protocol data ingestion to real-time alerting, automated rule execution, and executive reporting.",
    whyMagistrala:
      "Magistrala's open-source core provides the multi-protocol connectivity, per-device credential management, and rule-engine foundation that large-scale urban deployments demand. Its built-in multi-tenancy lets each city department manage their own data view, while open APIs ensure you're never locked into a proprietary ecosystem.",
    dashboardScreenshots: [
      { src: "/img/magistrala/dashboard-1.png", alt: "Smart City operations overview dashboard" },
      { src: "/img/magistrala/alarms-1.png", alt: "Smart City alarm management panel" },
      { src: "/img/magistrala/dashboard-2.png", alt: "Smart City live telemetry dashboard" },
      { src: "/img/magistrala/rules-engine-1.png", alt: "Smart City rules engine configuration" },
    ],
    challenges: {
      title: "Cities are drowning in disconnected data",
      subtitle: "Urban infrastructure generates enormous amounts of data, but fragmented systems mean operators can't act on it fast enough.",
      items: [
        { ic: "SI", title: "Fragmented Infrastructure", desc: "Traffic, lighting, waste, and energy systems run on separate platforms with no unified visibility, creating blind spots and duplicated efforts." },
        { ic: "IR", title: "Slow Incident Response", desc: "Without real-time alerts, incidents like traffic accidents or infrastructure failures are discovered hours or days after the fact." },
        { ic: "CO", title: "Escalating Operating Costs", desc: "Manual monitoring, fixed-schedule maintenance, and energy waste drive costs up with no data-driven path to reduce them." },
      ],
    },
    howItWorks: {
      subtitle: "From distributed sensors to a unified operations center, in one platform.",
      steps: [
        { title: "Connect", desc: "Traffic cameras, smart meters, environmental sensors, and lighting nodes connect over MQTT or HTTP using pre-configured client credentials." },
        { title: "Stream", desc: "Telemetry flows into dedicated channels organized by infrastructure type (traffic, energy, waste, safety) with automatic normalization." },
        { title: "Analyze", desc: "The rules engine evaluates incoming data in real time, triggering alerts for congestion, energy spikes, overflowing bins, or public safety incidents." },
        { title: "Act", desc: "Operators receive alarms in the dashboard, automated notifications are dispatched, and downstream actuators can be triggered via outbound channels." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "What cities are running on this pack today",
      items: [
        { ic: "TM", title: "Adaptive Traffic Management", desc: "Real-time congestion monitoring with automated signal timing adjustments and incident alerts to reduce commute times." },
        { ic: "SL", title: "Smart Street Lighting", desc: "Occupancy-based dimming schedules slash energy use. Faulty luminaires trigger maintenance tickets automatically." },
        { ic: "WC", title: "Intelligent Waste Collection", desc: "Fill-level sensors route collection vehicles only to full bins, cutting collection kilometres by up to 40%." },
        { ic: "PS", title: "Public Safety Monitoring", desc: "Environmental anomaly detection and infrastructure integrity alerts improve response times across city zones." },
      ],
    },
    benefits: [
      "Reduce operational costs by up to 35% through optimized scheduling and predictive maintenance",
      "Cut incident response time from hours to minutes with real-time alerting",
      "Single pane of glass for all urban infrastructure; no more siloed dashboards",
      "Built-in multi-tenancy lets each city department manage their own view",
      "Open source core means no vendor lock-in; extend as your needs grow",
      "Enterprise-grade security with per-device credentials and role-based access control",
    ],
    faq: [
      { question: "Can Magistrala integrate with existing city management software?", answer: "Yes. Magistrala exposes REST and WebSocket APIs that integrate with GIS platforms, ERP systems, and city dashboards such as Esri ArcGIS and SAP. Webhook sinks push events directly to existing ticketing and dispatch systems." },
      { question: "How do you handle multi-tenancy across city departments?", answer: "Magistrala uses domain-level isolation backed by SpiceDB policies. Each department operates in its own domain with its own device groups, channels, and user roles. Cross-domain data sharing is configured explicitly through policy grants." },
      { question: "What happens if connectivity to the central platform is lost?", answer: "Edge gateway nodes buffer messages locally during connectivity gaps and replay them in order once the link is restored. Time-series data arrives with original device timestamps." },
      { question: "How quickly can the Smart City pack be deployed?", answer: "The pre-configured pack installs on Magistrala Cloud in minutes; clients, channels, rules, dashboards, and alarms are all included. Custom device types and additional integrations can be added incrementally." },
    ],
    metaDescription: "Deploy a smart city IoT platform in minutes. Pre-configured traffic, lighting, waste, and energy monitoring on Magistrala — ready out of the box.",
  },

  {
    title: "Smart Energy",
    slug: "smart-energy",
    image: "/img/solutions/smart-energy.jpg",
    summary:
      "Balance loads and monitor renewable generation with sub-millisecond telemetry and automated alerts.",
    description:
      "Modernize energy infrastructure management with a pre-built IoT platform covering grid monitoring, renewable generation, load balancing, and demand response. The Smart Energy Pack delivers enterprise-grade telemetry and analytics without weeks of integration work.",
    heroDetail:
      "The Smart Energy Grid Pack is engineered for energy utilities, grid operators, and industrial energy managers who need real-time visibility across generation, transmission, and consumption. It spans the full grid intelligence stack: from sub-station telemetry and renewable output monitoring to load balancing automation and demand response event management.",
    whyMagistrala:
      "Magistrala's high-throughput message bus and persistent time-series store handle the sub-second telemetry volumes that energy grid monitoring demands, while the rules engine enables automated load control actions without any custom middleware development.",
    dashboardScreenshots: [
      { src: "/img/magistrala/dashboard-1.png", alt: "Smart Energy grid operations dashboard" },
      { src: "/img/magistrala/dashboard-2.png", alt: "Energy generation and load analytics" },
      { src: "/img/magistrala/alarms-1.png", alt: "Energy grid alarm management" },
      { src: "/img/magistrala/rules-engine-1.png", alt: "Energy demand response rules engine" },
    ],
    challenges: {
      title: "The grid is more complex than ever",
      subtitle: "Distributed renewables, EV charging, and prosumer energy flows are pushing traditional grid management to its limits.",
      items: [
        { ic: "GI", title: "Grid Instability", desc: "Intermittent renewable generation creates unpredictable load imbalances that traditional SCADA systems can't detect and respond to fast enough." },
        { ic: "LV", title: "Limited Visibility", desc: "Distribution networks lack sensor density, creating blind spots where faults develop undetected until customers report outages." },
        { ic: "DV", title: "Rising Demand Volatility", desc: "EV adoption and heat pump growth are creating new demand peaks that existing capacity planning models weren't designed for." },
      ],
    },
    howItWorks: {
      subtitle: "From grid edge to operations center, real-time intelligence at every voltage level.",
      steps: [
        { title: "Measure", desc: "Smart meters, inverters, and grid sensors stream high-frequency power quality and energy flow data into Magistrala over MQTT or HTTP at configurable intervals." },
        { title: "Normalize", desc: "Incoming telemetry is timestamped, normalized by channel type, and partitioned by asset group (generation, distribution, or consumption) for clean analytics." },
        { title: "Alert", desc: "Pre-configured power quality rules detect voltage excursions, harmonics, overloads, and anomalous consumption patterns in real time, firing alarms before damage occurs." },
        { title: "Respond", desc: "Operators receive actionable alarms. Demand response rules can trigger downstream actuation: load shedding, storage dispatch, or curtailment signals." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "What energy operators are running on this pack",
      items: [
        { ic: "LB", title: "Load Balancing & Demand Response", desc: "Automated demand response programs shed controllable loads during peak periods, reducing grid stress and avoiding costly peak tariff charges." },
        { ic: "RE", title: "Renewable Generation Monitoring", desc: "Real-time solar and wind generation tracking with curtailment alerts, yield forecasting, and performance benchmarking." },
        { ic: "GF", title: "Grid Fault Detection", desc: "Voltage sag, swell, and harmonic distortion detection across distribution feeders, enabling rapid fault isolation before customer impact." },
        { ic: "EA", title: "Energy Audit & Reporting", desc: "Automated daily and monthly energy balance reports for utility billing reconciliation, regulatory submission, and carbon accounting." },
      ],
    },
    benefits: [
      "Detect and respond to grid faults in seconds, not minutes, reducing outage duration and SAIDI scores",
      "Increase renewable utilization with real-time generation-to-demand matching",
      "Cut energy audit costs with automated reporting replacing manual data gathering",
      "Enable demand response programs with rules-based load control, no custom integration needed",
      "Sub-second telemetry resolution captures power quality events traditional meters miss",
      "Multi-tenant architecture lets distribution companies serve multiple network operators from one platform",
    ],
    faq: [
      { question: "What grid protocols and device types does the Smart Energy pack support?", answer: "Magistrala natively supports MQTT, HTTP, CoAP, and WebSocket. Smart meters and inverters using Modbus, IEC 61850, or DNP3 connect via an external protocol adapter." },
      { question: "How does demand response automation work?", answer: "Demand response rules monitor real-time load and generation data against configurable thresholds. When a threshold is breached, the rules engine triggers load-shedding commands and notifies dispatch operators." },
      { question: "Can we monitor multiple grid zones or substations from one platform?", answer: "Yes. Magistrala's multi-tenant architecture lets you organize substations, feeders, and distributed energy resources into separate domains with their own access policies." },
      { question: "How is power quality event data handled for compliance reporting?", answer: "Sub-second telemetry resolution captures voltage sags, harmonics, and frequency deviations. Automated daily and monthly compliance reports are generated from raw event data." },
    ],
    metaDescription: "Deploy smart grid monitoring in minutes. The Magistrala Smart Energy Pack includes pre-configured meters, demand response rules, and grid fault dashboards.",
  },

  {
    title: "Cold Storage Monitoring",
    slug: "cold-storage",
    image: "/img/solutions/cold-storage.jpg",
    summary:
      "This pack connects your cold room sensors to a single platform, fires HACCP alarms the moment a threshold is crossed, and delivers automated compliance reports.",
    description:
      "The Cold Storage Monitoring pack gives food safety managers and facility operators real-time visibility across frozen and chilled zones. Temperature, humidity, CO2, door sensors, and energy meters all feed into pre-built dashboards with eight detection rules and three scheduled reports.",
    heroDetail:
      "Eight detection rules run continuously: temperature alerts enforce zone-specific HACCP thresholds; humidity alerts catch condensation risk; CO2 alerts enforce OSHA worker safety limits; door open tracking fires at 120 seconds; power failure alarms protect compressor equipment immediately on grid loss; battery backup monitoring fires before the UPS is exhausted; and energy anomaly detection flags compressors drawing above 5,000 W before fault escalates.",
    whyMagistrala:
      "All field devices connect to the same Telemetry Channel with per-client MQTT credentials, so a sensor fault on one device does not affect the rest of the monitoring network. One Cold Room Status template scales to any number of customer storage units by device tag without duplicating dashboard configuration.",
    docsPath: "/docs/user-guide/solution-packs/cold-storage-monitoring/",
    dashboardScreenshots: [
      { src: "/img/solutions/cold-storage/operations-overview-dashboard.png", alt: "Cold Storage Operations Overview with frozen zone and chilled zone temperature gauges" },
      { src: "/img/solutions/cold-storage/energy-power-dashboard.png", alt: "Energy & Power Dashboard with refrigeration unit power draw gauges" },
      { src: "/img/solutions/cold-storage/alarms-dashboard.png", alt: "Alarm Monitoring Dashboard with active alarm counts by severity" },
      { src: "/img/solutions/cold-storage/cold-room-status-template.png", alt: "Cold Room Status template showing live temperature, humidity, CO2, and door status" },
    ],
    challenges: {
      title: "Problems cold storage operators deal with every shift",
      subtitle: "Temperature exceedances, equipment faults, and compliance gaps all have warning signals; the problem is catching them before product is at risk.",
      items: [
        { ic: "TW", title: "A frozen zone warming past −15 °C overnight with no one on site", desc: "A compressor fault or door left ajar during a late loading run can push a frozen room toward the −12 °C HACCP critical limit in hours." },
        { ic: "PA", title: "Paper logs that are incomplete when the auditor arrives", desc: "Manual temperature logs have gaps during nights, weekends, and busy periods. When a food safety regulator asks for 30 days of records, incomplete logs mean failed audits." },
        { ic: "CF", title: "A compressor fault discovered after the room has warmed", desc: "A refrigeration unit drawing 6,000 W instead of its normal 2,500 W is heading toward failure. Without continuous power draw monitoring, the first sign is often a warm room and spoiled stock." },
      ],
    },
    howItWorks: {
      subtitle: "Four steps from cold room sensor to actionable alarm",
      steps: [
        { title: "Ingest", desc: "Temperature/humidity sensors, CO2 monitors, door sensors, power supply monitor, and energy meters publish SenML readings over MQTT to the Telemetry Channel." },
        { title: "Detect", desc: "Eight rules evaluate every incoming record in real time. Frozen zone above −15 °C fires a Warning; above −12 °C fires Critical. Door open beyond 120 seconds fires a Warning." },
        { title: "Alert", desc: "Alarms appear on the dashboard the moment a threshold is crossed. Email notifications go to configured recipients with the device, measurement, value, and threshold included." },
        { title: "Report", desc: "Daily temperature logs, weekly energy consumption reports, and monthly HACCP compliance summaries run automatically and deliver by email." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "Where the Cold Storage Monitoring pack is deployed today",
      items: [
        { ic: "HC", title: "Frozen and chilled warehouse HACCP compliance", desc: "Continuous zone-specific monitoring against HACCP critical limits. Warning alarms fire at −15 °C and +5 °C, giving operators a response window." },
        { ic: "PH", title: "Pharmaceutical cold storage", desc: "Temperature-sensitive drugs and vaccines monitored against WHO PQS and GDP guidelines. CO2 level monitoring provides additional worker safety coverage." },
        { ic: "EH", title: "Refrigeration equipment health monitoring", desc: "Compressor power draw tracked against the normal operating range. Energy anomaly warnings fire before mechanical failure forces a room shutdown." },
        { ic: "RC", title: "Regulatory compliance reporting", desc: "Monthly HACCP compliance summaries with temperature history and exceedance alarm counts per zone, ready for food safety authority submissions." },
      ],
    },
    benefits: [
      "HACCP temperature warnings fire at −15 °C and +5 °C, giving operators a response window before critical limits are reached",
      "CO2 worker safety monitoring enforces OSHA limits: warning at 2,000 ppm and evacuation alarm at 5,000 ppm",
      "Door open alarms fire at 120 seconds so operators can act before significant thermal ingress affects room temperature",
      "Grid power failure triggers a Critical alarm immediately; undervoltage below 180 V triggers a second Critical before compressor motors are damaged",
      "Monthly HACCP compliance reports generate automatically with per-zone temperature history and exceedance alarm counts",
      "One Cold Room Status template scales to any number of customer storage units with no duplicate dashboard configuration",
    ],
    faq: [
      { question: "Which temperature sensor types and protocols are supported?", answer: "Magistrala natively supports MQTT, HTTP, CoAP, and WebSocket. Sensors using BLE, Zigbee, LoRaWAN, RS-485, or 1-Wire connect via an external protocol adapter that translates readings into SenML payloads." },
      { question: "How does the system handle HACCP threshold breaches?", answer: "Zone-specific temperature rules evaluate each incoming record in real time. For the frozen zone, Warning fires at −15 °C and escalates to Critical at −12 °C. Each alarm includes the device, measurement name, current value, and breach threshold." },
      { question: "Can I monitor multiple cold rooms or facilities from one platform?", answer: "Yes. The pack ships with two zones but scales to any number. The Cold Room Status template scales automatically by device tag, so new rooms are covered without changing the template definition." },
      { question: "How are the monthly HACCP compliance reports generated?", answer: "The Monthly Compliance Report aggregates temperature readings for both cold rooms at daily intervals over the previous 30 days, including average, minimum, and maximum values per zone alongside a count of exceedance alarms." },
    ],
    metaDescription: "Monitor cold storage zones against HACCP thresholds in real time. Includes temperature, humidity, CO2 safety monitoring, and automated HACCP compliance reports.",
  },

  {
    title: "Smart Farming",
    slug: "smart-farming",
    image: "/img/solutions/smart-farming.jpg",
    summary:
      "Maximize agricultural yield via predictive models and real-time soil, weather, and crop analytics.",
    description:
      "Give farmers and agribusinesses the data infrastructure to make precision decisions on irrigation, fertilization, pest management, and harvest timing. The Precision Agriculture Pack connects field sensors to actionable dashboards with zero setup complexity.",
    heroDetail:
      "The Precision Agriculture Pack provides farmers and agribusinesses with the data infrastructure to make precision agronomic decisions at field scale. It connects soil moisture probes, microclimate weather stations, nutrient sensors, and irrigation controllers into a unified data platform with pre-built analytics for crop stress detection, irrigation scheduling, and yield prediction.",
    whyMagistrala:
      "Magistrala's open protocol support lets you connect any sensor brand or gateway technology without hardware replacement, while its edge-compatible architecture ensures farm operations continue even with the intermittent connectivity that is common in rural field environments.",
    dashboardScreenshots: [
      { src: "/img/magistrala/dashboard-1.png", alt: "Precision agriculture field monitoring dashboard" },
      { src: "/img/magistrala/rules-engine-1.png", alt: "Irrigation automation rules configuration" },
      { src: "/img/magistrala/alarms-2.png", alt: "Crop stress and soil condition alarms" },
      { src: "/img/magistrala/reports-2.png", alt: "Seasonal yield and resource efficiency reports" },
    ],
    challenges: {
      title: "Guesswork is costing farms yield and water",
      subtitle: "Irrigation timing, pest management, and harvest decisions made without sensor data consistently underperform, and over-irrigating is both expensive and damaging.",
      items: [
        { ic: "WW", title: "Water Waste", desc: "Calendar-based irrigation ignores actual soil moisture and evapotranspiration conditions, routinely over-irrigating by 20–40% and leaching nutrients." },
        { ic: "UY", title: "Unpredictable Yields", desc: "Crop stress events (frost, heat, drought, disease pressure) go undetected until visible symptoms appear, when intervention is often already too late." },
        { ic: "MS", title: "Manual Scouting Overhead", desc: "Labour-intensive manual monitoring across large farms can't achieve the sensor resolution needed for precision decisions." },
      ],
    },
    howItWorks: {
      subtitle: "From field sensors to automated irrigation and crop decisions.",
      steps: [
        { title: "Sense", desc: "Soil probes, weather stations, and microclimate sensors stream readings into Magistrala over LoRaWAN or MQTT at intervals configured per sensor type and crop stage." },
        { title: "Contextualize", desc: "Incoming telemetry is tagged with field zone, crop type, and growth stage. Groups and channels structure the data for per-field analysis and cross-farm comparisons." },
        { title: "Decide", desc: "Evapotranspiration and volumetric water content rules evaluate soil and weather data continuously. Frost risk, heat stress, and disease pressure indices fire alarms when thresholds are exceeded." },
        { title: "Automate", desc: "Irrigation trigger rules dispatch control signals to valve controllers and pump systems. Alerts notify agronomists for interventions requiring human judgement." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "Precision agriculture use cases running on this pack",
      items: [
        { ic: "PI", title: "Precision Irrigation", desc: "VWC-based irrigation scheduling replaces calendar timers with real soil data, reducing water use by 20–35% without yield impact." },
        { ic: "CS", title: "Crop Stress Monitoring", desc: "Continuous tracking of heat stress, water deficit, and disease pressure indices allows proactive agronomic interventions before visible symptoms." },
        { ic: "FA", title: "Frost & Weather Alerting", desc: "Microclimate frost risk alerts give operators a 2–4 hour warning window to activate frost protection measures for vulnerable crops." },
        { ic: "SY", title: "Seasonal Yield Analysis", desc: "Historical sensor data and yield correlations improve season-on-season decision quality for irrigation, nutrition, and harvest timing." },
      ],
    },
    benefits: [
      "Reduce water consumption by 20–35% with soil moisture-based irrigation scheduling",
      "Detect frost, disease pressure, and heat stress events before visible crop damage occurs",
      "Eliminate manual scouting overhead with continuous automated field monitoring",
      "Improve yield predictability by correlating sensor data with historical crop performance",
      "Scale from pilot field to full farm without re-configuration; add sensors in minutes",
      "Comply with water use regulations and sustainability audits with automated water consumption reports",
    ],
    faq: [
      { question: "What types of agricultural sensors does the pack support?", answer: "Magistrala natively supports MQTT, HTTP, CoAP, and WebSocket. Sensors using SDI-12, RS-485, or LoRaWAN connect via an external protocol adapter. Weather stations, leaf wetness sensors, and dendrometers from major agri-hardware vendors are supported." },
      { question: "How does automated irrigation scheduling work?", answer: "Irrigation rules evaluate real-time soil moisture readings against configurable VWC thresholds for each field zone. When moisture drops below the target level, the rules engine opens the relevant valve controller and logs the irrigation event." },
      { question: "Can I monitor multiple farms or fields from one platform?", answer: "Yes. Each farm, field, or crop zone is an isolated domain with its own sensors, rules, and dashboards. A farm manager sees their own operations while an agronomist account can be granted cross-farm read access." },
      { question: "How does the platform help with water regulation compliance?", answer: "Automated water usage logs record every irrigation event with volume, duration, and zone data. Monthly reports are generated from this data and can be exported for submission to water authorities." },
    ],
    metaDescription: "Deploy precision agriculture IoT in minutes. Magistrala Smart Farming includes soil sensors, weather stations, irrigation automation, and crop dashboards.",
  },

  {
    title: "Oil & Gas Field Monitoring",
    slug: "oil-gas",
    image: "/img/solutions/oil-and-gas.jpg",
    summary:
      "This pack connects wellhead sensors to a single monitoring platform and fires the alarm the moment a threshold is crossed, before the next shift arrives on site.",
    description:
      "The Oil & Gas Field Monitoring pack gives upstream production teams real-time visibility across wellhead gateways, flow meters, pressure sensors, gas detectors, storage tank sensors, separator controllers, and pump controllers. Five detection rules cover high wellhead pressure, H2S and LEL gas hazards, low oil flow, rising water cut, and tank overfill protection.",
    heroDetail:
      "Five detection rules run continuously: high-pressure alerts catch wellhead and casing pressure excursions against configurable MAOP thresholds; gas leak detection enforces OSHA H2S ceilings with severity-tiered alarms; well flow anomaly detection flags production declines and rising water cut; and tank overfill protection fires a critical alarm before crude reaches spill-risk levels.",
    whyMagistrala:
      "Field devices connect over MQTT with per-client credentials, so a compromised sensor does not expose the rest of the wellsite network. Raw telemetry and validated data flow through separate channels, keeping detection rules clear of corrupted sensor records. One Well Operator template scales to any number of wellheads without duplicating dashboard configuration.",
    docsPath: "/docs/user-guide/solution-packs/oil-gas-field-monitoring/",
    dashboardScreenshots: [
      { src: "/img/solutions/oil-gas/field-operations-dashboard.png", alt: "Field Operations KPI Dashboard showing daily oil production, wellhead pressure, and H2S reading" },
      { src: "/img/solutions/oil-gas/real-time-monitoring-dashboard.png", alt: "Real-Time Well Monitoring Dashboard with live flow rate, wellhead pressure trend, and H2S concentration" },
      { src: "/img/solutions/oil-gas/well-operator-dashboard.png", alt: "Well Operator dashboard showing per-well flow rate, wellhead pressure gauge, and tank level" },
      { src: "/img/solutions/oil-gas/field-manager-summary-dashboard.png", alt: "Field Manager Summary with daily oil production chart and active alarms" },
    ],
    challenges: {
      title: "Problems field operators deal with every shift",
      subtitle: "Wellhead incidents, gas hazards, and overfill events all have warning signals; the problem is having a system that catches them in time.",
      items: [
        { ic: "H2", title: "H2S above threshold at an unmanned wellsite", desc: "An electrochemical H2S detector hitting the OSHA ceiling at an unmanned wellsite is a hazardous event with nobody there to respond. The alarm needs to fire before the next scheduled site visit." },
        { ic: "OV", title: "A tank filling while the transfer pump is stopped overnight", desc: "When the transfer pump trips at midnight and nobody notices, crude keeps flowing into the tank. By morning the level is at 90% and the spill risk window is closing." },
        { ic: "WP", title: "Wellhead pressure trending toward MAOP between manual checks", desc: "Pressure excursions that develop between manual checks can reach critical levels before anyone looks at the gauge. Continuous monitoring catches the trend at 1800 psi before it reaches 2200." },
      ],
    },
    howItWorks: {
      subtitle: "Four steps from wellhead sensor to actionable alarm",
      steps: [
        { title: "Ingest", desc: "Wellhead sensors and controllers publish SenML payloads over MQTT to the Raw Telemetry Channel using per-device credentials. Every reading is saved immediately." },
        { title: "Validate", desc: "A data processing rule checks each incoming record against field safe ranges before alarm logic runs. Out-of-range sensor values are discarded before they reach detection rules." },
        { title: "Detect", desc: "Five rules watch clean data continuously. Pressure above 1800 psi fires a warning; above 2200 psi fires critical. H2S above 5 ppm triggers a gas hazard warning. Tank above 85% triggers an overfill warning." },
        { title: "Report", desc: "Daily production, weekly operations summary, and monthly compliance reports go out automatically by email. Long-term production records write to PostgreSQL for regulatory reporting." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "Where upstream operators deploy the Oil & Gas Field Monitoring pack",
      items: [
        { ic: "WP", title: "Wellhead production monitoring", desc: "Flow rate, gas-oil ratio, and water cut tracked continuously across producing wells. Daily production reports close the loop without manual data collection." },
        { ic: "HS", title: "H2S safety compliance at unmanned sites", desc: "Continuous OSHA-threshold monitoring at wellheads. Gas hazard alarms fire within seconds and reach on-call contacts by email." },
        { ic: "TB", title: "Tank battery level management", desc: "Crude oil storage level monitored against two fill thresholds. Warning at 85% gives trucking schedulers a lead window before spill risk at 95%." },
        { ic: "SP", title: "Separator and pump operations", desc: "Separator temperature and pressure trended for process upsets. Transfer pump status displayed and controllable from the KPI dashboard." },
      ],
    },
    benefits: [
      "H2S and LEL alarms fire within seconds of OSHA threshold breach, giving operators time to respond before exposure risk escalates",
      "Wellhead pressure warnings at 1800 psi give time to investigate before the 2200 psi critical limit is reached",
      "Tank overfill warnings at 85% give trucking schedulers a practical lead window before the 95% critical alarm",
      "Device Health Monitor flags any silent field device within 10–20 minutes, protecting both safety coverage and regulatory data completeness",
      "Monthly compliance reports generate and deliver automatically, replacing manual production accounting assembly",
      "Per-client MQTT credentials isolate each field device so a compromised sensor cannot access others on the wellsite",
    ],
    faq: [
      { question: "How do we adjust pressure thresholds to match our well's MAOP?", answer: "Open the High Pressure Alert rule in the Rules page and edit the threshold constants. The defaults (1800 psi warning, 2200 psi critical) are typical Permian Basin parameters. Replace them with your well's specific MAOP specification." },
      { question: "Can the pack monitor multiple wells or field sites?", answer: "Yes. Each field site is a Magistrala domain with its own device clients, channels, and rules. The Well Operator and Field Manager Summary templates use tag-based device references, so deploying a new well means provisioning its clients and assigning a group." },
      { question: "How are H2S safety alarms escalated when no one acknowledges them?", answer: "The Gas Leak Detection rule sends email notifications to configured recipients the moment the alarm fires. For SMS or Safety Management System integration, use the rule's webhook output to POST the event to your external system." },
      { question: "Do all sensors need to connect through the Wellhead Gateway, or can they connect directly?", answer: "Either works. Each device type has its own client credentials, so sensors can connect directly if they have MQTT capability. In most field deployments, all sensors route through the Wellhead Gateway for a single TLS connection." },
    ],
    metaDescription: "Monitor wellhead pressure, H2S concentration, oil flow, and tank levels in real time. Detect gas hazards and pressure excursions within seconds with Magistrala.",
  },

  {
    title: "Smart Irrigation",
    slug: "smart-irrigation",
    image: "/img/solutions/smart-irrigation.jpg",
    summary:
      "Most farms find out about burst irrigation pipes from wet ground the next morning. This pack connects your field sensors and actuators to a single platform, catches problems within seconds, and files weekly soil health reports automatically.",
    description:
      "The Smart Irrigation pack gives farms and managed landscapes a live view of soil conditions, water flow, and tank levels across multiple field zones. Soil moisture sensors, weather stations, flow meters, smart valves, and a pump controller all land in pre-built dashboards with detection rules and scheduled reports already wired up.",
    heroDetail:
      "Six detection rules monitor the field around the clock, catching dry soil before crops reach wilting point, waterlogging before root damage sets in, pipe bursts before significant water is lost, and low tank levels before the pump runs dry. Valve and pump control sit directly on the dashboard so operators can respond without leaving the monitoring view.",
    whyMagistrala:
      "All ten device types (soil sensors, weather stations, flow meters, valves, tank sensor, pump) connect to the same Telemetry Channel and flow through the same rules. One Zone Monitoring template scales to any number of irrigation zones without duplicating configuration. Soil health and water consumption reports go out automatically every week.",
    docsPath: "/docs/user-guide/solution-packs/smart-irrigation/",
    dashboardScreenshots: [
      { src: "/img/solutions/smart-irrigation/field-operations-dashboard.png", alt: "Field Operations Dashboard with zone soil moisture gauges, flow charts, tank level, and valve control switches" },
      { src: "/img/solutions/smart-irrigation/irrigation-analytics-dashboard.png", alt: "Irrigation Analytics Dashboard with 7-day soil moisture trends and daily water consumption" },
      { src: "/img/solutions/smart-irrigation/zone-monitoring-template.png", alt: "Zone Monitoring Template showing per-zone soil moisture, flow rate, rainfall, and valve control" },
      { src: "/img/solutions/smart-irrigation/alarms-dashboard.png", alt: "Alarm Monitoring Dashboard with active alarm counts by severity" },
    ],
    challenges: {
      title: "Problems farms deal with every season",
      subtitle: "The agronomic and financial costs of reactive irrigation management add up.",
      items: [
        { ic: "BP", title: "Finding out about burst pipes from wet ground, not telemetry", desc: "A burst irrigation pipe in the early hours drains the tank, wastes water, and can leave an entire zone unirrigated. The alarm should fire before the water is gone." },
        { ic: "NV", title: "No visibility into how much water each zone is actually using", desc: "Without zone-level flow data, water budgets are estimates at best. Comparing consumption against scheduled volumes is a spreadsheet job done after the fact." },
        { ic: "SR", title: "Soil health reports assembled manually every week", desc: "Pulling moisture and temperature readings from sensors, averaging them per zone, and formatting the output for the agronomist. Every single week, by hand." },
      ],
    },
    howItWorks: {
      subtitle: "Four steps from field sensor to actionable decision",
      steps: [
        { title: "Ingest", desc: "Soil sensors, weather stations, flow meters, valves, and the pump controller publish SenML readings over MQTT, HTTP, CoAP, or WebSocket. Every raw reading is saved immediately." },
        { title: "Detect", desc: "Six rules watch the incoming data continuously. Moisture drops below 35%? Dry soil warning. Flow spikes above 40 L/min? Pipe burst alarm. Tank below 25%? Refill warning." },
        { title: "Control", desc: "Valve and pump switches on the Field Operations Dashboard send commands directly to actuators via the Commands Channel. Operators respond without leaving the monitoring view." },
        { title: "Report", desc: "Daily water consumption, weekly soil health, and monthly water efficiency reports go out automatically by email. Long-term moisture and volume trends feed into seasonal irrigation planning." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "Where farms and land managers deploy smart irrigation monitoring",
      items: [
        { ic: "AF", title: "Arable farming and precision crop irrigation", desc: "Zone-level soil moisture drives irrigation decisions rather than fixed schedules. Dry soil alarms fire before crops are stressed. Daily volume reports close the loop on water spend." },
        { ic: "VO", title: "Vineyard and orchard water stress management", desc: "Soil moisture at canopy depth tells you when vines or trees are drawing on reserves. Irrigation runs only when needed. Waterlogging alarms prevent root rot during wet spells." },
        { ic: "LT", title: "Multi-zone landscape and turf management", desc: "Golf courses, sports grounds, and municipal parks monitor each irrigation zone independently. Pipe burst alarms prevent overnight water loss." },
        { ic: "SI", title: "Shared farmland and tenant irrigation accounts", desc: "Each farmer sees their own field's moisture history, water consumed, and device battery status. Aggregate consumption and alarm data stay with the farm manager." },
      ],
    },
    benefits: [
      "Dry soil alarms fire within seconds of threshold breach, before crop stress develops, not after a field inspection the next morning",
      "Pipe burst alarms trigger at 40 L/min, giving operators time to close the zone valve before the tank drains and the pump runs dry",
      "Zone-level total volume data closes the gap between water budget targets and actual consumption without manual data collection",
      "Weekly soil health reports aggregate daily average moisture and temperature per zone and deliver automatically",
      "Monthly water efficiency reports combine zone volume and pump energy into a single PDF for water cost and budget reconciliation",
      "Tag-based Zone Monitoring and Field Report templates scale to any number of zones or farmer accounts from a single template definition",
    ],
    faq: [
      { question: "Our soil sensors use a proprietary serial protocol. Can we still connect them?", answer: "Yes. A local gateway can read your sensors via their native interface and publish SenML payloads to the Telemetry Channel. Many commercial agriculture gateways support RS-485 Modbus, SDI-12, and other field bus protocols out of the box." },
      { question: "Can the pack handle more than two irrigation zones?", answer: "Yes. The solution ships with two zones, but the architecture scales to any number. Each additional zone needs its own device clients and a group for access control. The Zone Monitoring template scales automatically; assign it to any group and it renders the right data." },
      { question: "How often should devices publish readings for the alarms to be effective?", answer: "Detection rules evaluate each SenML message as it arrives, so alarm latency equals the device's publish interval. For flow meter and pipe burst detection, publishing every 30–60 seconds gives operators a window to respond before significant water is lost." },
      { question: "Can we use the pack with drip irrigation as well as sprinkler systems?", answer: "Yes. The pack is agnostic to the delivery method. The main difference is the normal flow rate range; you may want to lower the pipe burst threshold in the High Flow Alert rule to match your drip system's actual flow profile." },
    ],
    metaDescription: "Monitor soil moisture, flow rate, and tank level across irrigation zones. Detect dry soil, pipe bursts, and waterlogging within seconds with Magistrala.",
  },

  {
    title: "Air Quality Monitoring",
    slug: "air-quality",
    image: "/img/solutions/air-quality.jpg",
    summary:
      "Track PM2.5, CO₂, and pollutants across zones to ensure regulatory compliance and protect public health.",
    description:
      "Deploy a comprehensive air quality monitoring network across indoor and outdoor environments. The Air Quality & Compliance Pack connects multi-pollutant sensors to real-time dashboards, automated regulatory reporting, and public health alert systems, pre-configured and ready in minutes.",
    heroDetail:
      "The Air Quality & Compliance Pack monitors a full range of pollutants (PM2.5, PM10, CO₂, NO₂, O₃, and VOCs) in real time, with automatic exceedance detection and regulatory threshold alerting. It includes pre-built compliance reports formatted for standard environmental reporting frameworks, significantly reducing the manual effort of periodic regulatory audits.",
    whyMagistrala:
      "Magistrala's scalable message ingestion and persistent time-series storage provide the data fidelity and retention that regulatory compliance frameworks require, while the built-in rule engine automates the threshold monitoring that would otherwise demand custom application development.",
    dashboardScreenshots: [
      { src: "/img/magistrala/dashboard-2.png", alt: "Air quality monitoring network dashboard" },
      { src: "/img/magistrala/alarms-2.png", alt: "Pollutant exceedance and health alert management" },
      { src: "/img/magistrala/reports-2.png", alt: "Regulatory air quality compliance reports" },
      { src: "/img/magistrala/rules-engine-1.png", alt: "Air quality threshold rules configuration" },
    ],
    challenges: {
      title: "Air quality risks are invisible until harm is done",
      subtitle: "Pollutant exposure impacts public health, productivity, and regulatory compliance, but without continuous monitoring, exceedances go undetected for hours or days.",
      items: [
        { ic: "CG", title: "Invisible Compliance Gaps", desc: "Manual sampling and infrequent measurement miss acute pollution events that breach regulatory limits, creating undetected compliance exposure for operators and municipalities." },
        { ic: "PH", title: "Public Health Risk", desc: "Without real-time AQI monitoring, vulnerable populations (schools, hospitals, care homes) aren't notified during high-pollution events when protective action is needed." },
        { ic: "MR", title: "Manual Reporting Burden", desc: "Compiling regulatory submissions from manual sampling and disparate sensor logs is time-consuming, error-prone, and creates delays in compliance reporting." },
      ],
    },
    howItWorks: {
      subtitle: "From sensor network to regulatory report: continuous and automated.",
      steps: [
        { title: "Measure", desc: "Multi-pollutant sensors stream PM2.5, PM10, CO₂, NO₂, O₃, and VOC readings at 1-minute intervals via MQTT into pre-built pollutant-specific channels." },
        { title: "Contextualize", desc: "Readings are tagged with sensor location, zone type (indoor/outdoor/industrial), and correlated with meteorological data for dispersion context and regulatory categorization." },
        { title: "Alert", desc: "WHO, EPA, and EU Air Quality Directive threshold rules fire alarms at configurable warning and limit values. AQI category transitions trigger real-time notifications to operators and public systems." },
        { title: "Report", desc: "Automated daily summaries and monthly trend reports compile verified sensor data into regulatory-format exports. Industrial boundary exceedance logs are generated automatically for permit compliance." },
      ],
    },
    applications: {
      title: "Key Applications",
      subtitle: "Air quality monitoring deployments using this pack",
      items: [
        { ic: "UA", title: "Urban AQI Networks", desc: "Dense sensor networks across city districts provide neighbourhood-level air quality data for public information systems and pollution mapping." },
        { ic: "IA", title: "Indoor Air Quality Management", desc: "CO₂ and VOC monitoring in offices, schools, and public buildings drives HVAC automation and ventilation alerts to maintain healthy indoor environments." },
        { ic: "IB", title: "Industrial Boundary Monitoring", desc: "Perimeter sensor networks at industrial facilities continuously monitor regulated pollutants, providing automated permit compliance evidence and exceedance alerts." },
        { ic: "RC", title: "Regulatory Compliance Reporting", desc: "Automated generation of regulatory-format air quality reports for environmental agency submissions, reducing compliance administration overhead significantly." },
      ],
    },
    benefits: [
      "Detect regulatory exceedances in real time, minutes after they occur, not days after manual review",
      "Protect public health with automated AQI alerts for sensitive locations like schools and hospitals",
      "Eliminate manual reporting labour with automated regulatory submission reports",
      "Deploy anywhere from urban ambient networks to industrial boundary monitoring with the same platform",
      "WHO, EPA, and EU Air Quality Directive thresholds are pre-configured and adjustable per jurisdiction",
      "Multi-tenant architecture lets environmental agencies manage multiple operator networks from one platform",
    ],
    faq: [
      { question: "What pollutants and sensor types does the Air Quality pack support?", answer: "Magistrala natively supports MQTT, HTTP, CoAP, and WebSocket. PM2.5, PM10, NO2, O3, CO, SO2, VOC, and CO2 sensors from major vendors are supported, both indoors and outdoors. Sensors using Modbus or LoRaWAN connect via an external protocol adapter." },
      { question: "How are AQI thresholds configured for different regulatory standards?", answer: "WHO, US EPA, and EU Air Quality Directive thresholds are pre-configured as default rule templates. Each threshold set is adjustable per sensor, location, or jurisdiction. Regulatory standard updates can be applied by editing rule parameters." },
      { question: "How does the platform handle multi-site monitoring networks?", answer: "Each monitoring station or network zone is organized as a Magistrala domain with its own sensors, rules, and access policies. Environmental agencies can manage multiple operator networks from a single platform while maintaining strict data isolation." },
      { question: "How are automated compliance reports generated?", answer: "Compliance reports are generated on a configurable daily, weekly, or monthly schedule from raw sensor data. Reports include hourly averages, exceedance counts, and station metadata in formats accepted by major regulatory submission portals." },
    ],
    metaDescription: "Deploy air quality monitoring in minutes. Magistrala Air Quality Pack includes multi-pollutant sensors, AQI rules, and automated compliance reporting.",
  },
];

export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}
