import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function Broken() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('shows a plain message instead of a blank page when a screen crashes', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: /something went wrong/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset sample data and reload' })).toBeInTheDocument();
    spy.mockRestore();
  });
});
