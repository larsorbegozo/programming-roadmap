import type { AppState } from '../types/state';
import { reducer, type Action } from './reducer';

/**
 * The app state lives in a small store instead of React's own reducer state.
 * `getState()` therefore always returns the exact, newest state, even in the few milliseconds
 * before React has re-rendered. Cloud sync depends on that: reading a render-lagged copy once
 * made it upload an older document over a newer one.
 */
export interface AppStore {
  getState: () => AppState;
  dispatch: (action: Action) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createAppStore(initial: AppState): AppStore {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch(action) {
      const next = reducer(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
