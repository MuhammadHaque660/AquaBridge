import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ROUTES, routeName, to } from '../routes';
import { USERS } from '../services/contracts';
import { listForOwner } from '../services/requestService';
import { seed } from '../services/seed';
import { useStore } from '../services/store';
import { useTour } from '../reference/tour';
import { Chevron, Logo } from './components/Art';
import { Toast } from './components/Feedback';
import { cx, wrap } from './styles';

const NAV_LINK =
  'relative flex min-h-16 items-center px-3 text-md font-semibold text-ink no-underline hover:text-primary hover:underline ' +
  "aria-[current=page]:text-primary aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-1 aria-[current=page]:after:bg-primary aria-[current=page]:after:content-[''] " +
  'max-lg:min-h-12 max-lg:px-0 max-lg:aria-[current=page]:after:hidden max-lg:aria-[current=page]:underline';
const DD_ITEM =
  'flex w-full items-center justify-between gap-3 rounded-ab-sm px-3 py-2.5 text-left text-md text-ink no-underline hover:bg-mist hover:text-ink ' +
  'aria-[current=page]:font-semibold aria-[current=page]:text-primary max-lg:px-0';
const BADGE = 'min-w-6 rounded-full bg-bad px-1.5 text-center text-xs leading-6 font-bold text-white tabular-nums';

/** Header (SH-04): logo, three main links, and an account menu grouped into Rehoming and Adopting. */
function Header() {
  const { state, update, toast } = useStore();
  const loc = useLocation();
  const navigate = useNavigate();
  const name = routeName(loc.pathname);
  // Menus are open "for" a location, so they close by themselves on navigation.
  const [navFor, setNavFor] = useState(null);
  const [acctFor, setAcctFor] = useState(null);
  const navOpen = navFor === loc.key;
  const acctOpen = acctFor === loc.key;
  const ddRef = useRef(null);
  const ddBtn = useRef(null);
  const menuBtn = useRef(null);

  const user = state.user && USERS[state.user];
  const pendingCount = state.user ? listForOwner(state, state.user).filter((r) => r.status === 'pending').length : 0;

  useEffect(() => {
    if (!navOpen && !acctOpen) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setNavFor(null);
      setAcctFor(null);
      (acctOpen ? ddBtn : menuBtn).current?.focus();
    };
    const onClick = (e) => {
      if (acctOpen && ddRef.current && !ddRef.current.contains(e.target)) setAcctFor(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [navOpen, acctOpen]);

  const toggleAcct = () => {
    setAcctFor(acctOpen ? null : loc.key);
    if (!acctOpen) requestAnimationFrame(() => ddRef.current?.querySelector('[data-dd-item]')?.focus());
  };
  const current = (n) =>
    name === n ||
    (n === 'browse' && ['listing', 'compat', 'request', 'sent'].includes(name)) ||
    (n === 'rehome' && ['review', 'guidance', 'editor'].includes(name))
      ? 'page'
      : undefined;
  const ddLink = (n, title, badge) => (
    <Link to={to(n)} className={DD_ITEM} aria-current={name === n ? 'page' : undefined} data-dd-item>
      <span>{title}</span>
      {badge ? (
        <span className={BADGE} aria-label={`${badge} new`}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
  const signOut = () => {
    update((s) => {
      s.user = null;
    });
    navigate('/');
    toast('You have signed out');
  };
  const clearPending = () =>
    update((s) => {
      s.pending = null;
    });

  return (
    <header className="border-line bg-surface sticky top-0 z-20 border-b">
      <div className={cx(wrap, 'relative flex min-h-16 items-center gap-8')}>
        <Link
          to="/"
          className="text-ink hover:text-ink flex items-center gap-2.5 text-xl font-bold tracking-[-0.01em] no-underline"
        >
          <Logo />
          AquaBridge
        </Link>
        <nav
          id="nav"
          aria-label="Main"
          className={cx(
            'flex flex-1 items-center gap-2',
            'max-lg:border-line max-lg:bg-surface max-lg:shadow-card max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:flex-col max-lg:items-stretch max-lg:gap-0 max-lg:border-b max-lg:px-6 max-lg:pb-4',
            !navOpen && 'max-lg:hidden',
          )}
        >
          <div className="flex items-center max-lg:flex-col max-lg:items-stretch">
            <Link to="/browse" className={NAV_LINK} aria-current={current('browse')}>
              Browse listings
            </Link>
            <Link to="/rehome" className={NAV_LINK} aria-current={current('rehome')}>
              Rehome
            </Link>
            <Link to="/how-it-works" className={NAV_LINK} aria-current={current('help')}>
              How it works
            </Link>
          </div>
          <div className="max-lg:border-line ml-auto flex items-center gap-4 max-lg:ml-0 max-lg:flex-col max-lg:items-stretch max-lg:gap-0 max-lg:border-t max-lg:pt-2">
            {user ? (
              <div className="relative" ref={ddRef}>
                <button
                  ref={ddBtn}
                  type="button"
                  onClick={toggleAcct}
                  aria-expanded={acctOpen}
                  aria-controls="acctPanel"
                  className="group rounded-ab-sm text-md text-ink hover:bg-mist flex min-h-11 items-center gap-2 px-2 font-semibold max-lg:hidden"
                >
                  <span>Your account</span>
                  {pendingCount ? (
                    <span className={BADGE} aria-label={`${pendingCount} new requests`}>
                      {pendingCount}
                    </span>
                  ) : null}
                  <Chevron />
                </button>
                <div
                  id="acctPanel"
                  className={cx(
                    'rounded-ab border-line bg-surface shadow-card absolute top-[calc(100%+8px)] right-0 z-30 w-72 border p-2',
                    'max-lg:static max-lg:grid max-lg:w-auto max-lg:border-0 max-lg:p-0 max-lg:shadow-none',
                    acctOpen ? 'grid' : 'hidden',
                  )}
                >
                  <p className="text-ink-2 px-3 pt-2 pb-2 text-sm max-lg:px-0">
                    Signed in as <strong className="text-ink">{user.name}</strong>
                  </p>
                  <p className="text-ink-2 px-3 pt-2 text-xs font-semibold max-lg:px-0">Rehoming</p>
                  {ddLink('mylistings', 'My listings')}
                  {ddLink('incoming', 'Requests for my listings', pendingCount)}
                  <p className="border-line text-ink-2 mt-2 border-t px-3 pt-3 text-xs font-semibold max-lg:px-0">
                    Adopting
                  </p>
                  {ddLink('habitat', 'My tanks and ponds')}
                  {ddLink('myrequests', 'My adoption requests')}
                  <div className="border-line mt-2 border-t pt-2">
                    <button type="button" className={DD_ITEM} onClick={signOut}>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/signin" onClick={clearPending} className={cx(NAV_LINK, 'px-0')}>
                  Sign in
                </Link>
                <Link
                  to="/signin?tab=register"
                  onClick={clearPending}
                  className="rounded-ab-sm bg-primary hover:bg-primary-hover inline-flex min-h-11 items-center justify-center px-4 font-semibold text-white no-underline hover:text-white max-lg:my-2"
                >
                  Create an account
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="ml-auto lg:hidden">
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setNavFor(navOpen ? null : loc.key)}
            aria-expanded={navOpen}
            aria-controls="nav"
            className="group rounded-ab-sm text-ink hover:bg-mist flex min-h-11 items-center gap-2 px-2 font-semibold"
          >
            {navOpen ? 'Close' : 'Menu'}
            {pendingCount && !navOpen ? <span className={BADGE}>{pendingCount}</span> : null}
            <Chevron />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Prototype banner (GOV.UK "phase banner" pattern). Says plainly that this is a prototype with sample data, and holds the
 * team notes toggle. The notes (screen owner, Sprint 1 tasks and stories) are off by default.
 */
function PrototypeBanner() {
  const { state, update } = useStore();
  const { tour } = useTour();
  const r = ROUTES[routeName(useLocation().pathname)];
  const toggle = () =>
    update((s) => {
      s.notes = !s.notes;
    });
  return (
    <div className="border-line bg-surface border-b">
      <div className={cx(wrap, 'flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm')}>
        <strong className="rounded-ab-sm bg-ink px-2 py-0.5 text-xs font-bold tracking-wide text-white">
          PROTOTYPE
        </strong>
        <span className="text-ink-2">
          Sample data only
          <span className="max-sm:hidden">
            . Guidance and compatibility results are examples, not legal or veterinary advice
          </span>
          .
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={state.notes}
          className="text-primary ml-auto underline underline-offset-3 hover:decoration-2"
        >
          {state.notes ? 'Hide team notes' : 'Team notes'}
        </button>
      </div>
      {state.notes && (
        <div className="border-line bg-mist border-t" aria-label="Team notes">
          <dl
            className={cx(
              wrap,
              '[&_dt]:text-ink-2 m-0 flex flex-wrap gap-x-8 gap-y-1 py-2.5 text-sm [&_dd]:m-0 [&>div]:flex [&>div]:gap-1.5',
            )}
          >
            <div>
              <dt>Screen</dt>
              <dd className="font-semibold">{r.title}</dd>
            </div>
            <div>
              <dt>Built by</dt>
              <dd className="text-primary font-semibold">{r.owner}</dd>
            </div>
            <div>
              <dt>Tasks</dt>
              <dd>{r.tasks}</dd>
            </div>
            <div>
              <dt>Stories</dt>
              <dd>{r.stories}</dd>
            </div>
            <div>
              <dt>Login</dt>
              <dd>{r.auth ? 'Required' : 'Not required'}</dd>
            </div>
            {!tour && (
              <div className="ml-auto">
                <dd>
                  <Link to="/demos">Watch the demo flows</Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

const FOOT_LINK = 'text-left text-ink underline underline-offset-3 hover:text-ink hover:decoration-2';

function Footer() {
  const { replace, toast } = useStore();
  const { exit } = useTour();
  const navigate = useNavigate();
  const reset = () => {
    exit(false);
    replace((cur) => ({ ...seed(), notes: cur.notes }));
    navigate('/');
    toast('Sample data has been reset');
  };
  const group = (title, links) => (
    <nav aria-label={title} className="grid content-start gap-2">
      <h2 className="text-md">{title}</h2>
      <ul className="m-0 grid list-none gap-2 p-0">
        {links.map(([text, target]) => (
          <li key={text}>
            {typeof target === 'function' ? (
              <button type="button" className={FOOT_LINK} onClick={target}>
                {text}
              </button>
            ) : (
              <Link to={target} className={FOOT_LINK}>
                {text}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
  return (
    <footer className="border-primary bg-mist mt-auto border-t-4 text-sm">
      <div
        className={cx(
          wrap,
          'grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-10 py-12 max-lg:grid-cols-2 max-sm:grid-cols-1',
        )}
      >
        <div className="grid content-start gap-3">
          <p className="flex items-center gap-2 text-lg font-bold">
            <Logo />
            AquaBridge
          </p>
          <p className="text-ink-2 max-w-[40ch]">
            Free rehoming for aquarium and pond fish, shrimp and plants in the UK, so they go to a suitable new home
            instead of being released.
          </p>
        </div>
        {group('Using AquaBridge', [
          ['Browse listings', '/browse'],
          ['Rehome an animal or plant', '/rehome'],
          ['How it works', '/how-it-works'],
          ['Never release them', '/how-it-works#never-release'],
        ])}
        {group('About', [
          ['Accessibility', '/accessibility'],
          ['Privacy', '/privacy'],
          ['Contact', '/contact'],
        ])}
        {group('Team tools', [
          ['Demo flows', '/demos'],
          ['Screen map', '/map'],
          ['Design system', '/design'],
          ['Reset sample data', reset],
        ])}
      </div>
      <div className="border-line border-t">
        <p className={cx(wrap, 'text-ink-2 py-4')}>CS2701 Group B14 · Sprint 1 prototype · Sample data only</p>
      </div>
    </footer>
  );
}

/** Page frame: header, prototype banner, the current screen, footer, toast. Focus moves to the new screen on navigation. */
export function Layout({ children }) {
  const location = useLocation();
  const mainRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        (el.querySelector('h2') || el).focus?.({ preventScroll: true });
        return;
      }
    }
    window.scrollTo({ top: 0 });
    if (!first.current) mainRef.current?.focus({ preventScroll: true });
    first.current = false;
  }, [location.key, location.hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-surface absolute -left-[9999px] z-50 px-4 py-3 font-semibold focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <Header />
      <PrototypeBanner />
      <main id="main" tabIndex={-1} ref={mainRef} key={location.key} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
