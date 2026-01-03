import { Store } from "./Store";
export * from "./types";
export * from "./events";
export * from "./ttl";

const store = new Store();
export default store;