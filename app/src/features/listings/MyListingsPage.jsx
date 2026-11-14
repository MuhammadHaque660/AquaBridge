import { useState } from 'react';
import { Link } from 'react-router';
import { to } from '../../routes';
import { LISTING_STATUS } from '../../services/contracts';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { ConfirmInline, Empty, PageHead } from '../../shared/components/Feedback';
import { Tabs } from '../../shared/components/Form';
import { useGo, useUi } from '../../shared/hooks';
import { cx, label, mono, page } from '../../shared/styles';
import { validateListing } from './validate';

export const tableWrap = 'overflow-x-auto rounded-ab border border-line bg-surface';
export const table =
  'w-full min-w-[680px] border-collapse text-sm [&_td]:border-t [&_td]:border-line [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle ' +
  '[&_th]:bg-surface-2 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-mono [&_th]:text-[0.6875rem] [&_th]:font-medium [&_th]:tracking-[.08em] [&_th]:text-ink-2 [&_th]:uppercase';

/** My Listings (S-04 manage, S-05 dashboard). Requires login. */
export function MyListingsPage() {
  const { state, update, toast } = useStore();
  const go = useGo();
  const ui = useUi();
  const [tab, setTab] = useState(ui.tab || 'all');
  const [confirm, setConfirm] = useState(null);
  const mine = state.listings.filter((l) => l.owner === state.user);
  const shown = tab === 'all' ? mine : mine.filter((l) => l.status === tab);
  const count = (st) => mine.filter((l) => l.status === st).length;
  const openReqs = (l) =>
    state.requests.filter((r) => r.listingId === l.id && ['pending', 'accepted'].includes(r.status)).length;

  const setStatus = (id, status, msg, extra) => {
    update((s) => {
      byId(s.listings, id).status = status;
      extra?.(s);
    });
    toast(msg);
  };
  const withdraw = (id) => {
    setConfirm(null);
    setStatus(id, 'withdrawn', 'Listing withdrawn', (s) =>
      s.requests.forEach((r) => {
        if (r.listingId === id && r.status === 'pending') r.status = 'declined';
      }),
    );
  };
  const publish = (l) => {
    const e = validateListing(l);
    if (Object.keys(e).length) return go('editor', { id: l.id }, { errors: e });
    setStatus(l.id, 'active', 'Published. It now appears in Browse.');
  };

  const actions = (l) => {
    if (confirm === l.id)
      return (
        <ConfirmInline question="Withdraw this listing?">
          <Button variant="danger" size="sm" onClick={() => withdraw(l.id)}>
            Withdraw
          </Button>
          <Button variant="quiet" size="sm" onClick={() => setConfirm(null)}>
            Keep
          </Button>
        </ConfirmInline>
      );
    const n = openReqs(l);
    return (
      <span className="inline-flex flex-wrap justify-end gap-1">
        {['draft', 'active'].includes(l.status) && (
          <Button variant="quiet" size="sm" to={to('editor', { id: l.id })}>
            Edit
          </Button>
        )}
        {l.status === 'draft' && (
          <Button variant="secondary" size="sm" onClick={() => publish(l)}>
            Publish
          </Button>
        )}
        {['active', 'reserved'].includes(l.status) && n > 0 && (
          <Button variant="secondary" size="sm" to={to('incoming', { listing: l.id })}>
            Requests ({n})
          </Button>
        )}
        {['draft', 'active'].includes(l.status) && (
          <Button variant="quiet" size="sm" className="text-bad! hover:text-bad!" onClick={() => setConfirm(l.id)}>
            Withdraw
          </Button>
        )}
        {l.status === 'withdrawn' && (
          <Button variant="quiet" size="sm" onClick={() => setStatus(l.id, 'draft', 'Moved to drafts')}>
            Move to drafts
          </Button>
        )}
      </span>
    );
  };

  return (
    <div className={page}>
      <PageHead
        title="My Listings"
        actions={
          <Button to="/rehome" variant="primary">
            New listing
          </Button>
        }
      >
        Everything you’ve listed, and where each one is up to.
      </PageHead>
      <div className="mb-6 grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        {[
          ['Active', 'active'],
          ['Reserved', 'reserved'],
          ['Drafts', 'draft'],
          ['Rehomed', 'rehomed'],
        ].map(([t, st]) => (
          <div key={st} className="rounded-ab border-line bg-surface grid gap-0.5 border px-4 py-3">
            <span className={label}>{t}</span>
            <b className="font-display text-xl tabular-nums">{count(st)}</b>
          </div>
        ))}
      </div>
      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          setConfirm(null);
        }}
        tabs={['all', ...LISTING_STATUS].map((t) => [
          t,
          t[0].toUpperCase() + t.slice(1),
          t === 'all' ? mine.length : count(t),
        ])}
      />
      {shown.length ? (
        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Species</th>
                <th>Status</th>
                <th>Open requests</th>
                <th>Listed</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l, i) => (
                <tr key={l.id} data-tour={i === 0 ? 'listing-row' : undefined}>
                  <td>
                    <Link className="font-bold" to={to('listing', { id: l.id })}>
                      {l.title}
                    </Link>
                    <div className={cx(mono, 'text-ink-2')}>{l.id}</div>
                  </td>
                  <td>
                    {speciesFor(l).common} × {l.qty}
                  </td>
                  <td>
                    <Chip status={l.status} />
                  </td>
                  <td className="font-mono">{openReqs(l)}</td>
                  <td className="font-mono">{l.created}</td>
                  <td className="text-right whitespace-nowrap">{actions(l)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title={`No ${tab} listings.`}>
          <span className="text-sm">Listings appear here after you complete the rehoming questions.</span>
        </Empty>
      )}
    </div>
  );
}
