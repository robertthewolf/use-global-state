
# use-global-state

Global state react hook for easy management of data

simplified from [dai-shi/react-hooks-global-state](https://github.com/dai-shi/react-hooks-global-state)

## Install

```bash
npm install --save use-global-state
```

## Usage

### setState style

```javascript
import React from 'react';
import { createGlobalState } from 'react-hooks-global-state';

const initialState = { counter: 0 };
const { GlobalStateProvider, useGlobalState } = createGlobalState(initialState);

const Counter = () => {
  const [value, update] = useGlobalState('counter');
  return (
    <div>
      <span>Counter: {value}</span>
      <button onClick={() => update(v => v + 1)}>+1</button>
      <button onClick={() => update(v => v - 1)}>-1</button>
    </div>
  );
};

const App = () => (
  <GlobalStateProvider>
    <Counter />
    <Counter />
  </GlobalStateProvider>
);
```

### reducer style

```javascript
import React from 'react';
import { createStore } from 'react-hooks-global-state';

const reducer = (state, action) => {
  switch (action.type) {
    case 'increment': return { ...state, counter: state.counter + 1 };
    case 'decrement': return { ...state, counter: state.counter - 1 };
    default: return state;
  }
};
const initialState = { counter: 0 }; // initialState is not optional.
const { GlobalStateProvider, dispatch, useGlobalState } = createStore(reducer, initialState);

const Counter = () => {
  const [value] = useGlobalState('counter');
  return (
    <div>
      <span>Counter: {value}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
    </div>
  );
};

const App = () => (
  <GlobalStateProvider>
    <Counter />
    <Counter />
  </GlobalStateProvider>
);
```
