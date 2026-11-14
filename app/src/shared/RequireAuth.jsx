import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '../routes';
import { useStore } from '../services/store';

/**
 * Route guard (SH-05). Signed-out users are sent to /signin; the page they wanted is saved (never in the URL)
 * and they return to it after logging in.
 */
export function RequireAuth({ name, children }) {
  const { state, update } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const signedIn = !!state.user;

  useEffect(() => {
    if (signedIn) return;
    update((s) => {
      s.pending = { to: location.pathname + location.search, name, label: ROUTES[name].title };
    });
    navigate('/signin', { replace: true });
  }, [signedIn, location.pathname, location.search, name, update, navigate]);

  return signedIn ? children : null;
}
