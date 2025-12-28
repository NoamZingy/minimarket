# minimarket 🛒

A reactive, lazy-loaded, in-memory store for Node.js backends.

Minimarket is a lightweight singleton store that lets you cache,
compute, and react to backend data without Redis, Kafka, or databases.

---

## Features

- ✅ Singleton store across all imports
- ⚡ Async lazy-loading per key
- 🔁 Auto-refresh & TTL
- 🔔 Reactive subscriptions
- 🧠 Derived / computed keys
- 🔍 Simple querying
- 🚫 No external dependencies

---

## Install

```bash
npm install minimarket

or

yarn add minimarket


## Basic Usage

```bash
import store from "minimarket";

const users = await store.get("users", async () => {
  return db.users.findAll();
});


## Auto Refresh

```bash

store.setAutoRefresh("users", fetchUsers, 60_000);

## Reacting to Changes

```bash

store.on("update:users", (newUsers) => {
  console.log("Users updated:", newUsers);
});

## Derived Keys

```bash

setDerived(
  "activeUsers",
  ["users"],
  users => users.filter(u => u.active)
);

## When NOT to use minimarket

❌ Cross-process state

❌ Distributed systems

❌ Large datasets

❌ Long-term persistence

## License

MIT