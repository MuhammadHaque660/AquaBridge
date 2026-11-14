/** Team reference pages (prototype only): demo flows, screen map and design system. */
import { pathCard, Steps } from '../features/home/HomePage';
import { evaluateIntake } from '../features/guidance/rules';
import { RangeBar } from '../features/habitat/RangeBar';
import { ListingCard } from '../features/listings/ListingCard';
import { table, tableWrap } from '../features/listings/MyListingsPage';
import { ROUTES } from '../routes';
import { COMPAT_OUTCOME, GUIDANCE_OUTCOME, LISTING_STATUS, REQUEST_STATUS } from '../services/contracts';
import { byId } from '../services/seed';
import { useStore } from '../services/store';
import { Button } from '../shared/components/Button';
import { Chip } from '../shared/components/Chip';
import { Notice, PageHead, Warning } from '../shared/components/Feedback';
import { ErrorSummary, Field } from '../shared/components/Form';
import { SpeciesArt } from '../shared/components/SpeciesArt';
import { Tracker } from '../shared/components/Tracker';
import { useGo } from '../shared/hooks';
import { cx, formGrid, page, reasonsOl, row, stack, stackLg } from '../shared/styles';
import { FLOWS } from './flows';
import { useTour } from './tour';

export function DemosPage() {
  const { start } = useTour();
  return (
    <div className={page}>
      <PageHead caption="Team tools" title="Demo flows">
        Three guided walkthroughs covering both journeys from start to finish. Each starts from fresh sample data. A
        guide explains what the person does, what the system does and who builds it. Press Next step and the prototype
        does the action for you.
      </PageHead>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6">
        {Object.entries(FLOWS).map(([k, f]) => (
          <article key={k} className={pathCard}>
            <div className="grid gap-1">
              <p className="text-ink-2 text-sm font-semibold">{f.label}</p>
              <h2 className="text-xl">{f.title}</h2>
              <p className="text-ink-2">{f.summary}</p>
            </div>
            <Button onClick={() => start(k)} className="justify-self-start">
              Start this demo
            </Button>
            <Steps items={f.steps.map((s) => [s.title, s.actor])} />
            <p className="text-ink-2 text-sm">Covers: {f.covers}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const Spec = ({ name, children }) => (
  <div className="border-line grid grid-cols-[180px_minmax(0,1fr)] items-start gap-6 border-t py-5 max-sm:grid-cols-1 max-sm:gap-2">
    <span className="font-semibold">{name}</span>
    <div>{children}</div>
  </div>
);

const chips = (list) => (
  <div className={row}>
    {list.map((s) => (
      <Chip key={s} status={s} />
    ))}
  </div>
);

export function MapPage() {
  const { update } = useStore();
  const go = useGo();
  const rows = Object.entries(ROUTES).filter(([k]) => !['map', 'design', 'sent'].includes(k));
  const open = (k) => {
    const needs = {
      listing: { id: 'L-1045' },
      compat: { id: 'L-1045' },
      request: { id: 'L-1045', hab: 'H-201' },
      editor: { id: 'L-1048' },
    };
    if (['review', 'guidance'].includes(k))
      update((s) => {
        if (s.intake.answers.speciesId) return;
        s.intake.answers = {
          kind: 'animal',
          speciesId: 'SP-002',
          quantity: '6',
          condition: 'healthy',
          reason: 'moving',
          location: 'Uxbridge, UB8',
          urgency: 'month',
        };
        s.intake.outcome = evaluateIntake(s.intake.answers);
      });
    go(k, needs[k] || {});
  };
  return (
    <div className={page}>
      <PageHead caption="Team tools" title="Screen map">
        Every screen in the prototype, who builds it, and the Sprint 1 tasks and backlog stories it covers. Open jumps
        straight to a screen with sample data.
      </PageHead>
      <div className={tableWrap}>
        <table className={table}>
          <thead>
            <tr>
              <th>Screen</th>
              <th>Built by</th>
              <th>Sprint 1 tasks</th>
              <th>Stories</th>
              <th>Sign-in</th>
              <th>
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, r]) => (
              <tr key={k}>
                <td className="font-semibold">{r.title}</td>
                <td>{r.owner}</td>
                <td>{r.tasks}</td>
                <td>{r.stories}</td>
                <td>{r.auth ? 'Required' : 'No'}</td>
                <td className="text-right whitespace-nowrap">
                  <Button variant="quiet" size="sm" onClick={() => open(k)}>
                    Open<span className="sr-only"> {r.title}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-12 pt-14 max-md:grid-cols-1 max-md:gap-10">
        <div className={stack}>
          <h2>Owner demo script</h2>
          <ol className={reasonsOl}>
            <li>Homepage → Start rehoming.</li>
            <li>Animal → Neon tetra, 6 → Healthy, Moving home → any town, Within a month.</li>
            <li>Check your answers → Get my guidance → Create my listing.</li>
            <li>Sign in as the sample user. The editor opens filled in. Add a description and publish.</li>
            <li>My listings shows it as live, and Browse listings shows it too.</li>
            <li>
              Requests for my listings → accept Priya’s goldfish request → confirm the handover → play the adopter’s
              confirmation.
            </li>
          </ol>
        </div>
        <div className={stack}>
          <h2>Adopter demo script</h2>
          <ol className={reasonsOl}>
            <li>Browse listings → “School of eight neon tetras” → Check compatibility.</li>
            <li>Sign in. The living room tank is a potential match.</li>
            <li>
              Switch to the bedroom nano tank to see “needs information”; open the pink water lily to see “not
              compatible”.
            </li>
            <li>Back on a match, Request to adopt → write an introduction → Send.</li>
            <li>The confirmation page gives a reference. My adoption requests shows it waiting for the owner.</li>
          </ol>
        </div>
      </div>
      <section className={cx(stack, 'mt-14')}>
        <h2>Shared status values</h2>
        <p className="text-ink-2 max-w-[66ch]">
          The code uses the contract values on the left of each tag’s name; people see the wording on the tag.
        </p>
        <Spec name="Listing status">{chips(LISTING_STATUS)}</Spec>
        <Spec name="Request status">{chips(REQUEST_STATUS)}</Spec>
        <Spec name="Compatibility">{chips(COMPAT_OUTCOME)}</Spec>
        <Spec name="Guidance outcome">{chips(GUIDANCE_OUTCOME)}</Spec>
        <Spec name="ID prefixes (code only)">
          <p>
            SP-### species · IC-### intake · L-#### listing · H-### habitat · R-### request · U-## user. Only the
            request reference is ever shown to people, on the confirmation page.
          </p>
        </Spec>
      </section>
    </div>
  );
}

const PALETTE = [
  ['ink', 'Ink', '#13293D', 'Headings and body text'],
  ['ink-2', 'Secondary text', '#4B5F6B', 'Hints, captions, metadata'],
  ['primary', 'Teal', '#0A6B60', 'The one accent: primary buttons and links'],
  ['primary-soft', 'Teal tint', '#E3F1EE', 'Selected rows, information insets'],
  ['surface', 'White', '#FFFFFF', 'Page background'],
  ['mist', 'Mist', '#F5F7F7', 'Section backgrounds and quiet panels'],
  ['line', 'Line', '#D4DCDC', 'Dividers and table rules'],
  ['line-strong', 'Field border', '#8A9A9E', 'Form fields (3:1 contrast)'],
  ['ok', 'Success', '#1D6E46', 'Live, completed, potential match'],
  ['warn', 'Caution', '#8A5300', 'Waiting, reserved, needs information'],
  ['bad', 'Error', '#B02A22', 'Errors, declined, not compatible, restricted'],
];

const RULES = [
  [
    'One typeface',
    'Atkinson Hyperlegible Next for everything. Hierarchy comes from size and weight, not from mixing fonts or uppercase labels.',
  ],
  [
    'Headings do the work',
    'No small uppercase labels above headings. Use a caption only to show position, such as “Step 2 of 4”.',
  ],
  [
    'People’s words',
    'Say “tank”, “request to adopt” and “waiting for owner”. Never show record IDs, except a reference on a confirmation page.',
  ],
  [
    'Borders only where they separate',
    'Form fields and tables have borders. Content is grouped with space and quiet tints, not boxes inside boxes.',
  ],
  ['One primary action', 'Each screen has one green button. Other actions are grey buttons or text links.'],
  [
    'Errors that help',
    'An error summary at the top, and a message by the field that says how to fix it. Never clear what someone typed.',
  ],
  ['Status needs words', 'Tags always carry text, so colour is never the only signal.'],
  ['Keyboard and mobile first', 'Dark focus outline, 44px touch targets, one column under 900px.'],
];

export function DesignPage() {
  const { state } = useStore();
  const sample = byId(state.listings, 'L-1045');
  return (
    <div className={page}>
      <PageHead caption="Team tools" title="Design system">
        The colours, type and components every screen uses, so the three feature areas feel like one service. The tokens
        live in app/src/index.css and the components in app/src/shared.
      </PageHead>
      <section className={stackLg}>
        <div className={stack}>
          <h2>Colour</h2>
          <p className="text-ink-2 max-w-[66ch]">
            A calm, light palette with one accent. Teal is reserved for actions and links; status colours are separate
            and always come with words.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
            {PALETTE.map(([t, n, hex, use]) => (
              <div key={t} className="grid gap-2">
                <div className="rounded-ab border-line h-16 border" style={{ background: `var(--color-${t})` }} />
                <div className="text-sm">
                  <p className="font-semibold">{n}</p>
                  <p className="text-ink-2">
                    {hex} · {t}
                  </p>
                  <p className="text-ink-2">{use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={stack}>
          <h2>Type</h2>
          <Spec name="Typeface">
            <p>
              <strong>Atkinson Hyperlegible Next</strong>, designed by the Braille Institute for readers with low
              vision. One family, weights 400 to 700.
            </p>
          </Spec>
          <Spec name="Headings">
            <div className="grid gap-2">
              <p className="text-3xl leading-tight font-bold">Page title 48</p>
              <p className="text-2xl font-bold">Heading 36</p>
              <p className="text-xl font-bold">Heading 28</p>
              <p className="text-lg font-semibold">Heading 22</p>
            </div>
          </Spec>
          <Spec name="Body">
            <p className="max-w-[60ch]">
              Body text is 17px with a 1.5 line height and lines of about 66 characters. Secondary text is 16px,
              captions 14px.
            </p>
          </Spec>
        </div>
        <div className={stack}>
          <h2>Components</h2>
          <Spec name="Buttons">
            <div className={row}>
              <Button>Publish listing</Button>
              <Button variant="secondary">Save as draft</Button>
              <Button variant="quiet">Change</Button>
              <Button variant="danger">Decline request</Button>
              <Button disabled>Request to adopt</Button>
            </div>
          </Spec>
          <Spec name="Status tags">
            {chips([
              ...LISTING_STATUS,
              ...REQUEST_STATUS.filter((x) => !LISTING_STATUS.includes(x)),
              ...COMPAT_OUTCOME,
            ])}
          </Spec>
          <Spec name="Form fields">
            <div className={cx(formGrid, 'max-w-[640px]')}>
              <Field id="dsa" label="Town and postcode district" hint="For example, Ealing, W5">
                <input id="dsa" type="text" defaultValue="Uxbridge, UB8" />
              </Field>
              <Field id="dsb" label="How many?" error="Enter a number of 1 or more">
                <input id="dsb" type="number" defaultValue="0" />
              </Field>
            </div>
          </Spec>
          <Spec name="Error summary">
            <div className="max-w-[560px]">
              <ErrorSummary errors={{ dsb: 'Enter a number of 1 or more' }} />
            </div>
          </Spec>
          <Spec name="Notices">
            <div className="grid max-w-[560px] gap-4">
              <Notice tone="pri" title="You’ll go back to: Listing editor">
                Your answers are saved and will fill in the listing.
              </Notice>
              <Warning>Never release aquarium or pond animals or plants.</Warning>
            </div>
          </Spec>
          <Spec name="Range bar">
            <div className="max-w-[420px]">
              <RangeBar bar={{ lo: 0, hi: 32, min: 20, max: 26, a: 24, b: 26, ok: true, unit: '°C' }} />
              <RangeBar bar={{ lo: 0, hi: 32, min: 10, max: 24, a: 24, b: 26, ok: false, unit: '°C' }} />
            </div>
          </Spec>
          <Spec name="Handover progress">
            <div className="max-w-[360px]">
              <Tracker request={{ status: 'accepted', ownerConfirmed: true, adopterConfirmed: false }} />
            </div>
          </Spec>
          <Spec name="Species illustrations">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
              {['SP-001', 'SP-002', 'SP-003', 'SP-004', 'SP-005', 'SP-006', 'SP-007', 'SP-008'].map((id) => (
                <div key={id} className="rounded-ab aspect-[16/10] overflow-hidden">
                  <SpeciesArt speciesId={id} pond={id === 'SP-007'} />
                </div>
              ))}
            </div>
          </Spec>
          {sample && (
            <Spec name="Listing card">
              <div className="max-w-[300px]">
                <ListingCard listing={sample} />
              </div>
            </Spec>
          )}
        </div>
        <div className={stack}>
          <h2>Rules we follow</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-8 gap-y-6">
            {RULES.map(([b, t]) => (
              <div key={b} className="border-primary grid gap-1 border-t-4 pt-3">
                <p className="font-semibold">{b}</p>
                <p className="text-ink-2 text-sm">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
