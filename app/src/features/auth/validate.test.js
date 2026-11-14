import { describe, expect, it } from 'vitest';
import { validateSignIn } from './validate';

describe('sign-in validation (REG-004)', () => {
  it('accepts a valid sign-in', () => {
    expect(validateSignIn({ name: '', email: 'a@b.co', pw: 'x' }, false)).toEqual({});
  });
  it('explains empty and badly formatted fields', () => {
    expect(validateSignIn({ name: '', email: '', pw: '' }, false)).toEqual({
      email: 'Enter your email address',
      pw: 'Enter your password',
    });
    expect(validateSignIn({ name: '', email: 'jordan@', pw: 'x' }, false).email).toMatch(/correct format/);
  });
  it('needs a name and an 8 character password to create an account', () => {
    expect(validateSignIn({ name: ' ', email: 'a@b.co', pw: 'short' }, true)).toEqual({
      name: 'Enter your full name',
      pw: 'Password must be 8 characters or more',
    });
  });
});
