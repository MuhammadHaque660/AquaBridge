import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ME } from '../../services/contracts';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Notice, PageHead } from '../../shared/components/Feedback';
import { Field, Tabs } from '../../shared/components/Form';
import { cx, label, page, stack } from '../../shared/styles';

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

  const submit = (e) => {
    e.preventDefault();
    update((s) => {
      s.user = ME;
      s.pending = null;
    });
    toast('Signed in as Jordan Lee (sample user)');
    navigate(p?.to || '/account/listings');
  };

  return (
    <div className={cx(page, 'max-w-[520px]')}>
      <PageHead title={tab === 'login' ? 'Log in to continue' : 'Create your account'}>
        {p ? (
          <Notice tone="pri" title={`You’ll go back to: ${p.label}`} data-tour="return-notice">
            {p.name === 'editor'
              ? 'Your rehoming answers are saved and will fill in the listing.'
              : 'Anything you entered is kept.'}
          </Notice>
        ) : (
          <p className="text-ink-2">One account lets you rehome and adopt.</p>
        )}
      </PageHead>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          ['login', 'Log in'],
          ['register', 'Sign up'],
        ]}
      />
      <form className={stack} noValidate onSubmit={submit}>
        {tab === 'register' && (
          <Field id="name" label="Your name">
            <input type="text" id="name" defaultValue="Jordan Lee" autoComplete="off" />
          </Field>
        )}
        <Field id="email" label="Email">
          <input type="email" id="email" defaultValue="jordan.lee@example.com" autoComplete="off" />
        </Field>
        <Field id="pw" label="Password">
          <input type="password" id="pw" defaultValue="sample-only" autoComplete="off" />
        </Field>
        <Button type="submit">{tab === 'login' ? 'Log in' : 'Create account'} as sample user</Button>
      </form>
      <div className="rounded-ab border-warn bg-warn-soft mt-6 grid gap-2 border border-dashed px-4 py-3 text-sm">
        <span className={cx(label, 'text-warn')}>Prototype note</span>
        <span>
          The university-provided login component replaces this form. Any submit signs in the sample user Jordan Lee
          (U-01) and returns to the saved action.
        </span>
      </div>
    </div>
  );
}
