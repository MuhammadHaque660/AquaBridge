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
import { town } from '../listings/validate';
import { page, row } from '../../shared/styles';

/** My adoption requests (M-07) and the adopter's handover confirmation (M-09). Requires login. */
export function MyRequestsPage() {
  const { state, run } = useStore();
  const [confirm, setConfirm] = useState(null);
  const mine = RequestService.listForAdopter(state, state.user);

  const body = (r) => {
    const l = byId(state.listings, r.listingId);
    const owner = USERS[l.owner].short;
    if (r.status === 'pending')
      return (
        <div className="grid gap-4">
          <p className="text-ink-2 text-sm">
            {owner} has not decided yet. You can withdraw the request while it is waiting.
          </p>
          {confirm === r.id ? (
            <ConfirmInline question="Withdraw this request?">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setConfirm(null);
                  run((s) => RequestService.withdraw(s, r.id, state.user), 'Request withdrawn');
                }}
              >
                Yes, withdraw it
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setConfirm(null)}>
                Keep it
              </Button>
            </ConfirmInline>
          ) : (
            <div>
              <Button variant="quiet" size="sm" className="text-bad! hover:text-bad!" onClick={() => setConfirm(r.id)}>
                Withdraw request
              </Button>
            </div>
          )}
          <DemoControl text="The owner decides on their own Requests page. Use these buttons to play their side.">
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
        </div>
      );
    if (r.status === 'accepted')
      return (
        <div className="grid gap-4">
          <Tracker request={r} />
          {r.adopterConfirmed ? (
            <p className="text-sm">You have confirmed. Waiting for {owner} to confirm.</p>
          ) : (
            <div className="grid gap-2">
              <p className="text-ink-2 text-sm">
                {r.ownerConfirmed
                  ? `${owner} has confirmed the handover.`
                  : 'Only confirm after you have collected them.'}
              </p>
              <div className={row}>
                <Button
                  data-tour="adopter-confirm"
                  onClick={() =>
                    run(
                      (s) => RequestService.confirmHandover(s, r.id, state.user),
                      'Thanks. You have confirmed the handover',
                    )
                  }
                >
                  I have received them
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    if (r.status === 'completed')
      return (
        <div className="grid gap-4">
          <Tracker request={r} />
          <Notice tone="ok" title="Rehoming complete">
            Thank you for giving them a home.
          </Notice>
        </div>
      );
    if (r.status === 'declined')
      return (
        <p className="text-ink-2 text-sm">
          {owner} chose another adopter or declined this request. <Link to="/browse">Browse other listings</Link>
        </p>
      );
    if (r.status === 'withdrawn') return <p className="text-ink-2 text-sm">You withdrew this request.</p>;
    return null;
  };

  return (
    <div className={page}>
      <PageHead title="My adoption requests">
        Follow every request you have sent, and confirm the handover when you collect.
      </PageHead>
      {mine.length ? (
        <ul className="border-line m-0 grid max-w-3xl list-none border-t p-0">
          {mine.map((r, i) => {
            const l = byId(state.listings, r.listingId);
            const s = speciesFor(l);
            return (
              <li
                key={r.id}
                className="border-line grid gap-4 border-b py-6"
                data-tour={i === 0 ? 'my-request' : undefined}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <h2 className="text-lg">
                      <Link to={to('listing', { id: l.id })}>{l.title}</Link>
                    </h2>
                    <p className="text-ink-2 text-sm">
                      {s.common} · {town(l.location)} · Owner {USERS[l.owner].short} · Sent {r.created}
                    </p>
                  </div>
                  <Chip status={r.status} />
                </div>
                {body(r)}
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty title="You have not sent any requests yet.">
          <Button size="sm" to="/browse">
            Browse listings
          </Button>
        </Empty>
      )}
    </div>
  );
}
