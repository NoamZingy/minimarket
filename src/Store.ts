import { EventEmitter } from "events";

export type Loader<T> = () => Promise<T> | T;

export interface Entry<T = any> {
  value?: T;
  loader?: Loader<T>;
  expiresAt?: number;
  loading?: Promise<T>;
  refreshInterval?: NodeJS.Timeout;
}

export class Store extends EventEmitter {
  private data = new Map<string, Entry>();

  /** GET with optional loader + TTL logic */
  async get<T>(key: string, loader?: Loader<T>): Promise<T> {
    let entry = this.data.get(key);

    // Auto-remove expired value
    if (entry && this.isExpired(entry)) {
      this.delete(key);
      entry = undefined;
    }

    // If cached and valid → return
    if (entry?.value !== undefined) return entry.value as T;

    // Lazy-create entry object
    if (!entry) {
      entry = {};
      this.data.set(key, entry);
    }

    // If already loading → return same promise (prevents double loaders)
    if (entry.loading) return entry.loading;

    const loadFn = loader ?? entry.loader;
    if (!loadFn) throw new Error(`No loader available for key "${key}"`);

    entry.loading = Promise.resolve(loadFn())
      .then(value => {
        this.set(key, value);
        entry!.loading = undefined;
        return value;
      })
      .catch(err => {
        entry!.loading = undefined;
        throw err;
      });

    return entry.loading;
  }

  /** SET with optional TTL */
  set<T>(key: string, value: T, ttlMs?: number) {
    const old = this.data.get(key)?.value;

    this.data.set(key, {
      ...this.data.get(key),
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    });

    this.emit("update", key, value, old);
    this.emit(`update:${key}`, value, old);
  }

  /** Define a loader with optional auto-refresh */
  setLoader<T>(key: string, loader: Loader<T>, ttlMs?: number) {
    const existing = this.data.get(key);

    if (existing?.refreshInterval) clearInterval(existing.refreshInterval);

    this.data.set(key, {
      ...existing,
      loader,
    });

    if (ttlMs) this.setAutoRefresh(key, loader, ttlMs);
  }

  /** Auto-refresh data every N ms */
  setAutoRefresh<T>(key: string, loader: Loader<T>, intervalMs: number) {
    const refresh = async () => {
      const value = await loader();
      this.set(key, value);
    };

    refresh(); // initial load

    const timer = setInterval(refresh, intervalMs);
    this.data.set(key, {
      ...this.data.get(key),
      loader,
      refreshInterval: timer
    });
  }

  /** Query values if stored arrays */
  query<T>(key: string, fn: (item: T) => boolean): T[] {
    const value = this.data.get(key)?.value;
    return Array.isArray(value) ? value.filter(fn) : [];
  }

  /** Remove key + clear intervals */
  delete(key: string) {
    const entry = this.data.get(key);
    if (entry?.refreshInterval) clearInterval(entry.refreshInterval);
    const removed = this.data.delete(key);
    if (removed) this.emit("delete", key);
  }

  private isExpired(entry: Entry) {
    return typeof entry.expiresAt === "number" && Date.now() > entry.expiresAt;
  }
}
