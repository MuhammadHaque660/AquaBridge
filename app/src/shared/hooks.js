import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { to } from '../routes';

/**
 * Starting UI state for a screen, passed through navigation (e.g. which request is selected).
 * The demo flows use this to open a screen in a specific state.
 */
export function useUi() {
  return useLocation().state?.ui || {};
}

/** go('compat', { id: 'L-1044' }, { hab: 'H-203' }) navigates to a screen, optionally with starting UI state. */
export function useGo() {
  const navigate = useNavigate();
  return useCallback(
    (name, params = {}, ui) => navigate(to(name, params), ui ? { state: { ui } } : undefined),
    [navigate],
  );
}

/** Focus the first field with an error after a failed submit. */
export function focusFirstError() {
  requestAnimationFrame(() =>
    document.querySelector('.has-error input, .has-error select, .has-error textarea')?.focus(),
  );
}
