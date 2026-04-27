---
title: "Access Control and Multitenancy with Domains"
slug: "magistrala-access-control-multitenancy"
excerpt: "How Magistrala's Domains and policy-based access control enable secure multi-tenant IoT deployments with complete organization isolation."
description: "How Magistrala uses Domains and policy-based access control (RBAC/ReBAC) to deliver secure, isolated multi-tenant IoT deployments."
date: "2026-02-12"
author:
  name: "Steve Munene"
  picture: "https://avatars.githubusercontent.com/u/61874077?v=4"
coverImage: "/img/blogs/access-control/cover_page.png"
ogImage:
  url: "/img/blogs/access-control/cover_page.png"
category: blog
tags:
  - IoT Platform
  - Magistrala
  - Multitenancy
  - Access Control
  - RBAC
  - ReBAC
  - IoT Security
  - Enterprise IoT
---

Multi-tenant IoT platforms require strict isolation between organizations to protect data, enforce security, and scale efficiently.

Magistrala addresses this with **Domains** for tenant isolation and **policy-based access control** to govern permissions across users, devices, and resources.

**Why Multi-Tenancy Matters:**

Whether you're building a SaaS IoT platform, managing infrastructure for multiple clients, or operating across business units, tenant isolation is a fundamental requirement.

Key requirements:
- **Customer data isolation** - No organization can access another's data
- **Fine-grained permissions** - Clear rules governing every user and device
- **Efficient scaling** - Shared infrastructure across tenants
- **Strong security** - Policy-based access enforcement
- **Organizational flexibility** - Each tenant manages their own structure

**What This Covers:**

1. How Domains provide tenant isolation
2. How policy-based access control secures resources
3. How these work together in a real multi-tenant IoT deployment

---

## Table of Contents

- [Understanding Domains: Keep Customers Separate](#understanding-domains-multi-tenant-isolation)
- [Access Control Rules](#access-control-rules)
- [How Domains Work with Users, Teams, Devices, and Channels](#how-domains-work-with-users-groups-clients-and-channels)
- [Access Control Within Domains](#access-control-within-domains)
- [Real Example: Fleet Management SaaS](#practical-example-multi-tenant-fleet-management-saas)
  - [Three Companies on One Platform](#scenario-three-organizations-on-one-platform)
  - [Domain Setup and Separation](#domain-setup-and-isolation)
  - [User Access Control Within Each Domain](#user-access-control-within-each-domain)
  - [Device Setup and Communication](#device-registration-and-communication)
  - [Security in Action](#enforcing-security-policies)
- [Get Started](#getting-started)

---

## Understanding Domains: Keep Customers Separate

**Domains** keep customers separate in Magistrala. Each domain is like a separate box. One customer cannot see inside another customer's box.

**What Are Domains?**

A domain is a container. It holds:
- All users from one company
- All teams in that company
- All IoT devices owned by that company
- All message channels used by that company
- All rules that control access

**Key Facts About Domains:**

- **Complete Separation:** Users in Domain A cannot see Domain B. Devices in one domain cannot talk to another domain. Channels belong to just one domain. Users must be explicitly invited to a domain before they can access any of its resources.
- **Each Domain Has Its Own Admin:** Domain admins control only their own domain. Platform admins manage all the domains.
- **Everything Belongs to One Domain:** Every user, team, device, and channel lives in one domain. You create things inside a domain. Delete a domain and everything in it is deleted too.
- **Easy to Grow:** Domains share servers and databases. Each domain can grow on its own. One domain doesn't slow down another.

**Advantages of Domains:**

✅ **SaaS IoT Platforms** - Give each customer their own domain
✅ **Service Providers** - Keep different clients separate
✅ **Big Companies** - Keep business units apart
✅ **Multi-Brand Services** - Keep different brands separate
✅ **Testing and Production** - Keep test systems separate from live ones

![Magistrala Architecture](/img/blogs/access-control/architecture.png)

---

## Access Control Rules

Magistrala uses access control policies. These are like keys that unlock doors.

The policies decide who can do what.

**RBAC and ReBAC: How Magistrala Combines Both:**

Magistrala uses **RBAC (Role-Based Access Control)** on top of **ReBAC (Relationship-Based Access Control)**.

- **RBAC** is the model you see as a user: create a role, assign permissions to it, add members to it. When a user is in a role, they get those permissions.
- **ReBAC** is the engine underneath, powered by [SpiceDB](https://authzed.com/spicedb) (an open-source Zanzibar implementation). Instead of storing flat role tables, Magistrala stores a graph of relationships between entities: user → role → client, client → domain, group → parent_group, and so on. Permission checks traverse this graph.

This combination gives Magistrala two important capabilities:

1. **Inherited permissions:** A user with a role on a group automatically inherits permissions on all clients and channels inside that group, and those inside its subgroups, without explicitly granting them per-resource.
2. **Domain isolation:** Every relationship is scoped to a domain. The graph never crosses tenant boundaries, so a permission check for Domain A cannot accidentally resolve through Domain B's relationships.

A concrete example: when a client is assigned to a group (`parent_group` relation), SpiceDB resolves `client_read_permission` by walking `client → parent_group → domain`. A user granted read on the group gains read on the client through the relationship graph; no extra policy entries needed.

**How Policies Work:**

Every action needs permission. The system checks if a **person** (or device) can do something with a **thing**. This happens inside a **domain**.

**Authorization Structure:**

```json
{
  "domain": "<domain-id>",
  "subject": "<user-id or client-id>",
  "subject_type": "user" | "client",
  "object": "<resource-id>",
  "object_type": "domain" | "group" | "client" | "channel" | "rule" | "report",
  "permission": "<permission to check>"
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

Result: ✅ User has access to domain resources

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

Result: ✅ User can create IoT devices in the domain

**How Roles Work:**

When you create something (like a client or group), you automatically become the admin. As the admin, you can create custom roles.

Each role has:

- **Actions** - The specific permissions granted (e.g. `read_permission`, `update_permission`, `delete_permission`)
- **Members** - Which users hold this role

**Example - Creating a Role:**

A client device is created. To allow a user to only read data from it, a `data_viewer` role is defined:

```json
{
  "role_name": "data_viewer",
  "optional_actions": ["read_permission"],
  "optional_members": ["f756e6c5-bb52-4475-8c42-7bca0c917764"]
}
```

That user gains `read_permission` on the client; `update_permission` and `delete_permission` are not granted.

**Permissions by Entity:**

| Entity | Key Permissions |
|---|---|
| **Client** | `read_permission`, `update_permission`, `delete_permission`, `connect_to_channel_permission`, `manage_role_permission` |
| **Channel** | `read_permission`, `update_permission`, `delete_permission`, `publish_permission`, `subscribe_permission`, `connect_to_client_permission`, `manage_role_permission` |
| **Group** | `subgroup_create_permission`, `subgroup_read_permission`, `subgroup_update_permission`, `subgroup_delete_permission`, `manage_role_permission` |
| **Domain** | `read_permission`, `update_permission`, `enable_permission`, `disable_permission`, `delete_permission`, `manage_role_permission` |
| **Rule** | `read_permission`, `update_permission`, `delete_permission`, `alarm_read_permission`, `alarm_assign_permission`, `alarm_acknowledge_permission`, `alarm_resolve_permission`, `manage_role_permission` |
| **Report** | `read_permission`, `update_permission`, `delete_permission`, `manage_role_permission` |

All roles and permissions are scoped to the domain they were created in; they cannot cross tenant boundaries.

**Magistrala: Rules, Alarms and Reports:**

Magistrala's RBAC covers its core services and additional features. Permissions map directly to API operations via SpiceDB:

- **Rules**: `rule_create_permission`, `rule_read_permission`, `rule_update_permission`, `rule_delete_permission` (domain-scoped); `read_permission`, `update_permission`, `delete_permission` (rule-scoped)
- **Alarms**: Access is controlled through the parent rule: `alarm_read_permission`, `alarm_assign_permission`, `alarm_acknowledge_permission`, `alarm_resolve_permission`
- **Reports**: `report_create_permission`, `report_read_permission`, `report_update_permission`, `report_delete_permission` (domain-scoped); `read_permission`, `update_permission`, `delete_permission` (report-scoped)

All policies remain within their domain; there is no cross-tenant permission inheritance.

**How Permission Checking Works:**

Every time you try to do something, Magistrala checks two things:

**1. Are you who you say you are?** (Authentication)

Users get a token when they log in with username and password. The token is called a JWT (JSON Web Token). This token proves you are a real user.

**2. Are you allowed to do this?** (Authorization)

Magistrala uses SpiceDB to check permissions. It looks at your role and the action you want to do. It checks if your role has permission for that action.

**The Check Process:**

```text
You: "I want to create a client"

Step 1 - Check Token:
✅ Is the token valid?
✅ Is it expired?
✅ Was it really issued by Magistrala?

Step 2 - Check Permission:
✅ What domain are you in?
✅ What role do you have?
✅ Does your role allow "create client"?

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

```text
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

- **Users Belong to a Domain:** Users are created inside a domain. They log in to their domain and can only see things within it. Special cross-domain rules are required to access other domains.
- **Groups Organize Users:** Groups are like teams: departments or locations. Users join groups with different roles, making it easy to assign permissions to many people at once. Groups can be nested inside other groups.
- **Clients Belong to a Domain:** Each IoT device is a client in a domain. Clients get a unique ID (UUID) and a secret for authentication. They can only connect to channels in the same domain.
- **Channels Let Things Talk:** Channels are created inside a domain. Clients connect to channels to send and receive messages. Channels stay within one domain and cannot cross domain boundaries.

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

Result: ✅ Full administrative access to domain

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

Result: ✅ Can manage group roles and permissions

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

Result: ✅ User can create clients in the domain

**How Permission Checks Work:**

When someone tries to do something, these steps happen:

1. **Check who they are** - Is this person or device real?
2. **Check the domain** - Are they in the right domain?
3. **Check permission** - Are they allowed to do this?
4. **Say yes or no** - Let them do it or stop them
5. **Write it down** - Save what happened

**Example - Creating a Client:**

```text
Request: operator@tenanta.com creates GPS client

Check:
1. Authentication: ✅ Valid JWT
2. Domain: ✅ User in correct domain  
3. Permission: ✅ Has client_create_permission
4. Result: ALLOW
5. Audit: "User created client successfully"
```

**Example - Unauthorized Delete:**

```text
Request: analyst@tenanta.com deletes client

Check:
1. Authentication: ✅ Valid JWT
2. Domain: ✅ User in correct domain
3. Permission: ❌ Only has read_permission
4. Result: DENY
5. Log: "Unauthorized delete attempt blocked"
```

**Safety Rules:**

- ❌ Nothing is allowed by default
- ✅ You need explicit permission for every action
- ✅ Roles grant the least permission needed
- ✅ Special cases get their own dedicated rules

---

## Real Example: Fleet Management SaaS

Here's how domains, access control, and the Rules Engine work together in a real-world scenario.

### Three Companies on One Platform

You run a fleet tracking platform with three customers:

- **Company A: FastShip Logistics**, 500 delivery trucks on the US East Coast
- **Company B: ColdChain Transport**, 200 refrigerated trucks for food logistics
- **Company C: Urban Couriers**, 1,000 bikes and vans for city delivery

Each company needs their data kept separate. Each needs different user access. Each needs safe device messages.

---

### Domain Setup and Separation

**Platform Structure:**

![Multitenant Example](/img/blogs/access-control/multitenant_example.png)

---

### User Access Control Within Each Domain

#### Domain A: FastShip Logistics

**Main Administrator:**

```text
User: admin@fastship.com
Role: Domain Admin

What they can do:
✅ Manage all users, teams, devices, channels
✅ Set up Rules, Alarms, and Reports
✅ Access everything in the domain
```

**Regional Manager:**

```text
User: manager-east@fastship.com
Team: East-Region
Role: Team Admin

What they can do:
✅ Manage East-Region users and devices
✅ See East-Region truck data
❌ Cannot access West-Region
```

**Dispatcher:**

```text
User: dispatcher@fastship.com
Role: Team Operator

What they can do:
✅ See truck locations and send commands
✅ Mark alarms as seen
❌ Cannot add devices or manage users
```

**Data Analyst:**

```text
User: analyst@fastship.com
Role: Team Viewer

What they can do:
✅ See old data and make reports
❌ Cannot send commands or change anything
```

---

### Device Setup and Communication

#### Domain A: FastShip Logistics - Device Setup

**Adding and Connecting Devices:**

```text
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

- ✅ admin@fastship.com: Everything
- ✅ manager-east@fastship.com: East-Region trucks only
- ✅ dispatcher@fastship.com: Can read and send commands
- ✅ analyst@fastship.com: Can only read old data
- ❌ Users from other companies: Nothing

---

### Security in Action

#### Example 1: Can't Add Devices

```text
User: dispatcher@fastship.com (Team Operator)
Tries to: Add new GPS device

What happens:
1. Check login: ✅ User is real
2. Check domain: ✅ Right domain
3. Check permission: ❌ Not allowed to add devices
4. BLOCKED - "Ask your admin to add devices"
```

#### Example 2: Wrong Domain

```text
User: admin@coldchain.com (ColdChain boss)
Tries to: Read FastShip truck data

What happens:
1. Check login: ✅ User is real
2. Check domain: ❌ User in wrong domain
3. Check special rule: ❌ No cross-domain rule exists
4. BLOCKED - "Not found" (doesn't say other domain exists)
5. Send security alert about cross-domain try
```

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
