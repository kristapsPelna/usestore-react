import { useState, useLayoutEffect } from 'react';

const stores: Record<string, InternalStore<any>> = {};

type SetState<TState> = (
  state: TState,
  callback?: (state: TState) => void,
) => void;

export interface Store<TState> {
  readonly name: string;
  getState(): TState;
  setState: SetState<TState>;
}

export interface InternalStore<TState> extends Store<TState> {
  state: TState;
  setters: SetState<TState>[];
}

export const createStore = <TState>(
  name: string,
  defaultState: TState,
): Store<TState> => {
  if (stores[name]) {
    console.warn(
      `[usestore-react] Store with name ${name} already exists. Overriding`,
    );
  }

  const store: InternalStore<TState> = {
    name,
    state: defaultState,
    setters: [],
    getState: () => store.state,
    setState: (newState: TState, callback?: (state: TState) => void) => {
      store.state = newState;
      store.setters.forEach((setter) => setter(store.state));
      if (typeof callback === 'function') {
        callback(store.state);
      }
      return store.state;
    },
  };
  stores[name] = store;
  return { name, getState: store.getState, setState: store.setState };
};

export const getStore = <TState>(name: string): InternalStore<TState> => {
  if (!stores[name]) {
    console.debug(
      `[usestore-react] Store named "${name}" does not exist. Creating one`,
    );
    createStore(name, undefined);
  }
  return stores[name];
};

export const hasStore = (name: string) => !!stores[name];

export const deleteStore = (name: string) => {
  delete stores[name];
};

export const deleteAllStores = () => Object.keys(stores).forEach(deleteStore);

export const useStore = <TState>(name: string): [TState, SetState<TState>] => {
  const store = getStore<TState>(name);
  // setState is only used for rerenders because we always want to serve the latest state from the store
  const [, setState] = useState(store.state);

  useLayoutEffect(() => {
    store.setters.unshift(setState);
    return () => {
      store.setters = store.setters.filter((setter) => setter !== setState);
    };
  }, []);

  return [store.state, store.setState];
};
