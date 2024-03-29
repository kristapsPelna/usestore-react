import { renderHook, act } from '@testing-library/react';
import {
  createStore,
  getStore,
  hasStore,
  deleteStore,
  deleteAllStores,
} from '..';

const warn = jest.fn();
console.warn = warn;
afterEach(warn.mockClear);

const debug = jest.fn();
console.debug = debug;
afterEach(debug.mockClear);

afterEach(deleteAllStores);

describe('createStore', () => {
  it('should create a store and return an array for destructuring', () => {
    const [getState, setState, useStore] = createStore('store1', 0);
    expect(getState()).toBe(0);
    expect(typeof setState).toBe('function');
    expect(typeof useStore).toBe('function');
  });

  it('should create a store and return its public interface', () => {
    const store = createStore('store1', 0);
    expect(store.name).toBe('store1');
    expect(store.getState()).toBe(0);
    expect(typeof store.setState).toBe('function');
    expect(typeof store.useStore).toBe('function');
    expect(typeof store.useSelector).toEqual('function');
    expect(typeof store.reset).toBe('function');
  });

  it('should warn about overriding an existing store', () => {
    const name = 'unique';
    const store = createStore(name, 0);
    expect(store).toBeTruthy();
    createStore(name, undefined);
    expect(warn).toHaveBeenCalledWith(
      `[usestore-react] Store with name '${name}' already exists. Overriding`,
    );
  });
});

describe('getStore', () => {
  it('should return the store if it exists', () => {
    const defaultValue = { test: true };
    createStore('test', defaultValue);

    const store = getStore('test');
    expect(Object.keys(store)).toEqual([
      'name',
      'defaultState',
      'state',
      'setters',
      'getState',
      'setState',
      'useStore',
      'useSelector',
      'subscribe',
      'unsubscribe',
      'reset',
    ]);
    expect(store.name).toBe('test');
    expect(store.state).toEqual(defaultValue);
    expect(store.getState()).toEqual(defaultValue);
    expect(typeof store.setState).toBe('function');
    expect(typeof store.useStore).toBe('function');
    expect(store.setters).toEqual([]);
  });

  it('should return a new store if it does not exist', () => {
    const name = 'Non-existent store';
    const store = getStore(name);
    expect(store.name).toEqual(name);
    expect(debug).toBeCalledWith(
      `[usestore-react] Store named "${name}" does not exist. Creating one`,
    );
  });
});

describe('hasStore', () => {
  test('should return false if store does not exist', () => {
    expect(hasStore('test')).toBe(false);
  });

  test('should return true if store exists', () => {
    createStore('test', undefined);
    expect(hasStore('test')).toBe(true);
  });
});

describe('deleteStore', () => {
  test('should delete a store', () => {
    createStore('test', undefined);
    expect(hasStore('test')).toBe(true);
    deleteStore('test');
    expect(hasStore('test')).toBe(false);
  });
});

describe('deleteAllStores', () => {
  test('should delete all stores', () => {
    createStore('test', undefined);
    createStore('test2', undefined);
    expect(hasStore('test')).toBe(true);
    expect(hasStore('test2')).toBe(true);
    deleteAllStores();
    expect(hasStore('test')).toBe(false);
    expect(hasStore('test2')).toBe(false);
  });
});

describe('store', () => {
  test('setState must update store state', () => {
    const store = createStore('store3', 0);
    expect(store.getState()).toBe(0);
    expect(store.setState(1)).toBe(1);
    expect(store.getState()).toBe(1);
    expect(store.setState(999)).toBe(999);
    expect(store.getState()).toEqual(999);
  });

  test('setState as a function must also update store state', () => {
    const store = createStore('store3', 0);
    expect(store.getState()).toBe(0);
    expect(
      store.setState((prevState) => {
        expect(prevState).toBe(0);
        return 1;
      }),
    ).toBe(1);
    expect(store.getState()).toBe(1);
    expect(
      store.setState((prevState) => {
        expect(prevState).toBe(1);
        return 999;
      }),
    ).toBe(999);
    expect(store.getState()).toEqual(999);
  });

  test('useStore must work for this store', () => {
    const { getState, useStore } = createStore('store3', 87);
    renderHook(() => useStore());

    const { result } = renderHook(() => useStore());
    const [state, setState] = result.current;
    expect(state).toEqual(87);
    act(() => {
      setState(56);
    });
    expect(getState()).toEqual(56);
  });

  test('should select a nested value with a selector', () => {
    type State = { level1: { value: number } };
    const selector = (state: State) => state.level1.value;
    const { useSelector } = createStore('store3', {
      level1: { value: 123 },
    });

    const { result } = renderHook(() => useSelector(selector));
    expect(result.current).toEqual(123);
  });

  test('should get latest selector value after store change', () => {
    type State = { level1: { value: number } };
    const selector = (state: State) => state.level1.value;
    const { useSelector, setState } = createStore('store3', {
      level1: { value: 123 },
    });

    const { result, rerender } = renderHook(() => useSelector(selector));

    act(() => {
      setState({ level1: { value: 456 } });
    });
    rerender();

    act(() => {
      // Nothing should change when setting the same value again
      setState({ level1: { value: 456 } });
    });
    rerender();

    expect(result.current).toEqual(456);
  });

  it('should reset value on reset', () => {
    const { getState, setState, reset } = createStore('store', 'default');

    setState('changed');
    expect(getState()).toEqual('changed');
    reset();
    expect(getState()).toEqual('default');
  });
});
