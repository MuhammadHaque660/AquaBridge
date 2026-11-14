import { Link } from 'react-router';
import { cx } from '../styles';

const VARIANT = {
  primary: 'border-transparent bg-primary text-white hover:bg-primary-hover hover:text-white',
  secondary: 'border-line bg-surface text-ink hover:border-ink-2 hover:text-ink',
  quiet: 'border-transparent bg-transparent text-primary hover:bg-primary-soft hover:text-primary',
  danger: 'border-bad bg-surface text-bad hover:bg-bad-soft hover:text-bad',
  onDark: 'border-white/50 bg-transparent text-white hover:border-white hover:text-white',
};

function sizeClass(size, variant) {
  if (size === 'sm') return 'px-3 py-[7px] text-xs';
  if (size === 'lg') return 'px-[22px] py-[15px] text-[1.0625rem]';
  return cx(variant === 'quiet' ? 'px-2' : 'px-[18px]', 'py-[11px] text-sm');
}

/**
 * Button (SH-02). Renders a router link with `to`, a plain link with `href`, otherwise a <button type="button">.
 * variant: primary · secondary · quiet · danger · onDark   size: sm · md · lg
 */
export function Button({ variant = 'primary', size, to, href, className, type = 'button', ...rest }) {
  const cls = cx(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-ab border leading-[1.2] font-bold no-underline transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-45',
    VARIANT[variant],
    sizeClass(size, variant),
    className,
  );
  if (to) return <Link to={to} className={cls} {...rest} />;
  if (href) return <a href={href} className={cls} {...rest} />;
  return <button type={type} className={cls} {...rest} />;
}
