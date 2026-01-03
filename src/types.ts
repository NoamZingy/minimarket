// src/types.ts

export type MarketKey = string;

export type MarketValue<T = any> = T;

export interface MarketStore {
  set: <T = any>(key: MarketKey, value: MarketValue<T>) => void;
  get: <T = any>(key: MarketKey) => MarketValue<T> | undefined;
  has: (key: MarketKey) => boolean;
  delete: (key: MarketKey) => boolean;
  all: () => Record<MarketKey, MarketValue>;
}

// For TTL support
export interface TTLItem {
  expiresAt: number;
  timeoutId: NodeJS.Timeout;
}

// For events
export type MarketEventName = "set" | "delete" | "expire" | "clear";

export type MarketEventHandler = (data: {
  key: string;
  value?: any;
  ttl?: number;
}) => void;
