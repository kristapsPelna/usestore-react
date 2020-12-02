import { renderHook, act } from '@testing-library/react-hooks';
import {
  createStore,
  getStore,
  hasStore,
  deleteStore,
  deleteAllStores,
} from '..';

jest.mock('');
afterEach(() => {
  deleteAllStores();
});

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
    expect(typeof store.reset).toBe('function');
  });

  it('should warn about overriding an existing store', () => {
    const warn = jest.spyOn(global.console, 'warn');
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
      'state',
      'setters',
      'getState',
      'setState',
      'useStore',
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
    const debug = jest.spyOn(global.console, 'debug');
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

  test('reset must reset the state to the defaultValue', () => {
    const store = createStore('store3', 'default');
    expect(store.getState()).toBe('default');
    store.setState('not-default');
    expect(store.getState()).toBe('not-default');
    expect(store.reset()).toBe('default');
    expect(store.getState()).toEqual('default');
  });
});
