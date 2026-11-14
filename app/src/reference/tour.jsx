/** Guided demo engine (prototype only): runs the steps in flows.js and shows the guide panel. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { to } from '../routes';
import { seed } from '../services/seed';
import { useStore } from '../services/store';
import { Button } from '../shared/components/Button';
import { cx, label } from '../shared/styles';
import { FLOWS } from './flows';

const TourContext = createContext({ tour: null });

export function TourProvider({ children }) {
  const { replace, toast } = useStore();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null); // { flow, i, min }

  const show = useCallback(
    (flow, i) => {
      const f = FLOWS[flow];
      const st = f.steps[i];
      replace((cur) => {
        const s = seed();
        s.notes = cur.notes;
        f.setup?.(s);
        for (let j = 0; j <= i; j++) f.steps[j].apply?.(s);
        return s;
      });
      setTour((t) => ({ flow, i, min: t?.flow === flow ? t.min : false }));
      navigate(to(st.route, st.params), { state: { ui: st.ui } });
    },
    [replace, navigate],
  );

  const value = useMemo(() => {
    const exit = (toDemos = true) => {
      setTour(null);
      if (toDemos) navigate('/demos');
    };
    return {
      tour,
      start: (flow) => show(flow, 0),
      next: () => {
        if (tour.i < FLOWS[tour.flow].steps.length - 1) show(tour.flow, tour.i + 1);
        else {
          exit();
          toast('Demo finished');
        }
      },
      back: () => tour.i > 0 && show(tour.flow, tour.i - 1),
      toggleMin: () => setTour((t) => ({ ...t, min: !t.min })),
      exit,
    };
  }, [tour, show, navigate, toast]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export const useTour = () => useContext(TourContext);

/** The floating guide panel, plus highlighting the element each step is about. */
export function TourPanel() {
  const { tour, next, back, toggleMin, exit } = useTour();
  const location = useLocation();
  const f = tour && FLOWS[tour.flow];
  const st = f?.steps[tour.i];

  useEffect(() => {
    document.body.classList.toggle('touring', !!tour);
  }, [tour]);

  useEffect(() => {
    if (!st?.hl) return;
    const sel = st.hl.startsWith('[') ? st.hl : `[data-tour="${st.hl}"]`;
    let tries = 0;
    let timer;
    // The new screen may still be rendering, so look for the element a few times before giving up.
    const find = () => {
      const el = document.querySelector(`main ${sel}`);
      if (!el) {
        if (++tries < 20) timer = setTimeout(find, 50);
        return;
      }
      el.classList.add('tour-hl');
      el.scrollIntoView({
        block: 'center',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    };
    timer = setTimeout(find, 0);
    return () => clearTimeout(timer);
  }, [st, location.key]);

  if (!tour) return null;
  const n = f.steps.length;
  const fixed =
    'fixed right-[max(16px,env(safe-area-inset-right,0px))] bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-45';

  if (tour.min)
    return (
      <Button
        className={cx(fixed, 'max-w-[calc(100%-32px)] shadow-[0_10px_28px_rgba(18,50,74,.25)]')}
        onClick={toggleMin}
      >
        {f.short} · step {tour.i + 1} of {n} · Show guide
      </Button>
    );

  return (
    <section
      aria-label="Demo guide"
      aria-live="polite"
      className={cx(
        fixed,
        'rounded-ab border-line border-t-primary bg-surface grid max-h-[min(72vh,580px)] w-[min(390px,calc(100%-32px))] gap-3 overflow-auto border border-t-4 px-6 py-4 shadow-[0_18px_48px_rgba(18,50,74,.22)]',
        'max-sm:left-[max(16px,env(safe-area-inset-left,0px))] max-sm:max-h-[50vh] max-sm:w-auto',
      )}
    >
      <div className="flex items-center justify-between">
        <span className={label}>{f.short}</span>
        <Button variant="quiet" size="sm" onClick={toggleMin}>
          Minimise
        </Button>
      </div>
      <div className="bg-surface-2 h-1 overflow-hidden rounded-[2px]" aria-hidden="true">
        <span
          className="bg-primary block h-full transition-[width] duration-250"
          style={{ width: `${((tour.i + 1) / n) * 100}%` }}
        />
      </div>
      <p className="text-ink-2 text-sm">
        Step {tour.i + 1} of {n} · <strong className="text-ink">{st.actor}</strong>
      </p>
      <h3 className="text-[1.1875rem]">{st.title}</h3>
      <p>{st.say}</p>
      <div className="rounded-ab-sm bg-surface-2 [&_code]:bg-surface grid gap-1.5 p-3 text-sm [&_code]:rounded-[3px] [&_code]:px-[5px] [&_code]:py-px [&_code]:font-mono [&_code]:text-[.8125rem] [&_code]:wrap-anywhere">
        <span className={label}>Behind the scenes</span>
        {/* sys strings are written by us in flows.js and only contain <code> tags */}
        <p dangerouslySetInnerHTML={{ __html: st.sys }} />
        <span className="text-primary font-mono text-[.75rem]">{st.who}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={back} disabled={tour.i === 0}>
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="quiet" size="sm" onClick={() => exit()}>
            Exit
          </Button>
          <Button size="sm" onClick={next}>
            {tour.i === n - 1 ? 'Finish' : 'Next step'}
          </Button>
        </div>
      </div>
    </section>
  );
}
