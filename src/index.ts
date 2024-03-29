import { useState, useLayoutEffect, SetStateAction } from 'react';

const stores: Record<string, InternalStore<any>> = {};

type SetState<TState> = (state: SetStateAction<TState>) => void;
type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type Store<TState> = {
  /**
   * Unique name of the store
   */
  readonly name: string;
  /**
   * Default state value
   */
  readonly defaultState: TState;
  /**
   * Get the current value of the state
   */
  readonly getState: () => TState;
  /**
   * Set the state of the store
   */
  readonly setState: SetState<TState>;
  /**
   * useStore that is scoped to this specific store
   */
  readonly useStore: () => [TState, SetState<TState>];
  /**
   * useSelector that is scoped to this specific store
   */
  readonly useSelector: <TValue>(
    selector: (state: TState) => TValue,
    equalityFunction?: (value: TValue, newValue: TValue) => boolean,
  ) => TValue;
  /**
   * Resets the store to its defaultState
   */
  readonly reset: () => void;
};

export type InternalStore<TState> = Store<TState> & {
  state: TState;
  setters: SetState<TState>[];
  subscribe: (listener: (state: TState) => void) => void;
  unsubscribe: (listener: (state: TState) => void) => void;
};

export const createStore = <TState>(name: string, defaultState: TState) => {
  if (stores[name]) {
    console.warn(
      `[usestore-react] Store with name '${name}' already exists. Overriding`,
    );
  }

  const store: InternalStore<TState> = {
    name,
    defaultState,
    state: defaultState,
    setters: [],
    getState: () => store.state,
    setState: (setStateAction: SetStateAction<TState>) => {
      store.state =
        typeof setStateAction === 'function'
          ? (setStateAction as (prevState: TState) => TState)(store.state)
          : setStateAction;

      store.setters.forEach((setter) => setter(store.state));
      return store.state;
    },
    useStore: () => useStore(name),
    useSelector: <TValue>(selector: (state: TState) => TValue) =>
      useSelector(name, selector),
    subscribe: (listener: (state: TState) => void) =>
      store.setters.unshift(listener),
    unsubscribe: (listener: (state: TState) => void) => {
      store.setters = store.setters.filter((setter) => setter !== listener);
    },
    reset: () => store.setState(defaultState),
  };
  stores[name] = store;

  type ReturnArray = [
    Store<TState>['getState'],
    Store<TState>['setState'],
    Store<TState>['useStore'],
  ];

  const returnValue = [
    store.getState,
    store.setState,
    store.useStore,
  ] as ReturnArray & Writeable<Store<TState>>;

  returnValue.name = name;
  returnValue.getState = store.getState;
  returnValue.setState = store.setState;
  returnValue.useStore = store.useStore;
  returnValue.useSelector = store.useSelector;
  returnValue.reset = store.reset;
  return returnValue as ReturnArray & Store<TState>;
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
    store.subscribe(setState);
    return () => store.unsubscribe(setState);
  }, [name]);

  return [store.state, store.setState];
};

export const useSelector = <TState, TValue>(
  name: string,
  selectorFn: (state: TState) => TValue,
  equalityFunction: (value: TValue, newValue: TValue) => boolean = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b),
) => {
  const store = getStore<TState>(name);
  const [value, setValue] = useState(selectorFn(store.state));

  useLayoutEffect(() => {
    const selector = (state: TState) =>
      setValue((value) => {
        const newValue = selectorFn(state);
        return equalityFunction(value, newValue) ? value : newValue;
      });

    store.subscribe(selector);
    return () => store.unsubscribe(selector);
  }, [name, selectorFn]);

  return value;
};
