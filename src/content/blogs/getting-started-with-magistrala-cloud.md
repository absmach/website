---
title: "Getting Started with Magistrala Cloud: The hosted version of the open-source IoT platform"
slug: "getting-started-with-magistrala-cloud"
excerpt: "A review of the features and benefits of Magistrala Cloud, the hosted version of the open-source IoT platform, and how it can help you manage your IoT devices and data more efficiently."
description: "A review of the features and benefits of Magistrala Cloud, the hosted version of the open-source IoT platform, and how it can help you manage your IoT devices and data more efficiently."
date: "2026-02-12"
author:
  name: "Felix Gateru"
  picture: "https://avatars.githubusercontent.com/u/57312311?v=4"
coverImage: "/img/blogs/getting-started-with-magistrala-cloud/cover-image.jpg"
ogImage:
  url: "/img/blogs/getting-started-with-magistrala-cloud/cover-image.jpg"
category: blog
tags:
  - iot
  - magistrala
  - cloud
  - hosted
  - open-source
  - ui
  - multi-tenancy
  - multiple-protocols
---

The Magistrala IoT platform has been in development for well over a decade now. The project has grown from a simple passion project into one of the world's most widely used open-source IoT platforms. In this period it has introduced multiple features including support for multiple protocols, enhanced security features and multitenancy support. In addition to this, interacting with the platform has become simpler with a well-documented API, a powerful CLI and a polished and robust UI. This has made the platform not only more attractive to IoT enthusiasts but also to enterprises looking for a robust and scalable IoT solution. To make the platform even more accessible, we have launched the hosted version of the platform, [Magistrala Cloud](https://cloud.magistrala.absmach.eu/)!

In this blog post, we will take a closer look at Magistrala Cloud, its features and benefits, and how it can help you manage your IoT devices and data more efficiently.

## Why Magistrala?

Magistrala is an industry-grade, robust, scalable and extensible platform. The platform is built on a microservices architecture with a view to making it pluggable. Services can be scaled and replaced according to individual and industry requirements. A lot of the work is already done so that Magistrala can be tailored to your needs. All this while being completely open source with an Apache 2.0 license. The platform also has an emphasis on security not only for connected devices and applications but also for users of the platform. The platform offers industry-standard TLS and mTLS support for TCP-based protocols and DTLS and mDTLS for UDP-based protocols. Users are authenticated using either symmetric or asymmetric private keys which are rotated regularly. Permission to access entities on the platform is governed by fine-grained access control through the use of roles. This makes sure users only get access to the things they need to. With [Magistrala v0.14.0](https://www.absmach.eu/blog/v0-14-0-release/) we introduced multitenancy with the introduction of `domains`. This enables the separation of data and entities between different users or organizations. Magistrala also has multiple protocol support, with the platform currently supporting MQTT, HTTP, WebSockets and CoAP. More protocols are in the pipeline enabled by work on our new message broker [FluxMQ](https://www.absmach.eu/blog/fluxmq-announcement/).

All the above features combine to make Magistrala your all-in-one platform for everything IoT. Not only is it feature-rich, it is also highly scalable. The platform can handle tens to millions of messages with the same security and reliability. Learn more about all of Magistrala's features from the [docs](https://docs.magistrala.absmach.eu/).

## Introducing Magistrala Cloud

Magistrala Cloud is the hosted, SaaS, version of Magistrala. It offers all the features and benefits of the open-source version, but with the added convenience of being hosted and managed by our team. This means that you can focus on building your IoT applications and managing your devices, all while we take care of the infrastructure and maintenance. It is the best of both worlds. The performance and reliability of the Magistrala platform, with the ease and convenience of a hosted solution.

![Cloud dashboard](/img/blogs/getting-started-with-magistrala-cloud/cloud-dashboard.png)

Learn more about [Magistrala architecture here.](https://docs.magistrala.absmach.eu/user-guide/architecture/).

## Features and Benefits of Magistrala Cloud

Magistrala Cloud comes packed with features that make IoT device management straightforward and powerful. Here is a breakdown of what you get out of the box:

### 1. Secure Authentication with Social Sign-On

Getting started with Magistrala Cloud is simple. The platform provides a robust Auth service that handles user authentication and authorization. You can sign up with your email or use **Google Social Sign-On** to get up and running in seconds. The platform also has support for Personal Access Tokens (PATs) which, coupled with Bearer tokens, offer more flexibility for authentication and authorization.

![Login and Sign Up page](/img/blogs/getting-started-with-magistrala-cloud/login-page.png)

Learn more about our [Personal Access Tokens here.](https://docs.magistrala.absmach.eu/user-guide/pats/)

### 2. Multi-Tenancy with Domains

Magistrala Cloud supports multi-tenancy through **Domains**. Each domain acts as an isolated workspace where you can manage your `clients`, `channels`, `groups`, `rules`, `alarms`, `reports` and `messages` independently. On the free plan you can create up to **3 domains**. Giving you the ability to manage user access and organization needs. You can also **invite other users** to collaborate within a domain. Each domain supports up to **10 members**, making it easy to work with your team. Invited members can be assigned specific roles so that everyone has the right level of access.

![Domains Page](/img/blogs/getting-started-with-magistrala-cloud/domains-page.png)

Learn more about our [Domains here.](https://docs.magistrala.absmach.eu/user-guide/domain-management/domain/)

### 3. Fine-Grained Access Control and Roles Management

Within each domain, you have full control over who can do what. You can **define and manage roles** with fine-grained actions. This means you can set up roles that restrict or grant access to specific entities in your domain. This level of control is important for teams that need to enforce access policies across their IoT infrastructure.

![Role page](/img/blogs/getting-started-with-magistrala-cloud/role-page.png)

Learn more about our [Roles here.](https://docs.magistrala.absmach.eu/dev-guide/roles-schema/)

### 4. Organized Device Management with Groups

`Groups` represent logical groupings of `clients` and `channels`. By assigning `clients` and `channels` to groups, you can manage access control at the group level rather than individually. Magistrala Cloud lets you create up to **10 groups per domain**, and these groups support **hierarchical relationships**. That means you can nest groups within groups, with permissions being defined by the parent and child groups. This saves time and reduces complexity. You can also share groups with other domain members and assign them specific roles within the group.

![Groups page](/img/blogs/getting-started-with-magistrala-cloud/groups-page.png)

Learn more about our [Groups here.](https://docs.magistrala.absmach.eu/user-guide/clients/groups/)

### 5. Clients, Channels, and Multi-Protocol Messaging

Magistrala Cloud allows you to create up to **10 clients** and **10 channels** per domain. Clients can be devices like sensors, actuators and edge hardware, or applications like backend services, mobile apps and integrations. Clients can **publish** or **subscribe** to channels and each connection type can be managed independently. Channels support messaging across **multiple protocols** including HTTP, MQTT, CoAP, and WebSocket. Messages are sent in **SenML format**, which simplifies message handling. You can also use **subtopics** to logically separate message streams within a single channel, enabling high volumes of data to be organized and processed efficiently.

![Messages page](/img/blogs/getting-started-with-magistrala-cloud/messages-page.png)

Learn more about our [Messaging here.](https://docs.magistrala.absmach.eu/user-guide/messaging/)

### 6. Visual Rules Engine for Automation

One of the most powerful features in Magistrala Cloud is the **Rules Engine**. Magistrala Cloud lets you create up to **10 rules** per domain that automate how incoming messages are processed. Rules are built using a visual flow editor where you connect three types of nodes:

- **Input nodes** — define the data source (e.g., an MQTT channel subscriber).
- **Logic nodes** — apply conditions using comparison blocks, or write custom logic in **Go** or **Lua** scripts.
- **Output nodes** — specify what happens when the logic is satisfied.

We provide various output options. You can **publish results to another channel**, send **email notifications**, write data to the **Magistrala internal database**, push to an **external PostgreSQL database**, trigger **alarms**, or send notifications to **Slack**. Rules can also be scheduled to run at specific times or intervals.

![Rules page](/img/blogs/getting-started-with-magistrala-cloud/rules-page.png)

Learn more about the [Rules Engine here.](https://docs.magistrala.absmach.eu/user-guide/rules-engine/)

### 7. Alarms for Real-Time Threshold Monitoring

The **Alarms** service works hand-in-hand with the Rules Engine. When a rule detects that a threshold condition has been exceeded, it can automatically generate an alarm. This can be a temperature reading that is too high or water levels that are rising.
Each alarm captures key details: the measurement, the value that triggered it, the threshold, the severity level, and a cause description. From the Alarms dashboard, you can:

- **View** all active and historical alarms.
- **Assign** alarms to team members for resolution.
- **Acknowledge** alarms to signal that someone is working on them.
- **Clear** alarms once the issue has been resolved.

This makes alarms a lightweight incident management tool that helps your team respond to issues quickly and collaboratively.

![Alarms page](/img/blogs/getting-started-with-magistrala-cloud/alarms.png)

Learn more about our [Alarms here.](https://docs.magistrala.absmach.eu/user-guide/alarms/)

### 8. Reports for Device Data and Performance Tracking

Magistrala Cloud includes a built-in **Reports** service that lets you generate reports on messages from your devices. This is useful for tracking device health, monitoring performance trends, and producing data summaries for stakeholders.
You can create **one-time reports** that are generated instantly and downloaded in PDF or CSV format. You can also set up **scheduled reports** that are automatically sent to specified email addresses at your desired intervals. Reports support timezone configuration, aggregation methods, and can pull data from multiple topics and clients in a single report. Think of it as a live dashboard on a PDF.

![Reports page](/img/blogs/getting-started-with-magistrala-cloud/reports-page.png)

Learn more about our [Reports here.](https://docs.magistrala.absmach.eu/user-guide/reports/)

### 9. Interactive Dashboards for Data Visualization

Finally, Magistrala Cloud provides a rich **Dashboards** feature that lets you build visual displays of your device data. You can create dashboards and populate them with a wide variety of widgets:

- **Timeseries charts** — line, bar, area, and pie charts for visualizing trends over time.
- **Data cards** — value cards, count cards, and table cards for highlighting key metrics.
- **Gauges** — for displaying performance against thresholds.
- **Maps** — route maps, marker maps, and polygon maps for geospatial data.
- **Input elements** — switches and sliders for device management.
- **Alarm widgets** — alarm tables and alarm count cards for monitoring alert status.

Each widget can be configured with real-time or historical data, custom filters, data aggregation, and appearance settings. Dashboards can be **shared** with domain members, specific users, or made public with a shareable link. You can also download dashboards as PDF or JSON files, and upload pre-built dashboard templates to get started quickly. This makes it easy to gain insights at a glance, spot trends in device data, and share live views of your IoT environment with your team or stakeholders.

![Dashboards page](/img/blogs/getting-started-with-magistrala-cloud/dashboards-page.png)

Learn more about our [Dashboards here.](https://docs.magistrala.absmach.eu/user-guide/dashboards/introduction/)

## Conclusion

Magistrala Cloud takes everything that makes the open-source Magistrala platform powerful and wraps it in a hosted solution that you can start using today. All the features are accessible to you right now! Whether you are an IoT enthusiast exploring a new project, a startup building a connected product, or an enterprise managing devices across multiple environments, Magistrala Cloud gives you the tools you need. The platform will grow with you. Start with a few devices and a single domain, and scale as your needs evolve.

Ready to get started? Head over to [Magistrala Cloud](https://cloud.magistrala.absmach.eu/) and create your account today.
