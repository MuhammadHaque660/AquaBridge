import { useStore } from '../../services/store';
import { caption, cx } from '../styles';

const NOTICE = {
  '': 'border-ink-2 bg-mist',
  pri: 'border-primary bg-primary-soft',
  warn: 'border-warn bg-warn-soft',
  bad: 'border-bad bg-bad-soft',
  ok: 'border-ok bg-ok-soft',
};

/** Notice (SH-09): an inset with a coloured left edge. Use for information, success, warnings and errors. */
export function Notice({ tone = '', title, children, className, ...rest }) {
  return (
    <div className={cx('grid gap-1 border-l-4 px-5 py-4', NOTICE[tone], className)} {...rest}>
      {title && <strong className="text-md font-bold">{title}</strong>}
      {children && <div className="text-sm">{children}</div>}
    </div>
  );
}

/** Important warning text with an icon (GOV.UK pattern), for "never release" style messages. */
export function Warning({ children, className }) {
  return (
    <div className={cx('flex items-start gap-3', className)}>
      <span
        aria-hidden="true"
        className="bg-ink grid size-8 flex-none place-items-center rounded-full text-lg leading-none font-bold text-white"
      >
        !
      </span>
      <p className="pt-1 font-semibold">
        <span className="sr-only">Warning: </span>
        {children}
      </p>
    </div>
  );
}

/** Confirmation panel shown after a completed action, with an optional reference. */
export function Panel({ title, children }) {
  return (
    <div className="rounded-ab bg-ok grid gap-2 p-8 text-center text-white">
      <h1 className="text-white">{title}</h1>
      {children && <div className="text-lg">{children}</div>}
    </div>
  );
}

/** Empty state (SH-09): message plus one action. */
export function Empty({ title, children }) {
  return (
    <div className="rounded-ab bg-mist grid justify-items-start gap-3 p-8">
      <p className="text-md font-semibold">{title}</p>
      {children}
    </div>
  );
}

/** Prototype-only control that plays the other person's side of a flow. Not part of the real product. */
export function DemoControl({ children, text }) {
  return (
    <div className="rounded-ab border-warn/60 grid gap-2 border-2 border-dashed px-4 py-3 text-sm">
      <span className="text-warn font-semibold">Prototype only</span>
      <span>{text}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** Inline confirmation used instead of browser pop-ups for destructive actions. */
export function ConfirmInline({ question, children }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold">{question}</span> {children}
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
      className="rounded-ab bg-ink shadow-card fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-40 max-w-[calc(100%-32px)] -translate-x-1/2 px-5 py-3 text-sm font-semibold text-white"
    >
      {toastMsg?.msg}
    </div>
  );
}

/**
 * Page heading block. `caption` shows position (e.g. "Step 2 of 4"); `back` renders a back link above.
 * `eyebrow` is accepted as an alias of caption for older call sites.
 */
export function PageHead({ caption: cap, eyebrow, crumb, title, children, className, actions }) {
  const c = cap ?? eyebrow;
  const head = (
    <div className="grid gap-3">
      {crumb && <p className="text-sm">{crumb}</p>}
      <div className="grid gap-1">
        {c && <p className={caption}>{c}</p>}
        <h1>{title}</h1>
      </div>
      {children && typeof children === 'string' ? (
        <p className="text-md text-ink-2 max-w-[60ch]">{children}</p>
      ) : (
        children
      )}
    </div>
  );
  if (actions)
    return (
      <div className={cx('mb-10 flex flex-wrap items-end justify-between gap-4', className)}>
        {head}
        {actions}
      </div>
    );
  return <div className={cx('mb-10', className)}>{head}</div>;
}

/** Back link at the top of a page. */
export function BackLink({ children = 'Back', ...rest }) {
  return (
    <a
      className="text-ink hover:text-ink inline-flex items-center gap-1.5 text-sm underline underline-offset-3 before:inline-block before:size-2 before:-rotate-45 before:border-t-2 before:border-l-2 before:border-current before:content-['']"
      {...rest}
    >
      {children}
    </a>
  );
}
