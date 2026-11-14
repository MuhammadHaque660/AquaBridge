import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ROUTES, routeName, to } from '../routes';
import { USERS } from '../services/contracts';
import { listForOwner } from '../services/requestService';
import { seed } from '../services/seed';
import { useStore } from '../services/store';
import { useTour } from '../reference/tour';
import { Logo, Chevron } from './components/Art';
import { Toast } from './components/Feedback';
import { cx, wrap } from './styles';

const NAV_LINK =
  'rounded-ab-sm px-3.5 py-2.5 font-display text-[1.0625rem] font-medium text-ink no-underline hover:bg-surface-2 hover:text-ink max-lg:p-3 ' +
  'aria-[current=page]:rounded-none aria-[current=page]:text-primary aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-primary)] ' +
  'max-lg:aria-[current=page]:bg-primary-soft max-lg:aria-[current=page]:shadow-[inset_3px_0_0_var(--color-primary)]';
const DD_ITEM =
  'flex w-full items-center justify-between gap-2 rounded-ab-sm px-3 py-2.5 text-left text-md text-ink no-underline hover:bg-surface-2 hover:text-ink ' +
  'aria-[current=page]:bg-primary-soft aria-[current=page]:font-bold aria-[current=page]:text-primary';
const BADGE =
  'h-[22px] min-w-[22px] rounded-[11px] bg-warn px-[7px] text-center font-mono text-[0.75rem] leading-[22px] font-medium text-white';

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('');

/** Header (SH-04): three main links, and an account menu grouped into Rehoming and Adopting. */
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
  const inAccount = ['mylistings', 'incoming', 'habitat', 'myrequests'].includes(name);

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
    (n === 'browse' && ['listing', 'compat', 'request'].includes(name)) ||
    (n === 'rehome' && ['review', 'guidance', 'editor'].includes(name))
      ? 'page'
      : undefined;
  const ddLink = (n, title, hint, badge) => (
    <Link to={to(n)} className={DD_ITEM} aria-current={name === n ? 'page' : undefined} data-dd-item>
      <span>
        {title}
        <small className="text-ink-2 block text-xs font-normal">{hint}</small>
      </span>
      {badge ? (
        <span className={BADGE} aria-label={`${badge} waiting`}>
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
    toast('Signed out');
  };
  const clearPending = () =>
    update((s) => {
      s.pending = null;
    });

  return (
    <header className="border-line bg-surface sticky top-[env(safe-area-inset-top,0px)] z-20 border-b">
      <div className={cx(wrap, 'relative flex min-h-16 items-center gap-6')}>
        <Link
          to="/"
          className="font-display text-ink hover:text-ink flex items-center gap-2.5 text-[1.375rem] font-bold tracking-[-0.02em] no-underline"
        >
          <Logo />
          AquaBridge
        </Link>
        <nav
          id="nav"
          aria-label="Main"
          className={cx(
            'flex flex-1 items-center gap-6',
            'max-lg:border-line max-lg:bg-surface max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:flex-col max-lg:items-stretch max-lg:gap-2 max-lg:border-b max-lg:px-4 max-lg:pt-2 max-lg:pb-4 max-lg:shadow-[0_14px_30px_rgba(18,50,74,.12)]',
            !navOpen && 'max-lg:hidden',
          )}
        >
          <div className="flex items-center gap-1 max-lg:flex-col max-lg:items-stretch">
            <Link to="/browse" className={NAV_LINK} aria-current={current('browse')}>
              Browse listings
            </Link>
            <Link to="/rehome" className={NAV_LINK} aria-current={current('rehome')}>
              Rehome
            </Link>
            <Link to="/#how" className={NAV_LINK}>
              How it works
            </Link>
          </div>
          <div className="max-lg:border-line ml-auto flex items-center gap-2 max-lg:ml-0 max-lg:flex-col max-lg:items-stretch max-lg:border-t max-lg:pt-3">
            {user ? (
              <div className="relative" ref={ddRef}>
                <button
                  ref={ddBtn}
                  type="button"
                  onClick={toggleAcct}
                  aria-expanded={acctOpen}
                  aria-controls="acctPanel"
                  className={cx(
                    'group bg-surface font-display text-md text-ink hover:border-ink-2 aria-expanded:border-ink-2 flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 font-medium max-lg:hidden',
                    inAccount ? 'border-primary' : 'border-line',
                  )}
                >
                  <span
                    className="bg-primary-soft font-display text-primary grid size-8 flex-none place-items-center rounded-full text-[0.875rem] font-bold"
                    aria-hidden="true"
                  >
                    {initials(user.name)}
                  </span>
                  <span>My account</span>
                  {pendingCount ? (
                    <span className={BADGE} aria-label={`${pendingCount} requests waiting`}>
                      {pendingCount}
                    </span>
                  ) : null}
                  <Chevron />
                </button>
                <div
                  id="acctPanel"
                  className={cx(
                    'rounded-ab border-line bg-surface absolute top-[calc(100%+10px)] right-0 z-30 w-[280px] border p-2 shadow-[0_14px_36px_rgba(18,50,74,.14)]',
                    'max-lg:static max-lg:grid max-lg:w-auto max-lg:border-0 max-lg:p-0 max-lg:shadow-none',
                    acctOpen ? 'grid' : 'hidden',
                  )}
                >
                  <div className="border-line text-ink-2 border-b px-3 pt-2 pb-3 text-sm">
                    <strong className="font-display text-ink block text-[1.0625rem] font-semibold">{user.name}</strong>
                    Sample account
                  </div>
                  <div className="border-line grid border-b py-2">
                    <span className="text-ink-2 px-3 pt-1.5 pb-1 font-mono text-[0.75rem] tracking-[.1em] uppercase">
                      Rehoming
                    </span>
                    {ddLink('mylistings', 'My Listings', 'Drafts, live and rehomed')}
                    {ddLink('incoming', 'Incoming requests', 'Adopters asking for yours', pendingCount)}
                  </div>
                  <div className="border-line grid border-b py-2">
                    <span className="text-ink-2 px-3 pt-1.5 pb-1 font-mono text-[0.75rem] tracking-[.1em] uppercase">
                      Adopting
                    </span>
                    {ddLink('habitat', 'My Habitat', 'Your saved tanks and ponds')}
                    {ddLink('myrequests', 'My Requests', 'Requests you have sent')}
                  </div>
                  <button type="button" className={cx(DD_ITEM, 'text-ink-2 mt-1')} onClick={signOut}>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={clearPending}
                  className="rounded-ab text-md text-ink hover:bg-primary-soft hover:text-ink inline-flex items-center px-2 py-[11px] leading-[1.2] font-bold no-underline"
                >
                  Log in
                </Link>
                <Link
                  to="/signin?tab=register"
                  onClick={clearPending}
                  className="rounded-ab bg-primary text-md hover:bg-primary-hover inline-flex items-center justify-center px-3 py-[7px] leading-[1.2] font-bold text-white no-underline hover:text-white"
                >
                  Sign up
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
            className="rounded-ab border-line bg-surface text-md text-ink hover:border-ink-2 inline-flex items-center border px-3 py-[7px] leading-[1.2] font-bold"
          >
            {navOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}

/** Build notes strip: which screen this is, who builds it and which backlog items it covers. Prototype only. */
function BuildNotes() {
  const { state } = useStore();
  const { tour } = useTour();
  const r = ROUTES[routeName(useLocation().pathname)];
  if (!state.notes) return null;
  return (
    <div
      className="border-line bg-surface-2 text-ink-2 [&_b]:text-ink border-b font-mono text-xs [&_b]:font-medium"
      aria-label="Build notes"
    >
      <div className={cx(wrap, 'flex flex-wrap gap-x-6 gap-y-1.5 py-2')}>
        <span>
          SCREEN <b>{r.title}</b>
        </span>
        <span>
          OWNER <b className="text-primary!">{r.owner}</b>
        </span>
        <span>
          TASKS <b>{r.tasks}</b>
        </span>
        <span>
          STORIES <b>{r.stories}</b>
        </span>
        <span>
          LOGIN <b>{r.auth ? 'required' : 'not required'}</b>
        </span>
        {!tour && (
          <Link to="/demos" className="ml-auto">
            Watch the demo flows →
          </Link>
        )}
      </div>
    </div>
  );
}

const FOOT_LINK = 'text-primary underline underline-offset-3 hover:text-primary-hover';

function Footer() {
  const { state, update, replace, toast } = useStore();
  const { exit } = useTour();
  const navigate = useNavigate();
  const reset = () => {
    exit(false);
    replace((cur) => ({ ...seed(), notes: cur.notes }));
    navigate('/');
    toast('Sample data reset');
  };
  return (
    <footer className="border-line bg-surface text-ink-2 border-t text-sm">
      <div className={cx(wrap, 'flex flex-wrap justify-between gap-x-8 gap-y-4 py-6')}>
        <div className="grid gap-1">
          <strong className="text-ink">AquaBridge Sprint 1 prototype</strong>
          <span>
            Uses sample data only. Guidance and compatibility results are illustrative, not legal or biological advice.
          </span>
        </div>
        <nav aria-label="Prototype tools" className="flex flex-wrap gap-4">
          <Link to="/demos">Demo flows</Link>
          <Link to="/map">Screen map</Link>
          <Link to="/design">Design system</Link>
          <button
            type="button"
            className={FOOT_LINK}
            onClick={() =>
              update((s) => {
                s.notes = !s.notes;
              })
            }
          >
            {state.notes ? 'Hide build notes' : 'Show build notes'}
          </button>
          <button type="button" className={FOOT_LINK} onClick={reset}>
            Reset sample data
          </button>
        </nav>
      </div>
    </footer>
  );
}

/** Page frame: header, build notes, the current screen, footer, toast. Focus moves to the new screen on navigation. */
export function Layout({ children }) {
  const location = useLocation();
  const mainRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (location.hash === '#how') {
      const how = document.getElementById('how');
      how?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      how?.querySelector('h2')?.focus({ preventScroll: true });
      return;
    }
    window.scrollTo({ top: 0 });
    if (!first.current) mainRef.current?.focus({ preventScroll: true });
    first.current = false;
  }, [location.key, location.hash]);

  return (
    <>
      <a
        href="#main"
        className="focus:bg-surface absolute -left-[9999px] focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <BuildNotes />
      <main id="main" tabIndex={-1} ref={mainRef} key={location.key} className="focus:outline-none">
        {children}
      </main>
      <Footer />
      <Toast />
    </>
  );
}
