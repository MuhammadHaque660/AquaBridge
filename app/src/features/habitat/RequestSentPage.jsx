import { Link, useParams } from 'react-router';
import { to } from '../../routes';
import { USERS } from '../../services/contracts';
import { byId } from '../../services/seed';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Empty, Panel } from '../../shared/components/Feedback';
import { cx, page, reasonsOl, row } from '../../shared/styles';

/** Request sent (M-06): confirmation with a reference and what happens next (GOV.UK confirmation pattern). Requires login. */
export function RequestSentPage() {
  const { id } = useParams();
  const { state } = useStore();
  const r = byId(state.requests, id);
  const l = r && byId(state.listings, r.listingId);

  if (!r || !l)
    return (
      <div className={page}>
        <Empty title="We could not find that request.">
          <Button to="/account/requests" variant="secondary">
            Go to my adoption requests
          </Button>
        </Empty>
      </div>
    );

  const owner = USERS[l.owner].short;
  return (
    <div className={cx(page, 'max-w-3xl')}>
      <Panel title="Request sent">
        Your reference
        <br />
        <strong className="text-2xl tabular-nums">{r.id}</strong>
      </Panel>
      <div className="mt-10 grid gap-6">
        <p className="text-md">
          We have sent your request for <Link to={to('listing', { id: l.id })}>{l.title}</Link> to {owner}.
        </p>
        <section className="grid gap-3">
          <h2>What happens next</h2>
          <ol className={reasonsOl}>
            <li>{owner} reads your introduction and the summary of your tank or pond.</li>
            <li>
              You will see their decision in your adoption requests. If they accept, the listing is reserved for you.
            </li>
            <li>You arrange collection together. Only then do you get the exact pickup point.</li>
            <li>After the handover, you both confirm it so the rehoming can be completed.</li>
          </ol>
        </section>
        <p className="text-ink-2">You can withdraw the request at any time while it is waiting for the owner.</p>
        <div className={row}>
          <Button to="/account/requests">Go to my adoption requests</Button>
          <Button to="/browse" variant="quiet">
            Browse more listings
          </Button>
        </div>
      </div>
    </div>
  );
}
