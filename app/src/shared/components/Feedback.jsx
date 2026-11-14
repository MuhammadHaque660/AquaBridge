import { useStore } from '../../services/store';
import { cx, label } from '../styles';

const NOTICE = {
  '': 'border-line bg-surface-2',
  pri: 'border-transparent bg-primary-soft',
  warn: 'border-transparent bg-warn-soft',
  bad: 'border-transparent bg-bad-soft',
  ok: 'border-transparent bg-ok-soft',
};

/** Notice (SH-09): info / success / warning / error message with a bold title. */
export function Notice({ tone = '', title, children, className, ...rest }) {
  return (
    <div className={cx('rounded-ab grid gap-1 border px-4 py-3 text-sm', NOTICE[tone], className)} {...rest}>
      {title && <strong className="font-display text-md">{title}</strong>}
      {children && <span>{children}</span>}
    </div>
  );
}

/** Empty state (SH-09): message plus one action, centred. */
export function Empty({ title, children }) {
  return (
    <div className="rounded-ab border-line text-ink-2 grid justify-items-center gap-3 border border-dashed p-8 text-center">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

/** Prototype-only control that plays the other person's side of a flow. Not part of the real product. */
export function DemoControl({ children, text }) {
  return (
    <div className="rounded-ab border-warn bg-warn-soft grid gap-2 border border-dashed px-4 py-3 text-sm">
      <span className={cx(label, 'text-warn')}>Demo control</span>
      <span>{text}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** Inline confirmation used instead of browser pop-ups for destructive actions. */
export function ConfirmInline({ question, children }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      {question} {children}
    </span>
  );
}

/** Toast (SH-09): short confirmation, announced to screen readers. */
export function Toast() {
  const { toastMsg } = useStore();
  return (
    <div
      role="status"
      aria-live="polite"
      hidden={!toastMsg}
      className="rounded-ab bg-ink text-mist fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-40 max-w-[calc(100%-32px)] -translate-x-1/2 px-[18px] py-3 text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,.18)]"
    >
      {toastMsg?.msg}
    </div>
  );
}

/** Page heading block with an optional label above and description below. */
export function PageHead({ eyebrow, crumb, title, children, className, actions }) {
  const head = (
    <div className="grid gap-2">
      {crumb && <p className="text-sm [&_a]:no-underline">{crumb}</p>}
      {eyebrow && <p className={label}>{eyebrow}</p>}
      <h1>{title}</h1>
      {children && typeof children === 'string' ? <p className="text-ink-2 max-w-[62ch]">{children}</p> : children}
    </div>
  );
  if (actions)
    return (
      <div className={cx('mb-8 flex flex-wrap items-end justify-between gap-3', className)}>
        {head}
        {actions}
      </div>
    );
  return <div className={cx('mb-8', className)}>{head}</div>;
}
