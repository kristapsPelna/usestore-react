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
  it('should create a store and return its public interface', () => {
    const store = createStore('store1', 0);
    expect(store.name).toBe('store1');
    expect(Object.keys(store)).toEqual(['name', 'getState', 'setState']);
    expect(store.getState()).toBe(0);
    expect(typeof store.setState).toBe('function');
  });

  it('should warn about overriding an existing store', () => {
    const warn = jest.spyOn(global.console, 'warn');
    const name = 'unique';
    const store = createStore(name, 0);
    expect(store).toBeTruthy();
    createStore(name, undefined);
    expect(warn).toHaveBeenCalledWith(
      `[react-usestore] Store with name ${name} already exists. Overriding`,
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
    ]);
    expect(store.name).toBe('test');
    expect(store.state).toEqual(defaultValue);
    expect(store.getState()).toEqual(defaultValue);
    expect(typeof store.setState).toBe('function');
    expect(store.setters).toEqual([]);
  });

  it('should return a new store if it does not exist', () => {
    const name = 'Non-existent store';
    const warn = jest.spyOn(global.console, 'warn');
    const store = getStore(name);
    expect(store.name).toEqual(name);
    expect(warn).toBeCalledWith(
      `[react-usestore] Store named "${name}" does not exist. Creating one`,
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
    store.setState(1);
    expect(store.getState()).toBe(1);
    store.setState(999);
    expect(store.getState()).toEqual(999);
  });

  test('setState callback must be called', () => {
    const store = createStore('store7', 'foo');
    store.setState('bar', (newState) => {
      expect(newState).toBe('bar');
    });
  });

  test('setState callback must return the new state', () => {
    const callback = jest.fn();
    const store = createStore('store8', 0);
    store.setState(10, callback);
    expect(callback).toHaveBeenCalled();
  });
});
