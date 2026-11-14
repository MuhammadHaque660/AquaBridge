import { useState } from 'react';
import { Link } from 'react-router';
import { to } from '../../routes';
import { LISTING_STATUS } from '../../services/contracts';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip, statusLabel } from '../../shared/components/Chip';
import { ConfirmInline, Empty, PageHead } from '../../shared/components/Feedback';
import { Tabs } from '../../shared/components/Form';
import { useGo, useUi } from '../../shared/hooks';
import { page } from '../../shared/styles';
import { validateListing } from './validate';

export const tableWrap = 'overflow-x-auto';
export const table =
  'w-full min-w-[680px] border-collapse text-sm [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-3.5 [&_td]:align-middle [&_td:first-child]:pl-0 ' +
  '[&_th]:border-b-2 [&_th]:border-ink [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink [&_th:first-child]:pl-0';

const linkBtn = 'text-sm text-primary underline underline-offset-3 hover:text-primary-hover hover:decoration-2';

const TAB_LABEL = {
  all: 'All',
  draft: 'Drafts',
  active: 'Live',
  reserved: 'Reserved',
  rehomed: 'Rehomed',
  withdrawn: 'Withdrawn',
};

/** My listings (S-04 manage, S-05 dashboard). Requires login. */
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
    setStatus(l.id, 'active', 'Your listing is live. It now appears in Browse listings.');
  };

  const actions = (l) => {
    if (confirm === l.id)
      return (
        <ConfirmInline question="Withdraw this listing?">
          <Button variant="danger" size="sm" onClick={() => withdraw(l.id)}>
            Yes, withdraw
          </Button>
          <button type="button" className={linkBtn} onClick={() => setConfirm(null)}>
            Keep it
          </button>
        </ConfirmInline>
      );
    const n = openReqs(l);
    return (
      <span className="inline-flex flex-wrap justify-end gap-x-4 gap-y-1">
        {['draft', 'active'].includes(l.status) && (
          <Link to={to('editor', { id: l.id })} className={linkBtn}>
            Edit<span className="sr-only"> {l.title}</span>
          </Link>
        )}
        {l.status === 'draft' && (
          <button type="button" className={linkBtn} onClick={() => publish(l)}>
            Publish<span className="sr-only"> {l.title}</span>
          </button>
        )}
        {['active', 'reserved'].includes(l.status) && n > 0 && (
          <Link to={to('incoming', { listing: l.id })} className={linkBtn}>
            Requests ({n})
          </Link>
        )}
        {['draft', 'active'].includes(l.status) && (
          <button
            type="button"
            className="text-bad text-sm underline underline-offset-3 hover:decoration-2"
            onClick={() => setConfirm(l.id)}
          >
            Withdraw<span className="sr-only"> {l.title}</span>
          </button>
        )}
        {l.status === 'withdrawn' && (
          <button type="button" className={linkBtn} onClick={() => setStatus(l.id, 'draft', 'Moved to drafts')}>
            Move to drafts
          </button>
        )}
      </span>
    );
  };

  return (
    <div className={page}>
      <PageHead title="My listings" actions={<Button to="/rehome">Rehome another</Button>}>
        Everything you have listed, and where each one is up to.
      </PageHead>
      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          setConfirm(null);
        }}
        tabs={['all', ...LISTING_STATUS].map((t) => [t, TAB_LABEL[t], t === 'all' ? mine.length : count(t)])}
      />
      {shown.length ? (
        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th scope="col">Listing</th>
                <th scope="col">Status</th>
                <th scope="col">Open requests</th>
                <th scope="col">Listed</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l, i) => (
                <tr key={l.id} data-tour={i === 0 ? 'listing-row' : undefined}>
                  <td>
                    <Link className="font-semibold" to={to('listing', { id: l.id })}>
                      {l.title}
                    </Link>
                    <div className="text-ink-2">
                      {speciesFor(l).common} × {l.qty}
                    </div>
                  </td>
                  <td>
                    <Chip status={l.status} />
                  </td>
                  <td className="tabular-nums">{openReqs(l)}</td>
                  <td className="whitespace-nowrap tabular-nums">{l.created}</td>
                  <td className="text-right">{actions(l)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={
            tab === 'all'
              ? 'You have not listed anything yet.'
              : `You have no listings that are ${statusLabel(tab).toLowerCase()}.`
          }
        >
          <Button to="/rehome" variant="secondary">
            Rehome an animal or plant
          </Button>
        </Empty>
      )}
    </div>
  );
}
