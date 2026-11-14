import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ME } from '../../services/contracts';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Notice } from '../../shared/components/Feedback';
import { Field } from '../../shared/components/Form';
import { cx, page } from '../../shared/styles';

/**
 * Sign in checkpoint (SH-05). Mock authentication: any submit signs in the sample user and returns to the saved action.
 * The university-provided login component replaces this form.
 */
export function SignInPage() {
  const { state, update, toast } = useStore();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [tab, setTab] = useState(search.get('tab') === 'register' ? 'register' : 'login');
  const p = state.pending;
  const login = tab === 'login';

  const submit = (e) => {
    e.preventDefault();
    update((s) => {
      s.user = ME;
      s.pending = null;
    });
    toast('Signed in as Jordan Lee (sample user)');
    navigate(p?.to || '/account/listings');
  };
  const switchTo = (t) => (e) => {
    e.preventDefault();
    setTab(t);
  };

  return (
    <div className={cx(page, 'max-w-[600px]')}>
      <div className="mb-8 grid gap-4">
        <h1>{login ? 'Sign in' : 'Create an account'}</h1>
        {p ? (
          <Notice tone="pri" title={`You’ll go back to: ${p.label}`} data-tour="return-notice">
            {p.name === 'editor'
              ? 'Your rehoming answers are saved and will fill in the listing.'
              : 'Anything you entered is kept.'}
          </Notice>
        ) : (
          <p className="text-md text-ink-2">One account lets you rehome and adopt.</p>
        )}
      </div>
      <form className="grid gap-6" noValidate onSubmit={submit}>
        {!login && (
          <Field id="name" label="Full name">
            <input type="text" id="name" defaultValue="Jordan Lee" autoComplete="off" />
          </Field>
        )}
        <Field id="email" label="Email address">
          <input type="email" id="email" defaultValue="jordan.lee@example.com" autoComplete="off" spellCheck={false} />
        </Field>
        <Field id="pw" label="Password">
          <input type="password" id="pw" defaultValue="sample-only" autoComplete="off" />
        </Field>
        <div>
          <Button type="submit">{login ? 'Sign in' : 'Create account'} as the sample user</Button>
        </div>
      </form>
      <p className="mt-6">
        {login ? (
          <>
            No account?{' '}
            <Link to="/signin?tab=register" onClick={switchTo('register')}>
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link to="/signin" onClick={switchTo('login')}>
              Sign in
            </Link>
          </>
        )}
      </p>
      <div className="rounded-ab border-warn/60 mt-10 grid gap-1 border-2 border-dashed px-4 py-3 text-sm">
        <span className="text-warn font-semibold">Prototype only</span>
        <span>
          The university-provided login replaces this form. Any submit signs in the sample user Jordan Lee and returns
          to where you were going.
        </span>
      </div>
    </div>
  );
}
