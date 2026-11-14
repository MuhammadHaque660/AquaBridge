import { Link } from 'react-router';
import { useStore } from '../../services/store';
import { Aquarium } from '../../shared/components/Art';
import { Button } from '../../shared/components/Button';
import { cx, label, wrap } from '../../shared/styles';
import { cardGrid, ListingCard } from '../listings/ListingCard';

const OWNER_STEPS = [
  ['Answer a few questions', 'Species, quantity, condition, location and how soon.'],
  ['Read your guidance', 'We explain whether a listing is suitable, or what to do instead.'],
  ['Publish your listing', 'Your answers fill it in, so you only add a description.'],
  ['Choose an adopter', 'Every request shows a summary of the adopter’s setup.'],
  ['Confirm the handover', 'The listing closes when you and the adopter both confirm.'],
];
const ADOPTER_STEPS = [
  ['Browse listings', 'No account needed to look around.'],
  ['Read the care needs', 'Temperature, pH, tank size and habitat for each species.'],
  ['Save your tank or pond', 'Enter it once and reuse it for every listing.'],
  ['Check compatibility', 'See what matches and what needs attention.'],
  ['Send a request', 'Introduce yourself, then follow its progress.'],
];

/** Numbered step list used on the homepage and the demo flows page. items: [[title, text], …] */
export function Steps({ items }) {
  return (
    <ol className="steps">
      {items.map(([t, p]) => (
        <li key={t}>
          <div>
            <b className="font-display font-semibold">{t}</b>
            <p className="text-ink-2 text-sm">{p}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const pathCard = 'grid content-start gap-4 rounded-ab border border-line bg-surface p-6';

/** Homepage (SH-04). */
export function HomePage() {
  const { state } = useStore();
  const active = state.listings.filter((l) => l.status === 'active');
  return (
    <>
      <section className="border-line bg-surface border-b">
        <div
          className={cx(
            wrap,
            'grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-8 pt-8 pb-12 max-lg:grid-cols-1 max-lg:gap-4 max-lg:pt-4 max-lg:pb-8',
          )}
        >
          <div>
            <p className={label}>Free aquatic rehoming across the UK</p>
            <h1 className="mt-3 max-w-[15ch] text-3xl leading-[1.06] tracking-[-0.025em]">
              A good new home for every <em className="text-primary not-italic">fish, shrimp and plant</em>.
            </h1>
            <p className="text-ink-2 mt-4 max-w-[44ch] text-[1.1875rem] leading-[1.6]">
              Can’t look after them any more? We’ll guide you through rehoming responsibly. Want to adopt? Check your
              tank or pond is right before you ask.
            </p>
            <div className="mt-6 flex flex-wrap gap-3" data-tour="hero-cta">
              <Button to="/rehome" size="lg">
                Rehome an animal or plant
              </Button>
              <Button to="/browse" variant="secondary" size="lg">
                Browse {active.length} listings
              </Button>
            </div>
            <ul className="text-ink-2 mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {['Free for owners and adopters', 'No account needed to look around', 'Animals and plants'].map((t) => (
                <li
                  key={t}
                  className="before:bg-weed flex items-center gap-2 before:size-2 before:flex-none before:rounded-full before:content-['']"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Aquarium className="max-w-[580px] justify-self-end max-lg:max-w-[460px] max-lg:justify-self-center" />
        </div>
      </section>

      <section className={cx(wrap, 'py-12')} id="how">
        <div className="mb-8 grid gap-2">
          <p className={label}>How it works</p>
          <h2 tabIndex={-1}>Two ways to use AquaBridge</h2>
          <p className="text-ink-2 max-w-[62ch]">One account does both. Pick the side you’re on today.</p>
        </div>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <div className={pathCard}>
            <div className="grid gap-1.5">
              <p className={label}>I need to rehome</p>
              <h3>From first questions to a confirmed handover</h3>
            </div>
            <Steps items={OWNER_STEPS} />
            <Button to="/rehome" className="justify-self-start">
              Start rehoming
            </Button>
          </div>
          <div className={pathCard}>
            <div className="grid gap-1.5">
              <p className={label}>I want to adopt</p>
              <h3>Check your setup before you ask</h3>
            </div>
            <Steps items={ADOPTER_STEPS} />
            <Button to="/browse" variant="secondary" className="justify-self-start">
              Browse listings
            </Button>
          </div>
        </div>
      </section>

      <section className={cx(wrap, 'pb-12')}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2>Recently listed</h2>
          <Link to="/browse">See all {active.length} listings →</Link>
        </div>
        <div className={cardGrid}>
          {active.slice(0, 3).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="bg-ink text-white" aria-label="Why it matters">
        <div
          className={cx(
            wrap,
            'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 py-6 max-md:grid-cols-1 max-md:gap-3',
          )}
        >
          <span className="rounded-ab-sm justify-self-start border border-current px-2 py-1 font-mono text-xs tracking-[.1em] whitespace-nowrap uppercase">
            SDG 14 · Life below water
          </span>
          <p className="max-w-[70ch]">
            Released pets and plants can carry disease and spread through rivers and ponds. Rehoming through AquaBridge
            keeps them out of the wild.
          </p>
          <Button to="/rehome" variant="onDark" size="sm" className="justify-self-start">
            Start rehoming
          </Button>
        </div>
      </section>
    </>
  );
}
