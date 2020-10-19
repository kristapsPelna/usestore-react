# React Hook Store

[![npm version](https://badge.fury.io/js/react-usestore.svg)](https://badge.fury.io/js/react-usestore)

A very simple and small (1k gzipped!) state management lib for React that uses the bleeding edge React's `useState` hook.
Which basically means no magic behind the curtains, only pure react APIs being used to share state across components.

Try it on [Codesandbox!](https://codesandbox.io/s/react-usestore-demo-efw6z)

# Table of Contents

- [Installation](#installation)
- Usage
  - [Basic](#usage_basic)
  - [Referencing stores](#usage_namespace)
  - [Reducer powered stores](#usage_reducer)
  - [More examples](https://codesandbox.io/s/react-usestore-demo-efw6z)

## <a name="installation">Installation</a>

`npm i react-usestore --save`

## <a name="usage">Usage</a>

### <a name="usage_basic">Basic</a>

This is the most basic implementation of the library. create a store with its initial state.
Later, call `useStore` inside components to retrieve its state and setState method.
The value passed as the first argument to the setState method will be the new state.

```javascript
import React from 'react';
import { createStore, useStore } from 'react-usestore';

createStore('timesClicked', 0);

function StatefullHello() {
  // just use the useStore method to grab the state and the setState methods
  const [timesClicked, setClicks] = useStore('timesClicked');

  return (
    <div>
      <h1>Hello, component!</h1>
      <h2>The button was clicked {timesClicked} times</h2>
      <button onClick={() => timesClicked + 1}>Update</button>
    </div>
  );
}

function AnotherComponent() {
  const [timesClicked] = useStore('timesClicked');
  return (
    <div>
      <h1>
        Hello, this is a second component, with no relation to the one on the
        top
      </h1>
      <h2>
        But it is still aware of how many times the button was clicked:{' '}
        {timesClicked}
      </h2>
    </div>
  );
}
```

### <a name="usage_namespace">Referencing stores</a>

It is possible to create multiple stores in an app.
Stores can be referenced by using their name.

```javascript
import React from 'react';
import { createStore, useStore } from 'react-usestore';

const clickCount = createStore('clickCount', 0);
createStore('name', 'John Doe');

// counter will start at 2
clickCount.setState(2);

const StatefullHello = () => {
  const [clicks, setClicks] = useStore('clickCount');
  // this line will reference a store by its name
  const [name] = useStore('nameStore');

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <h2>The button was clicked {clicks} times</h2>
      <button onClick={() => setClicks(clicks + 1)}>Update</button>
    </div>
  );
};
```

### More examples

Check out the [Codesandbox demo!](https://codesandbox.io/s/react-usestore-demo-efw6z)
