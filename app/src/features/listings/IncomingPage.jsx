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
import { box, cx, page, readable, row, stack, stackLg } from '../../shared/styles';
import { HabitatSummary } from '../habitat/HabitatSummary';

const linkBtn = 'text-sm text-primary underline underline-offset-3 hover:text-primary-hover hover:decoration-2';

/** Requests for my listings (S-06 inbox, S-07 decisions and handover). Requires login. */
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
        <PageHead title="Requests for my listings" />
        <Empty title="No one has asked to adopt yet.">
          <p className="text-ink-2 text-sm">
            When an adopter sends a request for one of your listings, it appears here.
          </p>
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
        You have accepted another request for this listing. Only one request can be accepted at a time.
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
          Yes, decline
        </Button>
        <button type="button" className={linkBtn} onClick={() => setConfirm(null)}>
          Cancel
        </button>
      </ConfirmInline>
    ) : (
      <section className="border-line grid gap-3 border-t pt-6">
        <h3>Your decision</h3>
        <p className="text-ink-2 text-sm">Accepting reserves the listing and takes it out of Browse listings.</p>
        <div className={cx(row, 'gap-5')}>
          <Button
            data-tour="accept"
            onClick={() =>
              run((d) => RequestService.accept(d, r.id, state.user), 'Request accepted. Your listing is now reserved.')
            }
          >
            Accept request
          </Button>
          <button
            type="button"
            className="text-md text-bad underline underline-offset-3 hover:decoration-2"
            onClick={() => setConfirm(r.id)}
          >
            Decline
          </button>
        </div>
      </section>
    );
  } else if (r.status === 'accepted') {
    actions = (
      <section className={cx(stack, 'border-line border-t pt-6')}>
        <h3>Handover</h3>
        <Tracker request={r} />
        {r.ownerConfirmed ? (
          <p className="text-sm">You have confirmed the handover. We are waiting for {adopter.short} to confirm.</p>
        ) : (
          <>
            <p className="text-sm">
              Once the {s.kind === 'plant' ? 'plants have' : 'animals have'} been handed over, confirm it here. You and
              the adopter both need to confirm.
            </p>
            <div>
              <Button
                onClick={() => run((d) => RequestService.confirmHandover(d, r.id, state.user), 'Handover confirmed')}
              >
                Confirm the handover happened
              </Button>
            </div>
          </>
        )}
        {!r.adopterConfirmed && (
          <DemoControl text="The adopter confirms on their own adoption requests page. Use this to play their side.">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                run((d) => RequestService.confirmHandover(d, r.id, r.adopter), 'The adopter confirmed the handover')
              }
            >
              Confirm as {adopter.short}
            </Button>
          </DemoControl>
        )}
      </section>
    );
  } else if (r.status === 'completed') {
    actions = (
      <section className={cx(stack, 'border-line border-t pt-6')}>
        <h3>Handover</h3>
        <Tracker request={r} />
        <Notice tone="ok" title="Rehoming complete" data-tour="complete">
          The listing is marked as rehomed and no longer appears in Browse listings.
        </Notice>
      </section>
    );
  } else actions = <p className="border-line text-ink-2 border-t pt-6 text-sm">You declined this request.</p>;

  return (
    <div className={page}>
      <PageHead title="Requests for my listings">
        Compare adopters by their introduction and their tank or pond. You only see the details you need to decide.
      </PageHead>
      <div className="grid grid-cols-[320px_minmax(0,1fr)] items-start gap-10 max-lg:grid-cols-1 max-lg:gap-6">
        <nav className="grid gap-6" aria-label="Requests" data-tour="request-list">
          {groups.map((g) => (
            <div key={g} className="grid gap-1">
              <h2 className="text-md pb-1">{byId(state.listings, g).title}</h2>
              <ul className="m-0 grid list-none gap-1 p-0">
                {all
                  .filter((x) => x.listingId === g)
                  .map((x) => (
                    <li key={x.id}>
                      <button
                        type="button"
                        aria-current={x.id === r.id}
                        onClick={() => {
                          setSel(x.id);
                          setConfirm(null);
                        }}
                        className="rounded-ab-sm hover:bg-mist aria-[current=true]:border-primary aria-[current=true]:bg-primary-soft grid w-full gap-1 border-l-4 border-transparent px-4 py-3 text-left"
                      >
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">{USERS[x.adopter].name}</span>
                          <Chip status={x.status} />
                        </span>
                        <span className="text-ink-2 text-sm">Sent {x.created}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
        <article className={cx(box, stackLg, 'max-sm:p-5')} aria-live="polite">
          <div className="grid gap-2">
            <h2>
              {adopter.name} would like your {s.common.toLowerCase()}
            </h2>
            <p className="text-ink-2 text-sm">
              For “{l.title}” · sent {r.created}
            </p>
            <div>
              <Chip status={r.status} />
            </div>
          </div>
          <section className="grid gap-2">
            <h3>Their introduction</h3>
            <p className={readable}>{r.intro}</p>
          </section>
          <section className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3>Their tank or pond</h3>
              <Chip status={r.compat} />
            </div>
            <HabitatSummary habitat={r.summary} />
            <p className="text-ink-2 text-sm">Their address and the name of their tank are not shared with you.</p>
          </section>
          {actions}
        </article>
      </div>
    </div>
  );
}
