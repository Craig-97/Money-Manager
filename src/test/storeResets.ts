import * as Zustand from 'zustand';

// A way back to the start for every store the app creates, so no test sees another's state
const resets = new Set<() => void>();

export const resetStores = () => resets.forEach(reset => reset());

/*
 * Zustand with a `create` that remembers each store and its initial state, as Zustand's testing
 * guide does, so a new store is reset between tests without being listed anywhere
 */
export const rememberingStores = (zustand: typeof Zustand): typeof Zustand => {
  const remember = <T>(creator: Zustand.StateCreator<T>) => {
    const store = zustand.create(creator);
    const initial = store.getInitialState();
    resets.add(() => store.setState(initial, true));
    return store;
  };
  // Both create(creator) and the typed create<State>()(creator)
  const create = (<T>(creator?: Zustand.StateCreator<T>) =>
    creator ? remember(creator) : remember) as typeof zustand.create;
  return { ...zustand, create };
};
