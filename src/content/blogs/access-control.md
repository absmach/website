---
title: "# Access Control and Multitenancy with Domains"
slug: "magistrala-access-control-multitenancy"
excerpt: "How SuperMQ's Domains and policy-based access control enable secure multi-tenant IoT deployments with complete organization isolation."
description: "How Magistrala uses Domains and policy-based access control (RBAC/ABAC) to deliver secure, isolated multi-tenant IoT deployments."
date: "2026-02-12"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/access-control/cover_page.png"
ogImage:
  url: "/img/blogs/access-control/cover_page.png"
category: blog
featured: true
tags:
  - IoT Platform
  - Magistrala
  - Multitenancy
  - Access Control
  - RBAC
  - ABAC
  - IoT Security
  - Enterprise IoT
---

Multi-tenant IoT platforms require strict isolation between organizations to protect data, enforce security, and scale efficiently.

Magistrala, built on **SuperMQ**, addresses this with **Domains** for tenant isolation and **policy-based access control** to govern permissions across users, devices, and resources.

**Why Multi-Tenancy Matters:**

Whether you're building a SaaS IoT platform, managing infrastructure for multiple clients, or operating across business units, tenant isolation is a fundamental requirement.

Key requirements:
- **Customer data isolation** - No organization can access another's data
- **Fine-grained permissions** - Clear rules governing every user and device
- **Efficient scaling** - Shared infrastructure across tenants
- **Strong security** - Policy-based access enforcement
- **Organizational flexibility** - Each tenant manages their own structure

**SuperMQ's Multi-Tenancy Model:**

SuperMQ provides the basic structure:
- **Domains** - Containers that keep each customer separate
- **Users** - People who log in to their domain
- **Groups** - Teams within a domain
- **Clients** - IoT devices that belong to a domain
- **Channels** - Ways for devices to send messages
- **Policies** - Rules that control who can do what

**Magistrala's Features:**

Magistrala adds more features on top of SuperMQ:
- **Rules Engine** - Set up automatic actions
- **Alarms** - Get alerts when something goes wrong
- **Reports** - Create data reports
- **Bootstrap** - Set up devices automatically
- **Readers** - Read data over time
- **Consumers** - Route messages safely

**What This Covers:**

1. How Domains provide tenant isolation
2. How policy-based access control secures resources
3. How these work together in a real multi-tenant IoT deployment

---

## Table of Contents

- [Understanding Domains: Keep Customers Separate](#understanding-domains-multi-tenant-isolation)
- [Access Control Rules](#policy-based-access-control-rbacabac)
- [How Domains Work with Users, Teams, Devices, and Channels](#how-domains-work-with-users-groups-clients-and-channels)
- [Access Control Within Domains](#access-control-within-domains)
- [Real Example: Fleet Management SaaS](#practical-example-multi-tenant-fleet-management-saas)
  - [Three Companies on One Platform](#scenario-three-organizations-on-one-platform)
  - [Domain Setup and Separation](#domain-setup-and-isolation)
  - [User Access Control Within Each Domain](#user-access-control-within-each-domain)
  - [Device Setup and Communication](#device-registration-and-communication)
  - [Security in Action](#enforcing-security-policies)
- [Best Practices](#best-practices-for-multi-tenant-iot)
- [Get Started](#getting-started)

---

## Understanding Domains: Keep Customers Separate

**Domains** keep customers separate in SuperMQ. Each domain is like a separate box. One customer cannot see inside another customer's box.

**What Are Domains?**

A domain is a container. It holds:
- All users from one company
- All teams in that company
- All IoT devices owned by that company
- All message channels used by that company
- All rules that control access

**Key Facts About Domains:**

**Complete Separation:**

Users in Domain A cannot see Domain B. Devices in one domain cannot talk to another domain. Channels belong to just one domain. Users must be explicitly invited to a domain before they can access any of its resources.

**Each Domain Has Its Own Admin:**

Each domain has its own boss. Domain admins control only their own domain. Platform admins manage all the domains.

**Everything Belongs to One Domain:**

Every user, team, device, and channel lives in one domain. You create things inside a domain. Delete a domain and everything in it is deleted too.

**Easy to Grow:**

Domains share servers and databases. Each domain can grow on its own. One domain doesn't slow down another.

**Domain Hierarchy:**

```
Platform (SuperMQ/Magistrala Instance)
├── Domain: TenantA-Corp
│   ├── Users: admin@tenanta.com, engineer@tenanta.com
│   ├── Groups: East-Region, West-Region
│   ├── Clients: 5,000 GPS trackers
│   ├── Channels: vehicle-telemetry, vehicle-commands
│   └── Policies: Access control rules for TenantA
│
├── Domain: TenantB-Industries
│   ├── Users: manager@tenantb.com, operator@tenantb.com
│   ├── Groups: Factory-Floor, Quality-Control
│   ├── Clients: 2,000 industrial sensors
│   ├── Channels: sensor-data, equipment-alerts
│   └── Policies: Access control rules for TenantB
│
└── Domain: TenantC-Solutions
    ├── Users: admin@tenantc.com
    ├── Groups: Smart-Buildings
    ├── Clients: 10,000 building sensors
    ├── Channels: hvac-data, occupancy-data
    └── Policies: Access control rules for TenantC
```

**Advantages of Domains:**

:white_check_mark: **SaaS IoT Platforms** - Give each customer their own domain
:white_check_mark: **Service Providers** - Keep different clients separate
:white_check_mark: **Big Companies** - Keep business units apart
:white_check_mark: **Multi-Brand Services** - Keep different brands separate
:white_check_mark: **Testing and Production** - Keep test systems separate from live ones

![Magistrala Architecture](images/architecture.png)

---

## Access Control Rules

SuperMQ uses access control policies. These are like keys that unlock doors.

The policies decide who can do what.

**How Policies Work:**

Every action needs permission. The system checks if a **person** (or device) can do something with a **thing**. This happens inside a **domain**.

**Authorization Structure:**
```json
{
  "domain": "<domain-id>",
  "subject": "<user-id or client-id>",
  "subject_type": "user" | "client",
  "object": "<resource-id>",
  "object_type": "domain" | "group" | "client" | "channel",
  "permission": "<action to check>"
}
```

**Example Authorization Checks:**

**Domain Membership:**
```json
{
  "domain": "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "subject": "5bdf5647-123f-4b6e-a8a3-1933528d4a65",
  "subject_type": "user",
  "object": "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "object_type": "domain",
  "permission": "membership"
}
```
Result: :white_check_mark: User has access to domain resources

**User Creating a Client:**
```json
{
  "domain": "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "subject": "5bdf5647-123f-4b6e-a8a3-1933528d4a65",
  "subject_type": "user",
  "object": "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "object_type": "domain",
  "permission": "client_create_permission"
}
```
Result: :white_check_mark: User can create IoT devices in the domain

**How Roles Work:**

When you create something (like a client or group), you automatically become the admin. As the admin, you can create custom roles.

Each role has:
- **Actions** - What people can do (read, write, delete)
- **Members** - Which users have this role

**Example - Creating a Role:**

You create a client device. You want someone to only read data from it. You create a role called "data_viewer":

```json
{
  "role_name": "data_viewer",
  "optional_actions": ["read"],
  "optional_members": ["f756e6c5-bb52-4475-8c42-7bca0c917764"]
}
```

Now user `f756e6c5-bb52-4475-8c42-7bca0c917764` can read from your client.

They cannot write or delete.

**Common Actions:**

- `read` - View data
- `update` - Change settings
- `delete` - Remove things
- `share` - Let others access
- `create` - Make new things

You pick which actions each role gets.

**Magistrala Extra Features:**

Magistrala adds more permissions:

- **Rules Engine** - Create automatic actions
- **Alarms** - Set up alerts
- **Reports** - Make reports

All policies stay inside one domain. This keeps customers separate.

**How Permission Checking Works:**

Every time you try to do something, SuperMQ checks two things:

**1. Are you who you say you are?** (Authentication)

Users get a token when they log in with username and password. The token is called a JWT (JSON Web Token). This token proves you are a real user.

**2. Are you allowed to do this?** (Authorization)

SuperMQ uses SpiceDB to check permissions. It looks at your role and the action you want to do. It checks if your role has permission for that action.

**The Check Process:**

```
You: "I want to create a client"

Step 1 - Check Token:
:white_check_mark: Is the token valid?
:white_check_mark: Is it expired?
:white_check_mark: Was it really issued by SuperMQ?

Step 2 - Check Permission:
:white_check_mark: What domain are you in?
:white_check_mark: What role do you have?
:white_check_mark: Does your role allow "create client"?

Result: Allow or Deny
```

**What Gets Logged:**

Every action is written to a log:
- Who tried to do it
- What they tried to do
- When they tried
- Did it work or get blocked?

This helps track security problems.

---

## How Domains Work with Users, Groups, Clients, and Channels

Each domain has four main parts. They work together to run your IoT system.

**Entity Hierarchy Within a Domain:**

```
Domain: TenantA-Corp (Isolation Boundary)
│
├── Users (Human access)
│   ├── admin@tenanta.com (Domain Admin)
│   ├── manager@tenanta.com (Group Admin)
│   └── operator@tenanta.com (Group Operator)
│
├── Groups (Hierarchical organization)
│   ├── Group: Fleet-Operations
│   │   └── Group: East-Coast-Fleet
│   └── Group: Maintenance-Team
│
├── Clients (IoT devices/applications)
│   ├── Client: vehicle-gps-001 (auto-generated ID)
│   ├── Client: vehicle-gps-002
│   └── ... (thousands of devices)
│
└── Channels (Communication pathways)
    ├── Channel: vehicle-telemetry
    ├── Channel: vehicle-commands
    └── Channel: maintenance-alerts
```

**How They Work Together:**

**Users Belong to a Domain:**

Users are created inside a domain. They log in to their domain. They can only see things in their domain. Special rules are needed to see other domains.

**Groups Organize Users:**

Groups are like teams. Think of departments or locations. Users join groups with different roles. Groups make it easy to give permissions to many people at once. Groups can have groups inside them.

**Clients Belong to a Domain:**

Each IoT device is a client in a domain. Clients get a special ID (UUID). They also get a secret (password). You can set your own secret or leave it empty to get an auto-generated one. They can only connect to channels in the same domain. They use their secret to prove who they are.

**Channels Let Things Talk:**

Channels are created inside a domain for messages. Clients connect to channels to send and receive. Users connect to channels to see data and control clients. Channels stay in one domain. They cannot cross domains.

---

## Access Control Within Domains

Policies control everything inside a domain. Understanding these policies keeps your system safe.

**Permission Examples:**

**User Domain Access:**

```json
// Domain Admin
{
  "domain": "b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  "subject": "7c6b5a4f-3e2d-4c1b-0a9f-8e7d6c5b4a3f",
  "subject_type": "user",
  "object": "b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  "object_type": "domain",
  "permission": "admin"
}
```
Result: :white_check_mark: Full administrative access to domain

**Group Management:**

```json
// Group Admin
{
  "domain": "b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  "subject": "5a4f3e2d-1c0b-4a9f-8e7d-6c5b4a3f2e1d",
  "subject_type": "user",
  "object": "e5f6a7b8-9c0d-4e1f-2a3b-4c5d6e7f8a9b",
  "object_type": "group",
  "permission": "manage_role_permission"
}
```
Result: :white_check_mark: Can manage group roles and permissions

**Creating a Client:**

```json
// User creating a client in the domain
{
  "domain": "b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  "subject": "5a4f3e2d-1c0b-4a9f-8e7d-6c5b4a3f2e1d",
  "subject_type": "user",
  "object": "b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  "object_type": "domain",
  "permission": "client_create_permission"
}
```
Result: :white_check_mark: User can create clients in the domain

**How Permission Checks Work:**

When someone tries to do something, these steps happen:

1. **Check who they are** - Is this person or device real?
2. **Check the domain** - Are they in the right domain?
3. **Check permission** - Are they allowed to do this?
4. **Say yes or no** - Let them do it or stop them
5. **Write it down** - Save what happened

**Example - Creating a Client:**

```
Request: operator@tenanta.com creates GPS client

Check:
1. Authentication: :white_check_mark: Valid JWT
2. Domain: :white_check_mark: User in correct domain  
3. Permission: :white_check_mark: Has client_create_permission
4. Result: ALLOW
5. Audit: "User created client successfully"
```

**Example - Unauthorized Delete:**

```
Request: analyst@tenanta.com deletes client

Check:
1. Authentication: :white_check_mark: Valid JWT
2. Domain: :white_check_mark: User in correct domain
3. Permission: :x: Only has read_permission
4. Result: DENY
5. Log: "Unauthorized delete attempt blocked"
```

**Safety Rules:**

:x: Nothing is allowed by default

:white_check_mark: You need clear permission for every action

:white_check_mark: Roles give the least permission needed

:white_check_mark: Special cases get their own rules

---

## Real Example: Fleet Management SaaS

Here's how domains, access control, and the Rules Engine work together in a real-world scenario.

### Three Companies on One Platform

You run a fleet tracking platform with three customers:

**Company A: FastShip Logistics**
500 delivery trucks on US East Coast

**Company B: ColdChain Transport**
200 trucks with freezers for food

**Company C: Urban Couriers**
1,000 bikes and vans for city delivery

Each company needs their data kept separate. Each needs different user access. Each needs safe device messages.

---

### Domain Setup and Separation

**Platform Structure:**

```
FleetManagement SaaS Platform
│
├── Domain: FastShip-Logistics (Tenant A)
│   ├── Users: 15 (admins, dispatchers, analysts)
│   ├── Groups: East-Region, West-Region, Maintenance
│   ├── Clients: 500 GPS trackers
│   └── Channels: vehicle-telemetry, vehicle-commands, maintenance-alerts
│
├── Domain: ColdChain-Transport (Tenant B)
│   ├── Users: 8 (admins, drivers, quality-control)
│   ├── Groups: North-Region, South-Region, Quality-Team
│   ├── Clients: 200 GPS trackers + 200 temperature sensors
│   └── Channels: vehicle-telemetry, temperature-monitoring, alerts
│
└── Domain: UrbanCouriers (Tenant C)
    ├── Users: 50 (admins, zone-managers, drivers)
    ├── Groups: Downtown, Midtown, Uptown, Brooklyn, Queens
    ├── Clients: 1,000 GPS trackers (bikes + vans)
    └── Channels: courier-tracking, delivery-status, customer-notifications
```

---

### User Access Control Within Each Domain

**Domain A: FastShip Logistics**

**Main Administrator:**

```
User: admin@fastship.com
Role: Domain Admin

What they can do:
:white_check_mark: Manage all users, teams, devices, channels
:white_check_mark: Set up Rules, Alarms, and Reports
:white_check_mark: Access everything in the domain
```

**Regional Manager:**

```
User: manager-east@fastship.com
Team: East-Region
Role: Team Admin

What they can do:
:white_check_mark: Manage East-Region users and devices
:white_check_mark: See East-Region truck data
:x: Cannot access West-Region
```

**Dispatcher:**

```
User: dispatcher@fastship.com
Role: Team Operator

What they can do:
:white_check_mark: See truck locations and send commands
:white_check_mark: Mark alarms as seen
:x: Cannot add devices or manage users
```

**Data Analyst:**

```
User: analyst@fastship.com
Role: Team Viewer

What they can do:
:white_check_mark: See old data and make reports
:x: Cannot send commands or change anything
```

---

### Device Setup and Communication

**Domain A: FastShip Logistics - Device Setup**

**Adding and Connecting Devices:**

```
1. Make a Client (GPS Tracker):
   - Auto-made ID and password
   - Info: truck ID, area, driver name
   - Put in East-Region team

2. Connect to Channel:
   - Channel: vehicle-telemetry
   - Can: send + receive

3. Device sends location:
   {
     "time": "2026-02-16T14:35:00Z",
     "truck_id": "TRUCK-E-001",
     "lat": 40.7128,
     "lon": -74.0060,
     "speed": 45,
     "fuel": 75
   }
```

**Rules Engine:**

Rules work only in one domain. They watch the data:
- **Low Fuel Alert** - IF fuel < 20% THEN sound alarm
- **Out of Zone** - IF outside area THEN tell dispatcher

**Who Can See What:**

:white_check_mark: admin@fastship.com - Everything
:white_check_mark: manager-east@fastship.com - East-Region trucks only
:white_check_mark: dispatcher@fastship.com - Can read and send commands
:white_check_mark: analyst@fastship.com - Can only read old data
:x: Users from other companies - Nothing

---

### Security in Action

**Example 1: Can't Add Devices**

```
User: dispatcher@fastship.com (Team Operator)
Tries to: Add new GPS device

What happens:
1. Check login: :white_check_mark: User is real
2. Check domain: :white_check_mark: Right domain
3. Check permission: :x: Not allowed to add devices
4. BLOCKED - "Ask your admin to add devices"
```

**Example 2: Wrong Domain**

```
User: admin@coldchain.com (ColdChain boss)
Tries to: Read FastShip truck data

What happens:
1. Check login: :white_check_mark: User is real
2. Check domain: :x: User in wrong domain
3. Check special rule: :x: No cross-domain rule exists
4. BLOCKED - "Not found" (doesn't say other domain exists)
5. Send security alert about cross-domain try
```

---

## Best Practices

**Domains & Access:**

:white_check_mark: One domain per customer. Never share.
:white_check_mark: Give least permission needed. Don't give extra.
:white_check_mark: Use role rules. Set up Admin, Operator, and Viewer roles.
:white_check_mark: Track changes. Write down all access rule changes.
:white_check_mark: Change passwords often. Do it automatically for devices and users.
:x: Never give platform admin to just anyone.

**Magistrala Features:**

:white_check_mark: Keep rules in one domain. Rules Engine stays in its domain.
:white_check_mark: Use clear alarm permissions. Let operators mark alarms as seen.
:white_check_mark: Control report access. Split read and make permissions.
:white_check_mark: Limit rule runs per domain.
:x: Never let rules cross domains or share passwords.

**Security & Operations:**

:white_check_mark: Use strong device login checks.
:white_check_mark: Watch for cross-domain tries. Send alerts.
:white_check_mark: Track each domain separately.
:white_check_mark: Back up each customer separately.
:white_check_mark: Smart channel design. Keep data, commands, and alarms separate.
:x: Never write passwords in logs.

**Following Rules:**

:white_check_mark: Follow data location laws for each domain.
:white_check_mark: Keep full logs for legal needs.
:white_check_mark: Set how long to keep data per domain.
:white_check_mark: Follow privacy laws like GDPR.

---

## Get Started

Ready to build your IoT solution?

**Try it for free:**

> **Note:** No credit card needed.

[**Make Your Free Account →**](https://cloud.magistrala.absmach.eu/en/login)

**Learn More:**
- [Docs](https://docs.magistrala.absmach.eu/) - Guides and help
- [GitHub](https://github.com/absmach/magistrala) - Code and examples
- [Community](https://matrix.to/#/#magistrala:matrix.org) - Ask questions

**Need help?** Email us at [info@absmach.eu](mailto:info@absmach.eu)

---

**Questions?** Join our [community](https://matrix.to/#/#magistrala:matrix.org) or check out [GitHub](https://github.com/absmach/magistrala)!
