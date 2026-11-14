import { Component } from 'react';
import { cx, page } from './styles';

/**
 * Catches a crash on one screen and shows a plain message instead of a blank page.
 * Keyed by location in App, so moving to another page clears it.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // In the real service this is where the error would be reported.
    console.error('Screen crashed', error, info.componentStack);
  }

  reset = () => {
    try {
      localStorage.removeItem('aquabridge-app');
    } catch {
      /* storage unavailable */
    }
    window.location.assign(import.meta.env.BASE_URL);
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className={cx(page, 'grid max-w-[66ch] gap-4')}>
        <h1>Sorry, something went wrong on this page</h1>
        <p>Try going back to the homepage. If it keeps happening, resetting the sample data usually fixes it.</p>
        <div className="flex flex-wrap gap-4">
          <a
            href={import.meta.env.BASE_URL}
            className="rounded-ab-sm bg-primary hover:bg-primary-hover inline-flex min-h-11 items-center px-5 font-semibold text-white no-underline shadow-[0_2px_0_var(--color-primary-hover)] hover:text-white"
          >
            Go to the homepage
          </a>
          <button type="button" onClick={this.reset} className="text-primary underline underline-offset-3">
            Reset sample data and reload
          </button>
        </div>
      </div>
    );
  }
}
