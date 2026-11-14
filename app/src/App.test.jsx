import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { TourProvider } from './reference/tour';
import { seed } from './services/seed';
import { StoreProvider } from './services/store';

const renderAt = (path, state = seed()) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider initial={state}>
        <TourProvider>
          <App />
        </TourProvider>
      </StoreProvider>
    </MemoryRouter>,
  );

describe('App', () => {
  it('browse shows only active listings and filters them', async () => {
    renderAt('/browse');
    expect(screen.getByText('6 listings')).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('radio', { name: /^Plants/ })[0]);
    expect(screen.getByText('3 of 6 listings')).toBeInTheDocument();
  });

  it('guarded pages send signed-out users to login, then back', async () => {
    renderAt('/account/requests');
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('You’ll go back to: My adoption requests')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sign in as the sample user' }));
    expect(await screen.findByRole('heading', { name: 'My adoption requests' })).toBeInTheDocument();
  });
});
