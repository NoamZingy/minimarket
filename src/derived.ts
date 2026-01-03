import store from "./index";

export function setDerived<T>(
  key: string,
  deps: string[],
  compute: (...values: any[]) => T
) {
  const recompute = async () => {
    const values = await Promise.all(deps.map(d => store.get(d)));
    store.set(key, compute(...values));
  };

  deps.forEach(dep => {
    return () => store.off(`update:${dep}`, recompute);
  });

  recompute();
}
