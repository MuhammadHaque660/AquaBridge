/**
 * Automated accessibility checks (axe-core) on every product screen, signed out and signed in.
 * jsdom cannot measure colour contrast, so that rule is checked separately in design review.
 */
import { render, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { TourProvider } from './reference/tour';
import { ME } from './services/contracts';
import { seed } from './services/seed';
import { StoreProvider } from './services/store';

const PAGES = [
  ['/', false],
  ['/browse', false],
  ['/listings/L-1045', false],
  ['/rehome', false],
  ['/rehome/review', false],
  ['/rehome/guidance', false],
  ['/signin', false],
  ['/how-it-works', false],
  ['/species', false],
  ['/species/SP-008', false],
  ['/species/SP-002', false],
  ['/accessibility', false],
  ['/listings/new', true],
  ['/account/listings', true],
  ['/account/incoming', true],
  ['/account/habitat', true],
  ['/account/habitat/new', true],
  ['/check/L-1045', true],
  ['/request/L-1045/H-201', true],
  ['/account/requests/sent/R-510', true],
  ['/account/requests', true],
  ['/team', false],
  ['/team/screens', false],
  ['/team/screens/compat', false],
  ['/team/design', false],
  ['/team/demos', false],
];

async function violations(path, signedIn) {
  const state = seed();
  if (signedIn) state.user = ME;
  const { container, unmount } = render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider initial={state}>
        <TourProvider>
          <App />
        </TourProvider>
      </StoreProvider>
    </MemoryRouter>,
  );
  await waitFor(() => expect(container.querySelector('main h1')).toBeTruthy(), { timeout: 3000 });
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  unmount();
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.html.slice(0, 120)}`);
}

describe('accessibility (axe-core)', () => {
  it.each(PAGES)('%s has no violations', async (path, signedIn) => {
    expect(await violations(path, signedIn)).toEqual([]);
  });
});
