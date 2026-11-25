import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { reconcileAchievements, sameKeys } from '../lib/progress';
import { reducer, type Action } from '../lib/reducer';
import { loadState, saveState } from '../lib/storage';
import type { AppState } from '../types/state';

interface AppStateContextValue {
  state: AppState;
  dispatch: (action: Action) => void;
  /** A storage problem to surface to the user, if any. */
  storageError: string | null;
  dismissStorageError: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadState);
  const [state, dispatch] = useReducer(reducer, initial.state);
  const [storageError, setStorageError] = useState<string | null>(initial.error ?? null);

  // Keep stored achievements in sync with progress (records the date a milestone was first reached).
  useEffect(() => {
    const next = reconcileAchievements(state);
    if (!sameKeys(next, state.achievements)) dispatch({ type: 'setAchievements', achievements: next });
  }, [state]);

  useEffect(() => {
    if (!saveState(state)) setStorageError('Could not save progress to browser storage. Export a backup from Settings.');
  }, [state]);

  const value = useMemo(
    () => ({ state, dispatch, storageError, dismissStorageError: () => setStorageError(null) }),
    [state, storageError],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
