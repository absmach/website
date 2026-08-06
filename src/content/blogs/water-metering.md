---
title: "Smart Water Metering with Magistrala"
slug: "smart-water-metering-with-magistrala"
excerpt: "Real-time smart water metering with automated valve control, alarms, and analytics using Magistrala IoT platform."
description: "Learn how Magistrala IoT platform enables smart water metering with real-time flow monitoring, automated valve control, and intelligent alarms. Magistrala is an open-source IoT platform that connects water meters and smart valves through multiple protocols (MQTT, HTTP, CoAP) to deliver real-time consumption tracking, automated safety shutoffs, and actionable analytics—all with enterprise-grade security, multi-tenancy, and no vendor lock-in."
date: "2026-02-23"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/water-metering/dashboard_maps_line_bar_graph.png"
ogImage:
  url: "/img/blogs/water-metering/dashboard_maps_line_bar_graph.png"
category: blog
featured: true
tags:
  - IoT Platform
  - Magistrala
  - Smart Water Metering
  - Water Management
  - Smart Valve
  - Rules Engine
  - Real-time Monitoring
  - Utilities
---

# Smart Water Metering with Magistrala

Water utilities and facility managers face mounting pressure to reduce waste, detect leaks early, and respond to unsafe conditions before they escalate. Traditional water meters require manual readings, provide no real-time visibility, and cannot react automatically to abnormal flow or quality conditions.

Smart water metering changes this. By connecting smart meters to an IoT platform, utilities gain continuous visibility into consumption, instant alerts on anomalies, and automated responses to abnormal conditions—all without manual intervention.

Magistrala connects smart water meters to deliver real-time flow monitoring, leak detection, and actionable analytics. By enabling precise consumption tracking and early anomaly detection, it helps utilities, cities, municipalities, campuses, and industrial facilities cut water waste and reduce operational costs significantly. This directly supports **SDG 6: Clean Water and Sanitation**—ensuring efficient, sustainable use of water resources at every scale. All telemetry is stored securely for compliance, billing, and operational insight—whether you're managing a single building, a campus, or a city-wide distribution network.

---

## Table of Contents

- [Solution Structure: Smart Water Metering](#solution-structure-smart-water-metering)
  - [How It Works](#how-it-works)
  - [Key Capabilities](#key-capabilities)
- [Water Metering Demo: Water Metering in Action](#water-metering-demo-water-metering-in-action)
  - [Step 1: Create Water Channel](#step-1-create-water-channel)
  - [Step 2: Create Water Devices](#step-2-create-water-devices)
  - [Step 3: Add Location Metadata](#step-3-add-location-metadata)
  - [Step 4: Set Up Rules Engine](#step-4-set-up-rules-engine)
  - [Step 5: Configure & Start Simulation](#step-5-configure--start-simulation)
  - [Step 6: Build Real-Time Dashboards](#step-6-build-real-time-dashboards)
  - [Step 7: Generate Reports](#step-7-generate-reports)
- [Other Applications in Water Management](#other-applications-in-water-management)
- [Why Magistrala](#why-magistrala)
- [Why Choose Magistrala Over Other Platforms](#why-choose-magistrala-over-other-platforms)
- [Start Monitoring Today](#start-monitoring-today)

---

## Solution Structure: Smart Water Metering

A smart water metering solution with Magistrala models each water meter as a Client. Meters publish consumption and quality data continuously, giving operators real-time visibility into flow, pressure, and water quality across the network.

### How It Works

1. **Meters registered as Clients**: Each water meter gets unique credentials in Magistrala
2. **Clients connected to a Channel**: Meters communicate through a shared Channel, publishing telemetry in real-time
3. **Meters publish telemetry**: Flow rate, pressure, temperature, and quality readings sent via MQTT, HTTP, or CoAP
4. **Rules Engine processes data**: Automated rules store readings and trigger alarms when thresholds are exceeded
5. **Users gain insights**: Real-time dashboards, maps, and reports deliver operational intelligence

### Key Capabilities

**Multi-Protocol Connectivity**: Connect water meters and valves via MQTT, HTTP, CoAP, WebSocket, or LoRa. Magistrala handles both cellular and LoRaWAN deployments seamlessly.

**Intelligent Rules Engine**: Automate threshold monitoring, leak detection, and usage-based billing calculations—no code changes required.

**Real-Time Alarms**: Instant alerts for high consumption, pressure anomalies, potential leaks, or water quality issues. Deliver notifications via email and Slack.

**Enterprise Security**: Mutual TLS authentication, fine-grained access control (ABAC/RBAC), and complete audit logs protect your infrastructure and data.

**Multi-Tenancy**: A single Magistrala instance serves multiple water departments or districts with fully isolated domains and shared infrastructure.

---

## Water Metering Demo: Water Metering in Action

Let's walk through a practical example of monitoring a water meter and controlling a smart valve in real-time. This demo shows the complete setup from device registration to automated valve control and dashboards.

### Step 1: Create Water Channel

First, create a Channel to connect your water devices. A Channel acts as the communication hub—meters publish data to it, and valves subscribe to receive commands from it.

In the Magistrala platform, navigate to Channels and create a new channel called `water_channel`.

![Create Water Channel](/img/blogs/water-metering/create_water_channel.png)

### Step 2: Create Water Devices

Create two Clients—one for the water meter and one for the smart valve. Each has its own role in the channel:

- **Water Meter** — publishes flow, pressure, temperature, and quality readings to the channel
- **Smart Valve** — subscribes to the channel and acts on commands sent by the Rules Engine

**Create the water meter client with publish permissions:**

![Create Water Meter with Publish](/img/blogs/water-metering/create_water_meter_with_publish.png)

**Create the smart valve client with subscribe permissions:**

![Create Water Valve with Subscribe](/img/blogs/water-metering/create_water_valve_with_subscribe.png)

Both devices are now registered and authorized to communicate through the water channel.

![The 2 Water Devices](/img/blogs/water-metering/the_2_water_devices.png)

### Step 3: Add Location Metadata

Enrich the water meter client with location metadata. This enables geographic visualization on dashboards and maps—essential for managing meters across a district or city.

![Add Water Meter Location Metadata](/img/blogs/water-metering/add_water_meter_location_metadata.png)

### Step 4: Set Up Rules Engine

Create three rules to automate data processing, alerting, and valve control:

**Rule 1: Save Telemetry Data**

Persists all incoming SenML readings to the database for historical analysis and reporting.

![Rule to Save SenML in Database](/img/blogs/water-metering/rule_save_senml_in_database.png)

**Rule 2: Create Water Alarms**

Monitors incoming readings and creates alarms when thresholds are exceeded—high pressure, abnormal flow, or unsafe water quality. This rule has two outputs: one sends the alarm to the alarms system, and the other publishes the result back to the same channel on the `results` subtopic, which the smart valve subscribes to in order to act on unsafe conditions.

![Rule to Create Water Alarms](/img/blogs/water-metering/rule_create_water_alarms_channels_output.png)

**Rule 3: Close Valve on Unsafe Limits**

When readings exceed safe limits, this rule automatically sends a close command to the smart valve—stopping water flow before damage or hazard occurs. This is the core of automated safety response.

![Rule to Close Valve on Unsafe Limits](/img/blogs/water-metering/rule_close_valve_on_unsafe_limits.png)

All three rules are now active:

![The 3 Water Rules](/img/blogs/water-metering/the_3_water_rules.png)

You can also see an example of the smart valve configuration with defined safe operating limits:

![Smart Water Valve with Safe Limits](/img/blogs/water-metering/example_of_smart_water_valve_with_safe_limits.png)

### Step 5: Configure & Start Simulation

Configure the IoT device emulator to simulate a real water meter sending telemetry and a valve receiving commands. The simulator runs two instances: a **publisher** (water meter) and a **subscriber** (smart valve).

**Configuration settings:**
- **Broker URL**: `messaging.magistrala.absmach.eu`
- **Username**: Client ID from Magistrala
- **Password**: Client secret from Magistrala
- **Message Format**: SenML (Sensor Measurement Lists)
- **Topic Pattern**: `m/{{domain}}/c/{{channelid}}/subtopic`
- **Data Points**: Flow rate, pressure, temperature, water quality, valve status

The subscriber instance listens on the same channel and responds when the Rules Engine sends a valve close command.

![IoT Simulator Publisher and Subscriber](/img/blogs/water-metering/IoT_simulator_publisher_subsciber.png)

Start both simulator instances. The water meter immediately begins transmitting telemetry:
- Flow rate readings
- Pressure measurements
- Temperature readings
- Water quality data

Messages flow from the meter through MQTT to Magistrala. The Rules Engine processes each reading—storing it, checking thresholds, and commanding the valve if limits are breached. The subscriber instance receives any valve commands and simulates the valve response.

Your water metering system is now operational! The platform is receiving, processing, and reacting to real-time data from both devices.

### Step 6: Build Real-Time Dashboards

With data flowing into the platform, create interactive dashboards to monitor your water infrastructure in real-time.

**Maps, Line Graphs, and Bar Charts:**

Visualize meter locations on a map, track flow rate trends over time with line graphs, and compare consumption across meters with bar charts:

![Dashboard Maps, Line and Bar Graph](/img/blogs/water-metering/dashboard_maps_line_bar_graph.png)

**Gauges and Alarm Table:**

Add gauge widgets to display current pressure and flow values at a glance. The alarm table shows active alerts—high consumption, pressure anomalies, or unsafe conditions—so operators can take immediate action:

![Dashboard Gauge and Alarms](/img/blogs/water-metering/dashboard_gauge_alarms.png)

With these dashboards, operators have complete visibility into the water network, enabling fast response to issues and data-driven operational decisions.

### Step 7: Generate Reports

Transform raw telemetry into structured reports for billing, compliance, and operational reviews.

**Create Custom Reports:**

Build reports tailored to your needs—consumption by meter, pressure trends, alarm histories, or usage-based billing:

![Example of Report Creation](/img/blogs/water-metering/example_of_report_creation.png)

Reports can be scheduled for automatic generation and delivered via email, supporting regular operational reviews, customer billing, and regulatory compliance.

Your complete smart water metering solution is now operational—from device connectivity through automated valve control to dashboards and reporting.

---

## Other Applications in Water Management

Beyond single-meter monitoring, Magistrala's capabilities extend across diverse water management use cases:

**District Metering Zones**: Monitor groups of meters across a distribution zone to detect bulk losses, identify leak zones by comparing inlet and outlet flows, and balance network pressure.

**Multi-Tenancy for Water Departments**: Serve multiple water departments, municipalities, or districts from a single Magistrala instance with fully isolated domains—each department manages its own devices and data independently.

![Group of Water Departments Supporting Multi-Tenancy](/img/blogs/water-metering/group_of_water_department_support_multitenacy.png)

**Leak Detection**: Detect abnormal consumption patterns at night (minimum night flow analysis) to identify leaks before they become visible. By comparing readings across multiple meters on the same pipeline, you can pinpoint exactly where loss is occurring between any two points in the network. Stored telemetry can also feed AI and machine learning models that learn normal consumption patterns over time—flagging subtle anomalies that rule-based thresholds alone would miss, such as slow micro-leaks or gradual pressure decay.

**Industrial Water Management**: Monitor cooling towers, process water circuits, and wastewater treatment plants with the same platform. Track quality parameters and automate responses to out-of-spec readings.

**Irrigation Management**: Monitor agricultural or municipal irrigation systems, automate scheduling based on flow data, and detect pipe failures with consumption anomaly detection.

**Building Management**: Track water consumption across floors or units in commercial and residential buildings. Generate tenant billing reports based on actual measured usage.

---

## Why Magistrala

- **Open Source Freedom**: Apache 2.0 license with no vendor lock-in. Active community and extensible architecture.
- **Enterprise-Grade Security**: Mutual TLS authentication, fine-grained access control, complete audit logs.
- **Scalable Architecture**: Handle millions of devices and messages. Deploy on cloud or edge infrastructure.
- **Multi-Tenancy**: Single instance serves multiple organizations with isolated domains and shared infrastructure.
- **Data Persistence**: Store telemetry in Timescale, PostgreSQL, or integrate with analytics frameworks.

---

## Why Choose Magistrala Over Other Platforms

- **True Open Source, No Vendor Lock-In**: Unlike proprietary IoT platforms, Magistrala uses the Apache 2.0 license. You own your deployment, control your data, and can modify the platform to fit your exact needs.
- **Cloud-Native & Self-Hostable**: Run on Magistrala Cloud for zero infrastructure management, or self-host on your own servers for complete control.
- **Built for Developers**: Clean REST APIs, comprehensive documentation, and standard protocols (MQTT, HTTP, CoAP, WS) mean faster integration. No proprietary SDKs required.
- **Production-Ready Out of the Box**: Enterprise authentication (mutual TLS), fine-grained access control, audit logs, and multi-tenancy are included—not expensive add-ons.
- **Active Community & Professional Support**: Open development on GitHub means transparency and community contributions. Need help? Direct access to the engineering team at [info@absmach.eu](mailto:info@absmach.eu).

---

## Start Monitoring Today

Ready to modernize your water infrastructure with real-time monitoring and automated control? Our team will help you design and implement a solution tailored to your specific needs.

**[Contact us today for a demo](mailto:info@absmach.eu)** or [start building with a free trial](https://cloud.magistrala.absmach.eu/en/login) – no credit card required.
