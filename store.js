import withRedux from 'next-redux-wrapper'
import { bindActionCreators, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'

const exampleInitialState = {
  lastUpdate: 0,
  light: false,
  count: 0
}

export const actionTypes = {
  ADD: 'ADD',
  TICK: 'TICK'
}

// REDUCERS
export const reducer = (state = exampleInitialState, action) => {
  switch (action.type) {
    case actionTypes.TICK:
      return Object.assign({}, state, { lastUpdate: action.ts, light: !!action.light })
    case actionTypes.ADD:
      return Object.assign({}, state, {
        count: state.count + 1
      })
    default: return state
  }
}

// ACTIONS
export const serverRenderClock = (isServer) => dispatch => {
  return dispatch({ type: actionTypes.TICK, light: !isServer, ts: Date.now() })
}

export const startClock = () => dispatch => {
  return setInterval(() => dispatch({ type: actionTypes.TICK, light: true, ts: Date.now() }), 800)
}

export const addCount = () => dispatch => {
  return dispatch({ type: actionTypes.ADD })
}

export const initStore = (initialState = exampleInitialState) => {
  return createStore(reducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)))
}


const mapDispatchToProps = (dispatch) => {
  return {
    addCount: bindActionCreators(addCount, dispatch),
    startClock: bindActionCreators(startClock, dispatch)
  }
}


import React from 'react'
import { Provider } from 'react-redux'

export default function withStore(Component) {
  const ComponentWithStore = withRedux(initStore, null, mapDispatchToProps)(Component)

  // Handle renderPage API
  // =====================
  //
  const _renderPage = Component.renderPage
  if (typeof _renderPage === 'function') {
    /// COPY FROM Next-Redux-Wrapper as it is not exposed as public API
    function nextReduxWrapperInitStore(makeStore, initialState, context, config) {
        var isBrowser = typeof window !== 'undefined';
        var req = context.req;
        var isServer = !!req && !isBrowser;
        var storeKey = config.storeKey;

        var options = Object.assign({}, config, {
            isServer: isServer,
            req: req,
            res: context.res,
            query: context.query
        });

        // Always make a new store if server
        if (isServer) {
            if (!req._store) {
                req._store = makeStore(initialState, options);
            }
            return req._store;
        }
        if (!isBrowser) return null;

        // Memoize store if client
        if (!window[storeKey]) {
            window[storeKey] = makeStore(initialState, options);
        }

        return window[storeKey];

    }
    /// END OF COPY


    // NOTE: This was adopted from Next-Redux-Wrapper render() implementation
    const config = {storeKey: '__NEXT_REDUX_STORE__', debug: false}
    const createStore = initStore // XXX map the global variable to the expected local name (to match the copied implementation)
    ComponentWithStore.renderPage = function(ctx) {
      const props = ctx.props || {};

      const initialState = props.initialState || {};
      const initialProps = props.initialProps || {};
      const hasStore = props.store && props.store.dispatch && props.store.getState;
      const store = hasStore
            ? props.store
            : nextReduxWrapperInitStore(createStore, initialState, {}, config); // client case, no store but has initialState

      if (!store) {
        console.error('Attention, withRedux has to be used only for top level pages, all other components must be wrapped with React Redux connect!');
        console.error('Check ' + Component.name + ' component.');
        return null;
      }

      return React.createElement( //FIXME This will create double Provider for _document case
        Provider,
        {store: store},
        _renderPage(ctx)
      );
    }
  }

  return ComponentWithStore
}
