const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign-in and sign-up validation (REG-004). Messages say how to fix the problem. */
export function validateSignIn({ name, email, pw }, register) {
  const e = {};
  if (register && !name.trim()) e.name = 'Enter your full name';
  if (!email.trim()) e.email = 'Enter your email address';
  else if (!EMAIL.test(email.trim())) e.email = 'Enter an email address in the correct format, like name@example.com';
  if (!pw) e.pw = 'Enter your password';
  else if (register && pw.length < 8) e.pw = 'Password must be 8 characters or more';
  return e;
}
