# useStore for React

[![npm version](https://badge.fury.io/js/usestore-react.svg)](https://badge.fury.io/js/usestore-react)
[![minzip size](https://badgen.net/bundlephobia/minzip/usestore-react)](https://bundlephobia.com/result?p=usestore-react)
[![dependencies](https://badgen.net/bundlephobia/dependency-count/usestore-react)](https://badgen.net/bundlephobia/dependency-count/usestore-react)

A simple and small state management lib for React that uses the bleeding edge React's `useState` hook.
Which basically means no magic behind the curtains, only pure react APIs being used to share state across components.

Try it on [Codesandbox!](https://codesandbox.io/s/usestore-react-demo-efw6z)

# Table of Contents

- [Installation](#installation)
- Usage
  - [Basic](#usage_basic)
  - [Referencing stores](#usage_name)
  - [More examples](https://codesandbox.io/s/usestore-react-demo-efw6z)

## <a name="installation">Installation</a>

`npm i usestore-react --save`

## <a name="usage">Usage</a>

### <a name="usage_basic">Basic</a>

This is the most basic implementation of the library. create a store with its initial state.
Later, call `useStore` inside components to retrieve its state and setState method.
The value passed as the first argument to the setState method will be the new state.

```ts
import React from 'react';
import { createStore, useStore } from 'usestore-react';

const clickCountStore = createStore('clickCount', 0);

const FirstComponent = () => {
  // just use the useStore method to grab the state and the setState
  const [clickCount, setClickCount] = useStore('clickCount');

  return (
    <div>
      <h1>First component</h1>
      <h2>The button was clicked {clickCount} times</h2>
      <button onClick={() => setClickCount(clickCount + 1)}>Increment</button>
      OR
      <button
        onClick={() => setClickCount((prevClickCount) => prevClickCount + 1)}
      >
        Increment
      </button>
    </div>
  );
};

const SecondComponent = () => {
  const [clickCount] = useStore('clickCount');
  return (
    <div>
      <h1>Second component</h1>
      <h2>
        Totally separate from the others, but it is still aware of the same
        state. clickCount: {clickCount}
      </h2>
    </div>
  );
};

const ThirdComponent = () => (
  <div>
    <h1>Third Component</h1>
    <h2>
      Totally separate but can also update the state. Either by direct reference
      to the store or by using the hook
    </h2>
    <button
      onClick={() =>
        clickCountStore.setState((prevClickCount) => prevClickCount + 1)
      }
    >
      Increment
    </button>
  </div>
);
```

### <a name="usage_name">Referencing stores</a>

It is possible to create multiple stores in an app.
Stores can be referenced by using their name.

```ts
import React from 'react';
import { createStore, useStore } from 'usestore-react';

// The return can be used as an object
const clickCount = createStore('clickCount', 0);
// counter will start at 2
clickCount.setState(2);

// Or it can be used as an array
const [getName, setName] = createStore('name', 'John Doe');

// name will start with 'Jane Doe'
setName('Jane Doe');

const StatefullHello = () => {
  const [clickCount, setClickCount] = useStore('clickCount');
  const [name] = useStore('name');

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <h2>The button was clicked {clickCount} times</h2>
      <button onClick={() => setClickCount(clickCount + 1)}>Update</button>
    </div>
  );
};
```

### More examples

Check out the [Codesandbox demo!](https://codesandbox.io/s/usestore-react-demo-efw6z)
