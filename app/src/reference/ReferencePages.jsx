/** Team reference pages (prototype only): demo flows, screen map and design system. */
import { pathCard, Steps } from '../features/home/HomePage';
import { evaluateIntake } from '../features/guidance/rules';
import { RangeBar } from '../features/habitat/RangeBar';
import { ListingCard } from '../features/listings/ListingCard';
import { table, tableWrap } from '../features/listings/MyListingsPage';
import { ROUTES } from '../routes';
import { COMPAT_OUTCOME, GUIDANCE_OUTCOME, LISTING_STATUS, REQUEST_STATUS } from '../services/contracts';
import { byId } from '../services/seed';
import { SPECIES } from '../services/species';
import { useStore } from '../services/store';
import { Button } from '../shared/components/Button';
import { Chip } from '../shared/components/Chip';
import { PageHead } from '../shared/components/Feedback';
import { Field } from '../shared/components/Form';
import { Params } from '../shared/components/Plate';
import { Tracker } from '../shared/components/Tracker';
import { useGo } from '../shared/hooks';
import { cx, formGrid, label, mono, page, reasonsOl, row, stack, stackLg } from '../shared/styles';
import { FLOWS } from './flows';
import { useTour } from './tour';

export function DemosPage() {
  const { start } = useTour();
  return (
    <div className={page}>
      <PageHead eyebrow="Team walkthrough" title="Demo flows">
        Three guided walkthroughs that cover both journeys from start to finish. Each one starts from fresh sample data.
        A guide panel says what the user does, what happens in the system and who builds it. Press Next and the
        prototype does the action for you.
      </PageHead>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6">
        {Object.entries(FLOWS).map(([k, f]) => (
          <article key={k} className={pathCard}>
            <div className="grid gap-1.5">
              <p className={label}>{f.label}</p>
              <h2 className="text-xl">{f.title}</h2>
              <p className="text-ink-2">{f.summary}</p>
            </div>
            <Button onClick={() => start(k)}>Start this demo</Button>
            <Steps items={f.steps.map((s) => [s.title, s.actor])} />
            <p className={cx(mono, 'text-ink-2 text-sm')}>{f.covers}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const Spec = ({ name, children }) => (
  <div className="border-line grid grid-cols-[160px_minmax(0,1fr)] items-baseline gap-4 border-t py-4 max-sm:grid-cols-1 max-sm:gap-2">
    <span className={label}>{name}</span>
    {children}
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
  const rows = Object.entries(ROUTES).filter(([k]) => !['map', 'design'].includes(k));
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
      <PageHead eyebrow="Team reference" title="Screen map">
        Every screen in this prototype, who builds it, and the Sprint 1 tasks and backlog stories it covers. Use Open to
        jump straight to a screen with sample data.
      </PageHead>
      <div className={tableWrap}>
        <table className={table}>
          <thead>
            <tr>
              <th>Screen</th>
              <th>Owner</th>
              <th>Sprint 1 tasks</th>
              <th>Stories</th>
              <th>Login</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, r]) => (
              <tr key={k}>
                <td className="font-bold">{r.title}</td>
                <td>{r.owner}</td>
                <td className="font-mono">{r.tasks}</td>
                <td className="font-mono">{r.stories}</td>
                <td>{r.auth ? 'Required' : 'No'}</td>
                <td className="text-right whitespace-nowrap">
                  <Button variant="quiet" size="sm" onClick={() => open(k)}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-12 pt-12 max-md:grid-cols-1 max-md:gap-8">
        <div className={stack}>
          <h2>Owner demo script</h2>
          <ol className={reasonsOl}>
            <li>Homepage → Rehome an animal or plant.</li>
            <li>Choose Animal → Neon tetra, quantity 6 → Healthy, Moving home → any town, Within a month.</li>
            <li>Review → See my guidance → Create my listing.</li>
            <li>Log in (sample user). The editor opens pre-filled. Add a description and publish.</li>
            <li>My Listings shows it as active; Browse shows it too.</li>
            <li>
              Incoming requests → accept Priya’s goldfish request → confirm handover → play the adopter’s confirmation.
            </li>
          </ol>
        </div>
        <div className={stack}>
          <h2>Adopter demo script</h2>
          <ol className={reasonsOl}>
            <li>Browse → “School of eight neon tetras” → Check compatibility.</li>
            <li>Log in. Living room tank gives a potential match.</li>
            <li>
              Switch to Bedroom nano tank for a missing-information result; open “Pink hardy water lily” for a blocking
              mismatch.
            </li>
            <li>Back on a match, Request adoption → write an introduction → Send.</li>
            <li>
              My Requests shows it pending. The Cherry shrimp request is accepted: confirm you received them to complete
              it.
            </li>
          </ol>
        </div>
      </div>
      <section className={cx(stack, 'mt-12')}>
        <h2>Shared contract values</h2>
        <Spec name="Listing status">{chips(LISTING_STATUS)}</Spec>
        <Spec name="Request status">{chips(REQUEST_STATUS)}</Spec>
        <Spec name="Compatibility">{chips(COMPAT_OUTCOME)}</Spec>
        <Spec name="Guidance outcome">{chips(GUIDANCE_OUTCOME)}</Spec>
        <Spec name="ID prefixes">
          <div className={cx(row, 'font-mono')}>
            {['SP-### species', 'IC-### intake', 'L-#### listing', 'H-### habitat', 'R-### request', 'U-## user'].map(
              (t) => (
                <span key={t}>{t}</span>
              ),
            )}
          </div>
        </Spec>
      </section>
    </div>
  );
}

const PALETTE = [
  ['ink', 'Deep Ocean', '#12324A', 'Headings, body text, the SDG band'],
  ['primary', 'Ocean Teal', '#0B7A6E', 'Primary buttons, links, selected states'],
  ['primary-soft', 'Seafoam Tint', '#DDF3EC', 'Selected options, info panels, hero action panel'],
  ['weed', 'Seafoam', '#5CC4A6', 'Small highlights only: logo wave, hero marker'],
  ['mist', 'Coastal Mist', '#F4F8F7', 'Page background'],
  ['surface', 'White', '#FFFFFF', 'Cards, forms and panels'],
  ['line', 'Shoreline', '#D3E3DE', 'Borders and dividers'],
  ['ink-2', 'Tide Grey', '#4E6677', 'Secondary text, hints, captions'],
  ['ok', 'Match', '#1F7A4D', 'active, completed, potential_match'],
  ['warn', 'Caution', '#965A00', 'pending, reserved, needs_information'],
  ['bad', 'Stop', '#B4352C', 'declined, blocked, restricted, errors'],
  ['plate-trop', 'Plate: tropical', '#D6EFE9', 'Specimen plate for tropical animals'],
];

const RULES = [
  [
    'No stock photos or AI fish art',
    'Listings use a specimen plate: scientific name on a habitat-coloured panel. Real uploads come later.',
  ],
  ['No gradients or glow', 'Flat colour, one border style, 6px corners. Shadows only on floating toasts.'],
  ['No emoji as icons', 'Use the two line glyphs (fish, leaf) and text labels.'],
  ['Status needs words', 'Every colour state also has a text label, so it works for colour-blind users.'],
  ['Numbers mean something', 'Show real units (°C, pH, litres, cm) in the mono face. No vanity stats.'],
  ['Plain copy', 'Buttons say what happens: “Publish listing”, then a message saying “Published”.'],
  ['Left-aligned, not centred', 'Content reads from the left. Only empty states are centred.'],
  ['Keyboard and mobile first', 'Visible focus ring, 44px touch targets, one column under 900px.'],
];

export function DesignPage() {
  const { state } = useStore();
  const sample = byId(state.listings, 'L-1045');
  return (
    <div className={page}>
      <PageHead eyebrow="Proposed by Shawn · for team agreement" title="Coastal Trust design system">
        One set of colours, type and components for every screen. Build with these tokens so the three feature areas
        feel like one product.
      </PageHead>
      <section className={stackLg}>
        <div className={stack}>
          <h2>Colour</h2>
          <p className="text-ink-2 max-w-[65ch]">
            A light, calm palette. Deep ocean navy for text, ocean teal for actions, seafoam tints for selected and
            supporting panels, and a coastal mist background. Light theme only. Status colours are separate from the
            brand colour and always come with a text label.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {PALETTE.map(([t, n, hex, use]) => (
              <div key={t} className="rounded-ab border-line bg-surface overflow-hidden border">
                <div className="border-line h-[84px] border-b" style={{ background: `var(--color-${t})` }} />
                <div className="grid gap-0.5 p-3 text-sm">
                  <strong>{n}</strong>
                  <span className={cx(mono, 'text-ink-2')}>
                    {hex} · {t}
                  </span>
                  <span className="text-ink-2 text-sm">{use}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={stack}>
          <h2>Type</h2>
          <Spec name="Display · Familjen Grotesk">
            <span className="font-display text-2xl font-bold tracking-[-.01em]">Find the right water</span>
          </Spec>
          <Spec name="Body · Atkinson Hyperlegible">
            <p className="max-w-[60ch]">
              Designed by the Braille Institute for low-vision readers. Clear letter shapes support our accessibility
              story (CORE-002) and read well in long forms.
            </p>
          </Spec>
          <Spec name="Data · IBM Plex Mono">
            <span className={mono}>L-1045 · 20–26 °C · pH 6.0–7.0 · ≥ 54 L</span>
          </Spec>
          <Spec name="Scale">
            <span className={mono}>13 · 15 · 16 · 20 · 26 · 34 · 52 px</span>
          </Spec>
        </div>
        <div className={stack}>
          <h2>Components</h2>
          <Spec name="Buttons">
            <div className={row}>
              <Button>Publish listing</Button>
              <Button variant="secondary">Save as draft</Button>
              <Button variant="quiet">Change</Button>
              <Button variant="danger">Decline</Button>
              <Button disabled>Request adoption</Button>
            </div>
          </Spec>
          <Spec name="Status chips">
            {chips([
              ...LISTING_STATUS,
              ...REQUEST_STATUS.filter((x) => !LISTING_STATUS.includes(x)),
              ...COMPAT_OUTCOME,
            ])}
          </Spec>
          <Spec name="Fields">
            <div className={cx(formGrid, 'max-w-[640px]')}>
              <Field id="dsa" label="Location" required hint="Town and postcode district">
                <input id="dsa" type="text" defaultValue="Uxbridge, UB8" />
              </Field>
              <Field id="dsb" label="Quantity" required error="Enter 1 or more.">
                <input id="dsb" type="number" defaultValue="0" />
              </Field>
            </div>
          </Spec>
          <Spec name="Parameter strip">
            <Params species={SPECIES['SP-002']} />
          </Spec>
          <Spec name="Range bar">
            <div className="max-w-[420px]">
              <RangeBar bar={{ lo: 0, hi: 32, min: 20, max: 26, a: 24, b: 26, ok: true, unit: '°C' }} />
              <RangeBar bar={{ lo: 0, hi: 32, min: 10, max: 24, a: 24, b: 26, ok: false, unit: '°C' }} />
            </div>
          </Spec>
          <Spec name="Handover tracker">
            <Tracker request={{ status: 'accepted', ownerConfirmed: true, adopterConfirmed: false }} />
          </Spec>
          {sample && (
            <Spec name="Listing card">
              <div className="max-w-[320px]">
                <ListingCard listing={sample} />
              </div>
            </Spec>
          )}
        </div>
        <div className={stack}>
          <h2>Rules we follow</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {RULES.map(([b, t]) => (
              <div key={b} className="rounded-ab border-line bg-surface grid gap-1 border p-4 text-sm">
                <b className="font-display text-md">{b}</b>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
