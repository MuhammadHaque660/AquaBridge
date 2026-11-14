/**
 * App state, saved in this browser (localStorage). Shared by every feature.
 *
 *   const { state, update, run, toast } = useStore();
 *   update(s => { s.user = ME; })                 // mutate a copy; saved and re-rendered
 *   run(s => accept(s, id, state.user), 'Done')   // same, but shows the error message as a toast if it throws
 *
 * Mock authentication (SH-05) lives here too: state.user is the signed-in user ID or null.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { seed } from './seed';

/**
 * Saved sample data is versioned. Bump DATA_VERSION whenever seed.js or a data shape changes: browsers holding an older
 * copy then start again from the new sample data instead of breaking on stale records.
 */
export const DATA_VERSION = 3;
const KEY = 'aquabridge-app';
const OLD_KEYS = ['aquabridge-app-v1', 'aquabridge-prototype-v1'];
const StoreContext = createContext(null);

function load() {
  try {
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === DATA_VERSION && Array.isArray(saved.listings)) return saved;
  } catch {
    /* unreadable: fall through to fresh sample data */
  }
  return { ...seed(), version: DATA_VERSION };
}
function persist(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

export function StoreProvider({ children, initial }) {
  const [state, setState] = useState(() => initial || load());
  const [toastMsg, setToastMsg] = useState(null);
  const ref = useRef(state);
  const timer = useRef(null);

  /** Swap the whole state, e.g. after a reset. Pass a value, or a function of the current state. */
  const replace = useCallback((v) => {
    const next = { ...(typeof v === 'function' ? v(ref.current) : v), version: DATA_VERSION };
    ref.current = next;
    persist(next);
    setState(next);
  }, []);

  const update = useCallback(
    (fn) => {
      const draft = structuredClone(ref.current);
      const result = fn(draft); // if this throws, nothing is saved
      replace(draft);
      return result;
    },
    [replace],
  );

  const toast = useCallback((msg) => {
    setToastMsg({ msg, at: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const run = useCallback(
    (fn, okMsg) => {
      try {
        update(fn);
        if (okMsg) toast(okMsg);
        return true;
      } catch (e) {
        toast(e.message);
        return false;
      }
    },
    [update, toast],
  );

  const value = useMemo(
    () => ({ state, update, replace, run, toast, toastMsg }),
    [state, update, replace, run, toast, toastMsg],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
