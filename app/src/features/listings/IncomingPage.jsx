import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { USERS } from '../../services/contracts';
import * as RequestService from '../../services/requestService';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { ConfirmInline, DemoControl, Empty, Notice, PageHead } from '../../shared/components/Feedback';
import { Tracker } from '../../shared/components/Tracker';
import { useUi } from '../../shared/hooks';
import { cx, label, mono, page, panel, row, stack, stackLg } from '../../shared/styles';
import { HabitatSummary } from '../habitat/HabitatSummary';

/** Incoming requests (S-06 inbox, S-07 decisions and handover). Requires login. */
export function IncomingPage() {
  const { state, run } = useStore();
  const [search] = useSearchParams();
  const ui = useUi();
  const all = RequestService.listForOwner(state, state.user).filter((r) => r.status !== 'withdrawn');
  const listingParam = search.get('listing');
  const [sel, setSel] = useState(
    () =>
      ui.sel ||
      (listingParam && all.find((r) => r.listingId === listingParam)?.id) ||
      all.find((r) => r.status === 'pending')?.id ||
      all[0]?.id,
  );
  const [confirm, setConfirm] = useState(null);

  if (!all.length)
    return (
      <div className={page}>
        <PageHead title="Incoming requests" />
        <Empty title="No requests yet.">
          <span className="text-sm">When an adopter sends a request for one of your listings, it appears here.</span>
        </Empty>
      </div>
    );

  const r = byId(state.requests, sel) || all[0];
  const l = byId(state.listings, r.listingId);
  const s = speciesFor(l);
  const adopter = USERS[r.adopter];
  const groups = [...new Set(all.map((x) => x.listingId))];
  const hasAccepted = state.requests.some((x) => x.listingId === l.id && x.status === 'accepted');

  let actions;
  if (r.status === 'pending') {
    actions = hasAccepted ? (
      <Notice tone="warn" title="On hold" data-tour="on-hold">
        You accepted another request for this listing. Only one request can be accepted.
      </Notice>
    ) : confirm === r.id ? (
      <ConfirmInline question={`Decline ${adopter.short}’s request?`}>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setConfirm(null);
            run((d) => RequestService.decline(d, r.id, state.user), 'Request declined');
          }}
        >
          Decline
        </Button>
        <Button variant="quiet" size="sm" onClick={() => setConfirm(null)}>
          Cancel
        </Button>
      </ConfirmInline>
    ) : (
      <div className="grid gap-4">
        <div className={row}>
          <Button
            data-tour="accept"
            onClick={() =>
              run((d) => RequestService.accept(d, r.id, state.user), 'Request accepted. The listing is now reserved.')
            }
          >
            Accept request
          </Button>
          <Button variant="danger" onClick={() => setConfirm(r.id)}>
            Decline
          </Button>
        </div>
        <p className="text-ink-2 text-sm">Accepting reserves the listing and hides it from browsing.</p>
      </div>
    );
  } else if (r.status === 'accepted') {
    actions = (
      <div className={stack}>
        <h3>Handover</h3>
        <Tracker request={r} />
        {r.ownerConfirmed ? (
          <p className="text-sm">You confirmed the handover. Waiting for {adopter.short} to confirm.</p>
        ) : (
          <>
            <p className="text-sm">
              Once the {s.kind === 'plant' ? 'plants have' : 'animals have'} been handed over, confirm it here. Both of
              you need to confirm.
            </p>
            <div>
              <Button
                onClick={() => run((d) => RequestService.confirmHandover(d, r.id, state.user), 'Handover confirmed')}
              >
                Confirm handover happened
              </Button>
            </div>
          </>
        )}
        {!r.adopterConfirmed && (
          <DemoControl text="The adopter confirms in their own My Requests page. Use this to play their side.">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                run((d) => RequestService.confirmHandover(d, r.id, r.adopter), 'Adopter confirmed the handover')
              }
            >
              Confirm as {adopter.short}
            </Button>
          </DemoControl>
        )}
      </div>
    );
  } else if (r.status === 'completed') {
    actions = (
      <div className={stack}>
        <h3>Handover</h3>
        <Tracker request={r} />
        <Notice tone="ok" title="Rehoming complete" data-tour="complete">
          The listing is marked rehomed and removed from browsing.
        </Notice>
      </div>
    );
  } else actions = <p className="text-ink-2 text-sm">You declined this request.</p>;

  return (
    <div className={page}>
      <PageHead title="Incoming requests">
        Compare adopters by their introduction and habitat. Only the details needed to decide are shared with you.
      </PageHead>
      <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-6 max-lg:grid-cols-1">
        <nav
          className="rounded-ab border-line bg-surface grid overflow-hidden border"
          aria-label="Requests"
          data-tour="request-list"
        >
          {groups.map((g, gi) => (
            <div key={g} className="contents">
              <div className={cx(label, 'bg-surface-2 px-4 py-2', gi > 0 && 'border-line border-t')}>
                {byId(state.listings, g).title}
              </div>
              {all
                .filter((x) => x.listingId === g)
                .map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    aria-current={x.id === r.id}
                    onClick={() => {
                      setSel(x.id);
                      setConfirm(null);
                    }}
                    className="border-line aria-[current=true]:bg-primary-soft grid gap-1 border-t px-4 py-3 text-left aria-[current=true]:shadow-[inset_3px_0_0_var(--color-primary)]"
                  >
                    <span className="flex flex-wrap items-center justify-between gap-3">
                      <strong>{USERS[x.adopter].short}</strong>
                      <Chip status={x.status} />
                    </span>
                    <span className="text-ink-2 text-sm">
                      {x.created} · <span className={mono}>{x.id}</span>
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </nav>
        <article className={cx(panel, stackLg)} aria-live="polite">
          <div className="grid gap-2">
            <div className={row}>
              <Chip status={r.status} />
              <span className={cx(mono, 'text-ink-2')}>
                {r.id} · {l.id}
              </span>
            </div>
            <h2>
              {adopter.name} would like your {s.common.toLowerCase()}
            </h2>
            <p className="text-ink-2 text-sm">
              For “{l.title}” · sent {r.created}
            </p>
          </div>
          <section className="grid gap-2">
            <h3>Their introduction</h3>
            <p className="max-w-[65ch]">{r.intro}</p>
          </section>
          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3>Habitat summary</h3>
              <Chip status={r.compat} />
            </div>
            <HabitatSummary habitat={r.summary} />
            <p className="text-ink-2 text-sm">
              Shared by the adopter’s habitat profile. Their address and profile name are not shown.
            </p>
          </section>
          {actions}
        </article>
      </div>
    </div>
  );
}
