var {
  createContext,
  createElement,
  useCallback,
  useState,
  useEffect,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} = require('react');

// utility functions

var isFunction = fn => (typeof fn === 'function');

var updateValue = (oldValue, newValue) => {
  if (isFunction(newValue)) {
    return newValue(oldValue);
  }
  return newValue;
};

// ref: https://github.com/dai-shi/react-hooks-global-state/issues/5
var useUnstableContextWithoutWarning = (Context, observedBits) => {
  var { ReactCurrentDispatcher } = __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  var dispatcher = ReactCurrentDispatcher.current;
  if (!dispatcher) {
    throw new Error('Hooks can only be called inside the body of a function component. (https://fb.me/react-invalid-hook-call)');
  }
  return dispatcher.useContext(Context, observedBits);
};

// core functions

var createGlobalStateCommon = (initialState) => {
  var keys = Object.keys(initialState);
  var globalState = initialState;
  var listeners = [];

  var calculateChangedBits = (a, b) => {
    var bits = 0;
    keys.forEach((k, i) => {
      if (a[k] !== b[k]) bits |= 1 << i;
    });
    return bits;
  };

  var Context = createContext(initialState, calculateChangedBits);

  var GlobalStateProvider = ({ children }) => {
    var [state, setState] = useState(initialState);
    useEffect(() => {
      listeners.push(setState);
      if (globalState !== initialState) {
        // globalState is updated during the initialization
        // Note: there could be a better way for this
        setState(globalState);
      }
      var cleanup = () => {
        var index = listeners.indexOf(setState);
        listeners.splice(index, 1);
      };
      return cleanup;
    }, []);
    return createElement(Context.Provider, { value: state }, children);
  };

  var setGlobalState = (name, update) => {
    const updated = updateValue(globalState[name], update);
    globalState[name] = updated;
    listeners.forEach(f => f(globalState));
  };

  var useGlobalState = (name) => {
    var index = keys.indexOf(name);
    var observedBits = 1 << index;
    var state = useUnstableContextWithoutWarning(Context, observedBits);
    var updater = useCallback(u => setGlobalState(name, u), [name]);
    return [state[name], updater];
  };

  var getState = () => globalState;

  var setState = (state) => {
    globalState = state;
    listeners.forEach(f => f(globalState));
  };

  return {
    GlobalStateProvider,
    setGlobalState,
    useGlobalState,
    getState,
    setState,
  };
};

// export functions

const createGlobalState = (initialState) => {
  var {
    GlobalStateProvider,
    useGlobalState,
    setGlobalState,
  } = createGlobalStateCommon(initialState);
  return {
    GlobalStateProvider,
    useGlobalState,
    setGlobalState,
  };
};

const createStore = (reducer, initialState, enhancer) => {
  if (enhancer) return enhancer(createStore)(reducer, initialState);
  var {
    GlobalStateProvider,
    useGlobalState,
    getState,
    setState,
  } = createGlobalStateCommon(initialState);
  var dispatch = (action) => {
    var oldState = getState();
    var newState = reducer(oldState, action);
    setState(newState);
    return action;
  };
  return {
    GlobalStateProvider,
    useGlobalState,
    getState,
    setState, // for devtools.js
    dispatch,
  };
};

module.exports = {
  createStore,
  createGlobalState
}