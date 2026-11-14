import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useStore } from '../../services/store';
import { Aquarium } from '../../shared/components/Art';
import { Button } from '../../shared/components/Button';
import { Warning } from '../../shared/components/Feedback';
import { cx, wrap } from '../../shared/styles';
import { cardGrid, ListingCard } from '../listings/ListingCard';

/** Numbered step list, used on the How it works page and the demo flows page. items: [[title, text], …] */
export function Steps({ items }) {
  return (
    <ol className="m-0 grid list-none gap-0 p-0 [counter-reset:s]">
      {items.map(([t, p]) => (
        <li
          key={t}
          className="border-line before:text-primary relative grid grid-cols-[2.25rem_1fr] gap-3 border-t py-3 [counter-increment:s] before:pt-0.5 before:font-bold before:content-[counter(s)]"
        >
          <div>
            <p className="font-semibold">{t}</p>
            {p && <p className="text-ink-2 text-sm">{p}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Homepage (SH-04): search first, then real listings, then a short explanation of each journey. */
export function HomePage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const active = state.listings.filter((l) => l.status === 'active');
  const search = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/browse?q=${encodeURIComponent(q.trim())}` : '/browse');
  };

  return (
    <>
      <section className="border-line bg-mist border-b">
        <div
          className={cx(
            wrap,
            'grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-12 py-14 max-lg:grid-cols-1 max-lg:gap-6 max-lg:py-10',
          )}
        >
          <div className="grid gap-6">
            <h1 className="max-w-[18ch] text-3xl">Rehome or adopt aquarium and pond life</h1>
            <p className="text-ink-2 max-w-[52ch] text-lg">
              Free across the UK for fish, shrimp, snails and plants. Owners get guidance before they list, and adopters
              check their tank or pond is suitable before they ask.
            </p>
            <form role="search" onSubmit={search} className="grid max-w-xl gap-2" data-tour="hero-cta">
              <label htmlFor="home-q" className="font-semibold">
                Search listings by species or town
              </label>
              <div className="flex gap-2 max-sm:flex-col">
                <input
                  id="home-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="For example, tetra or Uxbridge"
                />
                <Button type="submit" className="flex-none">
                  Search
                </Button>
              </div>
            </form>
            <p className="text-md">
              Can’t keep yours any more?{' '}
              <Link to="/rehome" className="font-semibold" data-tour="start-rehoming">
                Start rehoming
              </Link>
            </p>
          </div>
          <Aquarium className="max-w-[500px] justify-self-end max-lg:max-w-[380px] max-lg:justify-self-start" />
        </div>
      </section>

      <section className={cx(wrap, 'py-14')}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-1">
            <h2>Recently listed</h2>
            <p className="text-ink-2">{active.length} animals and plants are looking for a home right now.</p>
          </div>
          <Link to="/browse" className="font-semibold">
            See all listings
          </Link>
        </div>
        <div className={cardGrid}>
          {active.slice(0, 4).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="border-line border-t">
        <div className={cx(wrap, 'grid grid-cols-2 gap-12 py-14 max-md:grid-cols-1 max-md:gap-10')}>
          <div className="grid content-start gap-3">
            <h2 className="text-xl">Rehoming yours</h2>
            <p className="max-w-[56ch]">
              Answer a few questions about what you have, its health and where you are. We tell you whether it can be
              listed, or what to do instead. If it can, your answers fill in the listing for you. You choose an adopter
              from the requests you get, and the listing closes once you have both confirmed the handover.
            </p>
            <p>
              <Link to="/rehome" className="font-semibold">
                Start rehoming
              </Link>
            </p>
          </div>
          <div className="grid content-start gap-3">
            <h2 className="text-xl">Adopting</h2>
            <p className="max-w-[56ch]">
              Browse without an account. Each listing shows the care it needs: temperature, pH and tank size. Save your
              tank or pond once and we compare it with any listing, explaining anything that does not match. If it is
              suitable, send the owner a short introduction and follow the request from your account.
            </p>
            <p>
              <Link to="/how-it-works" className="font-semibold">
                Read how it works
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className={cx(wrap, 'pb-16')} aria-label="Never release them">
        <div className="rounded-ab bg-mist grid gap-3 p-6 sm:p-8">
          <Warning>Never release aquarium or pond animals or plants into rivers, lakes or drains.</Warning>
          <p className="text-ink-2 max-w-[70ch] pl-11">
            Released pets and plants can spread disease and take over native habitats, and releasing some species is an
            offence. <Link to="/how-it-works#never-release">Find out what to do instead</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
