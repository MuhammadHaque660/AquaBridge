import { useState } from 'react';
import { Link } from 'react-router';
import { to } from '../../routes';
import { USERS } from '../../services/contracts';
import * as RequestService from '../../services/requestService';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { ConfirmInline, DemoControl, Empty, Notice, PageHead } from '../../shared/components/Feedback';
import { Tracker } from '../../shared/components/Tracker';
import { cx, mono, page, panel, row, stack } from '../../shared/styles';

/** My Requests (M-07) and the adopter's handover confirmation (M-09). Requires login. */
export function MyRequestsPage() {
  const { state, run } = useStore();
  const [confirm, setConfirm] = useState(null);
  const mine = RequestService.listForAdopter(state, state.user);

  const body = (r) => {
    const l = byId(state.listings, r.listingId);
    const owner = USERS[l.owner].short;
    if (r.status === 'pending')
      return confirm === r.id ? (
        <ConfirmInline question="Withdraw this request?">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setConfirm(null);
              run((s) => RequestService.withdraw(s, r.id, state.user), 'Request withdrawn');
            }}
          >
            Withdraw
          </Button>
          <Button variant="quiet" size="sm" onClick={() => setConfirm(null)}>
            Keep it
          </Button>
        </ConfirmInline>
      ) : (
        <>
          <div className={row}>
            <Button variant="quiet" size="sm" className="text-bad! hover:text-bad!" onClick={() => setConfirm(r.id)}>
              Withdraw request
            </Button>
          </div>
          <DemoControl text="The owner decides in their Incoming requests page. Use these to play their side.">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => run((s) => RequestService.accept(s, r.id, l.owner), 'The owner accepted your request')}
            >
              Owner accepts
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => run((s) => RequestService.decline(s, r.id, l.owner), 'The owner declined your request')}
            >
              Owner declines
            </Button>
          </DemoControl>
        </>
      );
    if (r.status === 'accepted')
      return (
        <>
          <Tracker request={r} />
          {r.adopterConfirmed ? (
            <p className="text-sm">You confirmed. Waiting for {owner}.</p>
          ) : (
            <div className={row}>
              <Button
                data-tour="adopter-confirm"
                onClick={() => run((s) => RequestService.confirmHandover(s, r.id, state.user), 'Handover confirmed')}
              >
                I’ve received them
              </Button>
              <span className="text-ink-2 text-sm">
                {r.ownerConfirmed ? `${owner} has already confirmed.` : 'Confirm only after the handover.'}
              </span>
            </div>
          )}
        </>
      );
    if (r.status === 'completed')
      return (
        <>
          <Tracker request={r} />
          <Notice tone="ok" title="Rehoming complete">
            Thanks for giving them a home.
          </Notice>
        </>
      );
    if (r.status === 'declined')
      return (
        <p className="text-ink-2 text-sm">
          The owner chose another adopter or declined this request. <Link to="/browse">Browse other listings</Link>
        </p>
      );
    return null;
  };

  return (
    <div className={page}>
      <PageHead title="My Requests">Track every adoption request you’ve sent.</PageHead>
      {mine.length ? (
        <div className={stack}>
          {mine.map((r, i) => {
            const l = byId(state.listings, r.listingId);
            const s = speciesFor(l);
            return (
              <article key={r.id} className={cx(panel, 'grid gap-4')} data-tour={i === 0 ? 'my-request' : undefined}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <h3>
                      <Link to={to('listing', { id: l.id })}>{l.title}</Link>
                    </h3>
                    <span className="text-ink-2 text-sm">
                      {s.common} · {l.location} · owner {USERS[l.owner].short} · sent {r.created}
                    </span>
                  </div>
                  <div className={row}>
                    <Chip status={r.status} />
                    <span className={cx(mono, 'text-ink-2')}>{r.id}</span>
                  </div>
                </div>
                {body(r)}
              </article>
            );
          })}
        </div>
      ) : (
        <Empty title="You haven’t sent any requests.">
          <Button size="sm" to="/browse">
            Browse listings
          </Button>
        </Empty>
      )}
    </div>
  );
}
