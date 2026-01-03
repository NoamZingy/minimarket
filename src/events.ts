// src/events.ts
import { MarketEventHandler, MarketEventName } from "./types";

const listeners: Record<MarketEventName, MarketEventHandler[]> = {
  set: [],
  delete: [],
  expire: [],
  clear: [],
};

export const on = (event: MarketEventName, handler: MarketEventHandler) => {
  listeners[event].push(handler);
};

export const emit = (
  event: MarketEventName,
  payload: Parameters<MarketEventHandler>[0]
) => {
  listeners[event].forEach(handler => handler(payload));
};

export const off = (event: MarketEventName, handler: MarketEventHandler) => {
  listeners[event] = listeners[event].filter(fn => fn !== handler);
};
