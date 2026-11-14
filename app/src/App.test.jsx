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
    expect(screen.getByText('6 of 6 listings')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Plants' }));
    expect(screen.getByText('3 of 6 listings')).toBeInTheDocument();
  });

  it('guarded pages send signed-out users to login, then back', async () => {
    renderAt('/account/requests');
    expect(await screen.findByRole('heading', { name: 'Log in to continue' })).toBeInTheDocument();
    expect(screen.getByText('You’ll go back to: My Requests')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Log in as sample user' }));
    expect(await screen.findByRole('heading', { name: 'My Requests' })).toBeInTheDocument();
  });
});
