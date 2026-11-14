/** Shared class strings for layout patterns used on every screen. Prefer these over repeating utilities. */
export const cx = (...c) => c.filter(Boolean).join(' ');

export const wrap = 'mx-auto w-full max-w-page px-4';
export const page = `${wrap} pt-8 pb-18`;
export const stack = 'grid gap-4';
export const stackLg = 'grid gap-8';
export const row = 'flex flex-wrap items-center gap-3';
export const label = 'font-mono text-xs uppercase tracking-[0.08em] text-ink-2';
export const mono = 'font-mono text-[0.875em] tabular-nums';
export const muted = 'text-ink-2';
export const panel = 'rounded-ab border border-line bg-surface p-6';
export const panelQuiet = 'rounded-ab bg-surface-2 px-6 py-4';
export const reasons = 'm-0 grid list-disc gap-1.5 pl-[1.2em]';
export const reasonsOl = 'm-0 grid list-decimal gap-1.5 pl-[1.2em]';
export const formGrid = 'grid grid-cols-2 gap-x-6 gap-y-4 max-sm:grid-cols-1';
export const choices = 'grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3';
export const twoPane = 'grid grid-cols-[minmax(0,1fr)_360px] items-start gap-8 max-lg:grid-cols-1';
export const sticky = 'lg:sticky lg:top-24';
export const formFoot = 'mt-6 flex flex-wrap justify-between gap-3 border-t border-line pt-6';
export const kv =
  'm-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm [&_dd]:m-0 [&_dd]:font-mono [&_dd]:text-[0.8125rem] [&_dd]:tabular-nums [&_dt]:text-ink-2';
export const careDl =
  'm-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm [&_dd]:m-0 [&_dd]:font-mono [&_dd]:text-[0.8125rem] [&_dt]:text-ink-2';
export const toolbar = 'mb-6 flex flex-wrap items-end gap-3';
export const crumb = 'text-sm [&_a]:no-underline';
