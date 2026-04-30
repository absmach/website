---
title: "Migrating Magistrala from v0.19.0 to v0.20.0"
description: "A practical guide to upgrading Magistrala from v0.19.0 to v0.20.0, including new domain admin actions, Rules Engine role backfills, Reports role backfills, and SpiceDB verification."
date: 2026-04-30
author:
  name: "Abstract Machines"
tags:
  - Magistrala
  - IoT Platform
  - Migration
  - Access Control
  - SpiceDB
  - Rules Engine
  - Reports
draft: false
slug: "migrating-magistrala-v0-19-0-to-v0-20-0"
---

# Migrating Magistrala from v0.19.0 to v0.20.0

Magistrala v0.20.0 introduces an important access-control migration for deployments upgrading from v0.19.0.

This release strengthens the authorization model around **Alarms**, **Reports**, and **Rules Engine resources** by making sure domain administrators have the correct actions and that existing Rules and Reports receive their built-in admin roles.

For new deployments, this is handled automatically as part of normal service startup and resource creation. For existing v0.19.0 deployments, however, there is one extra migration step: existing Rules and Reports must be backfilled with their missing built-in admin roles.

This guide explains what changed, why the migration is needed, and how to upgrade safely.

---

## What changed in v0.20.0?

Magistrala v0.20.0 adds new domain-level admin actions for **Alarms** and **Reports**.

The domain admin role now includes actions such as:

```text
alarm_acknowledge
alarm_assign
alarm_delete
alarm_read
alarm_resolve
alarm_update
report_add_role_users
report_create
report_delete
report_manage_role
report_read
report_remove_role_users
report_update
report_view_role_users
````

This means domain administrators can correctly manage alarm and report resources through the same consistent authorization model used across Magistrala.

The release also requires existing **Rules Engine rules** and **Reports** to have their built-in admin roles created. These roles are normally provisioned when new resources are created, but older resources from v0.19.0 may not have those role records yet.

So the migration has two parts:

1. Start the v0.20.0 services so their database migrations run.
2. Run the one-time backfill scripts for Rules and Reports.

---

## Why this migration matters

Magistrala uses a consistent identity and access-control model across domains, users, resources, roles, actions, and policies.

That consistency is important because IoT systems are rarely simple. A production deployment may have many domains, many users, many devices, many channels, automated rules, reports, alarms, and integrations running at the same time.

Access control must remain predictable.

When a domain admin manages a report, acknowledges an alarm, or works with a rule, Magistrala should not depend on hidden assumptions or legacy state. The system should have explicit role records and explicit authorization relationships.

The v0.20.0 migration makes this state explicit for older deployments.

In practical terms, the migration ensures that:

* domain admin roles include the new Alarm and Report actions;
* existing Rules have their built-in admin roles;
* existing Reports have their built-in admin roles;
* SpiceDB relationships are checked before writing, avoiding duplicate policy relationships;
* the backfill can be safely re-run if interrupted.

---

## Before you upgrade: take backups

Before starting the upgrade, back up the following databases:

```text
Domains
Rules Engine
Reports
Alarms
Auth
SpiceDB
```

This is important because the migration touches authorization-related data. The process is designed to be safe and idempotent, but production migrations should always start with a verified backup.

At minimum, make sure you can restore:

* PostgreSQL service databases;
* SpiceDB data;
* environment configuration;
* Docker Compose or Kubernetes manifests;
* secrets used by Auth and SpiceDB.

---

## Step 1: Start the required v0.20.0 services

For the default Docker Compose setup, start the services required for the migration:

```bash
cd docker

docker compose up -d \
  spicedb-db spicedb-migrate spicedb \
  auth-db auth \
  domains-db domains \
  re-db re \
  reports-db reports \
  alarms-db alarms
```

Wait until the services are running.

The `auth` service is especially important because it loads the SpiceDB schema. If the schema is not loaded, the backfill scripts can fail with errors such as missing object definitions.

You can check service status with:

```bash
docker compose ps
```

---

## Step 2: Run the Rules Engine backfill

From the repository root, run:

```bash
go run ./scripts/re-backfill-roles/
```

This script finds existing Rules Engine rules that do not yet have built-in admin roles and provisions the missing role records.

For each rule, the script checks:

* whether the rule already has a role;
* whether the rule has a valid `domain_id`;
* whether the rule has a `created_by` user;
* whether the creator is a member of the domain;
* whether the required SpiceDB policy relationship already exists.

If the creator is a domain member, the role is created with that member attached.

If the creator is not a domain member, the role is still provisioned, but without adding that user as a role member. This avoids granting access to a user who is not part of the domain.

If the SpiceDB relationship already exists, the script detects it and skips re-adding it.

---

## Step 3: Run the Reports backfill

After the Rules Engine backfill completes, run the Reports backfill:

```bash
go run ./scripts/reports-backfill-roles/
```

This script performs the same kind of migration for existing Reports.

It provisions missing built-in admin roles for reports, checks domain membership, avoids duplicate SpiceDB relationships, and logs a final summary.

---

## Expected successful output

Both scripts should finish with a summary similar to:

```text
backfill finished processed=<number> skipped=<number> failed=0
```

The important value is:

```text
failed=0
```

Some skipped records may be expected, especially if old records are missing `created_by` or `domain_id` values. These are intentionally skipped because the migration cannot safely infer ownership for incomplete legacy rows.

---

## Step 4: Verify the services

After the backfills complete, verify that the required services are still running:

```bash
cd docker

docker compose ps re reports alarms domains auth spicedb
```

You should also verify the new domain admin actions in the Domains database:

```bash
psql -h localhost -p 6003 -U magistrala -d domains -c "
  SELECT action FROM domains_role_actions
  WHERE role_id IN (SELECT id FROM domains_roles WHERE name = 'admin')
  ORDER BY action;"
```

The result should include the new alarm and report actions:

```text
alarm_acknowledge
alarm_assign
alarm_delete
alarm_read
alarm_resolve
alarm_update
report_add_role_users
report_create
report_delete
report_manage_role
report_read
report_remove_role_users
report_update
report_view_role_users
```

You can also verify Rules and Reports role records directly in PostgreSQL.

For Rules:

```bash
psql -h localhost -p 6009 -U magistrala -d rules_engine -c "
  SELECT rr.id, rr.entity_id, rr.name, rr.created_by
  FROM rules_roles rr
  ORDER BY rr.entity_id;"
```

For Reports:

```bash
psql -h localhost -p 6020 -U magistrala -d reports -c "
  SELECT rr.id, rr.entity_id, rr.name
  FROM reports_roles rr
  ORDER BY rr.entity_id;"
```

---

## The migration is idempotent

The backfill scripts are designed to be re-run safely.

If a script is interrupted, fix the issue and run it again.

The scripts check existing database rows and existing SpiceDB relationships before writing new data. This means they do not duplicate already-created roles or already-existing policy relationships.

A successful re-run should usually show:

```text
processed=0
failed=0
```

Some skipped records may continue to appear if they are legacy records without enough information to safely migrate.

---

## Notes for non-default deployments

The default scripts are configured for the Docker Compose environment.

If you run Magistrala outside the default Docker Compose setup, verify the database and SpiceDB connection settings before running the scripts.

The default Docker Compose values are:

```text
Rules Engine DB: localhost:6009
Reports DB:      localhost:6020
Domains DB:      localhost:6003
Alarms DB:       localhost:6019
SpiceDB gRPC:    localhost:50051
SpiceDB token:   12345678
```

For production environments, make sure these values match your deployment before running the backfills.

---

## Troubleshooting

### `failed to connect to postgres`

Check that the required database containers are running:

```bash
cd docker
docker compose ps
```

Also verify the exposed port:

```bash
docker compose port re-db 5432
docker compose port reports-db 5432
```

### `object definition not found`

This usually means the SpiceDB schema has not been loaded.

Make sure the `auth` service has started successfully, because it loads the SpiceDB schema during startup.

You can inspect the schema with:

```bash
zed schema read \
  --insecure \
  --endpoint localhost:50051 \
  --token 12345678
```

### `failed to load built-in role actions`

Verify that the backfill scripts point to the correct SpiceDB schema file:

```text
docker/spicedb/schema.zed
```

### Backfill shows skipped records

Skipped records are usually old rows missing required data such as `domain_id` or `created_by`.

The scripts skip these records instead of guessing ownership or granting unsafe access.

---

## Recommended production upgrade flow

For production deployments, we recommend the following process:

1. Test the upgrade in staging using a copy of production data.
2. Back up all affected databases.
3. Deploy v0.20.0 services.
4. Wait for database migrations to complete.
5. Confirm `auth` has loaded the SpiceDB schema.
6. Run the Rules Engine backfill.
7. Run the Reports backfill.
8. Confirm both scripts finish with `failed=0`.
9. Verify domain admin actions.
10. Verify Rules and Reports role records.
11. Monitor service logs after the upgrade.

---

## Closing thoughts

Magistrala v0.20.0 continues the work of making the platform’s authorization model more complete, explicit, and consistent.

The migration from v0.19.0 is not just a database upgrade. It is an access-control alignment step.

By adding the new Alarm and Report admin actions and backfilling built-in admin roles for existing Rules and Reports, Magistrala ensures that older deployments follow the same authorization model as new deployments.

For teams running Magistrala in production, the upgrade path is straightforward:

start the v0.20.0 services, run the two backfill scripts, verify the results, and continue operating with a cleaner and more consistent access-control foundation.

