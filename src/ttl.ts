// src/ttl.ts
import { TTLItem } from "./types";
import { emit } from "./events";

const ttlStore = new Map<string, TTLItem>();

export const setTTL = (key: string, ttl: number, onExpire: () => void) => {
  const expiresAt = Date.now() + ttl;

  const timeoutId = setTimeout(() => {
    ttlStore.delete(key);
    onExpire();
    emit("expire", { key, ttl });
  }, ttl);

  ttlStore.set(key, { expiresAt, timeoutId });
};

export const clearTTL = (key: string) => {
  const item = ttlStore.get(key);
  if (item) {
    clearTimeout(item.timeoutId);
    ttlStore.delete(key);
  }
};
