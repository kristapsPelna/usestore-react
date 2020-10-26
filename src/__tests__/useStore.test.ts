import { createStore, useStore, deleteAllStores, getStore } from '..';
import { renderHook, act } from '@testing-library/react-hooks';

afterEach(() => {
  deleteAllStores();
});

describe('useStore', () => {
  it('should add a debug message when the store didnt exist and was created', () => {
    const debug = jest.spyOn(global.console, 'debug');
    const name = 'test';

    renderHook(() => useStore(name));

    expect(debug).toBeCalledWith(
      `[usestore-react] Store named "${name}" does not exist. Creating one`,
    );
  });

  it('should provide the component with a functional state and setState pair', () => {
    const name = 'test';
    createStore(name, 15);
    const { result } = renderHook(() => useStore(name));
    let [state, setState] = result.current;
    expect(state).toEqual(15);
    expect(typeof setState).toBe('function');

    act(() => {
      expect(setState(9)).toEqual(9);
    });

    [state] = result.current;
    expect(state).toEqual(9);
  });

  it('state should match the store state', () => {
    const name = 'test';
    const store = createStore(name, 15);

    const { result } = renderHook(() => useStore(name));
    const [state] = result.current;

    expect(store.getState()).toEqual(state);
  });

  it('should get latest state after setState', () => {
    const name = 'test';
    const store = createStore(name, 15);

    const { result } = renderHook(() => useStore(name));
    const [, setState] = result.current;

    act(() => {
      setState(9);
    });

    const [state] = result.current;
    expect(state).toEqual(9);
    expect(store.getState()).toEqual(state);
  });

  it('should get latest state after store.setState', () => {
    const name = 'test';
    const store = createStore(name, 15);

    const { result } = renderHook(() => useStore(name));

    act(() => {
      store.setState(9);
    });

    const [state] = result.current;
    expect(state).toEqual(9);
    expect(store.getState()).toEqual(state);
  });

  it('should get latest state when setState is called from another component', () => {
    const name = 'test';
    createStore(name, 15);

    const { result } = renderHook(() => useStore(name));
    const { result: result2 } = renderHook(() => useStore(name));

    const [, setState] = result2.current;

    act(() => {
      setState(9);
    });

    const [state1] = result.current;
    const [state2] = result2.current;
    expect(state1).toBe(9);
    expect(state1).toEqual(state2);
  });

  test('should remove setter on unmount', () => {
    const name = 'test';
    createStore(name, 15);

    const { unmount } = renderHook(() => useStore(name));

    const store = getStore(name);
    expect(store.setters.length).toBe(1);
    unmount();

    expect(store.setters.length).toBe(0);
  });
});
