import { Link } from 'react-router';
import { cx } from '../styles';

const VARIANT = {
  primary: 'bg-primary text-white shadow-[0_2px_0_var(--color-primary-hover)] hover:bg-primary-hover hover:text-white',
  secondary: 'bg-surface-2 text-ink shadow-[0_2px_0_var(--color-line)] hover:bg-line hover:text-ink',
  quiet: 'bg-transparent px-1 text-primary underline underline-offset-3 hover:text-primary-hover hover:decoration-2',
  danger: 'bg-bad text-white shadow-[0_2px_0_#7c1d17] hover:bg-[#8f221b] hover:text-white',
  onDark: 'bg-white text-ink hover:bg-surface-2 hover:text-ink',
};

function sizeClass(size, variant) {
  if (variant === 'quiet') return size === 'sm' ? 'py-1 text-sm' : 'py-2 text-md';
  if (size === 'sm') return 'min-h-9 px-3 py-1.5 text-sm';
  if (size === 'lg') return 'min-h-12 px-6 py-3 text-md';
  return 'min-h-11 px-5 py-2.5 text-md';
}

/**
 * Button (SH-02). Renders a router link with `to`, a plain link with `href`, otherwise a <button type="button">.
 * variant: primary · secondary · quiet (text link style) · danger · onDark   size: sm · md · lg
 * Use one primary button per screen; use quiet for tertiary actions instead of extra outlined buttons.
 */
export function Button({ variant = 'primary', size, to, href, className, type = 'button', ...rest }) {
  const cls = cx(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-ab-sm leading-tight font-semibold no-underline transition-colors active:translate-y-px',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    VARIANT[variant],
    sizeClass(size, variant),
    className,
  );
  if (to) return <Link to={to} className={cls} {...rest} />;
  if (href) return <a href={href} className={cls} {...rest} />;
  return <button type={type} className={cls} {...rest} />;
}
