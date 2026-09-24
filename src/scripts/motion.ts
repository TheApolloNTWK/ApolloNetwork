/**
 * Site-wide motion system.
 *
 *  - [data-reveal]           fades/rises into view once. Optional
 *                            data-reveal-order="n" staggers siblings.
 *  - [data-scroll-progress]  receives a --progress custom property (0 → 1)
 *                            while it crosses the viewport, for CSS to use.
 *                            Descendants marked [data-progress-item] get --i
 *                            (their index) and the container gets --total.
 *
 * Both are progressive enhancements: without JavaScript, or with reduced
 * motion, content is simply present and static.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function initMotion(): void {
  initReveals();
  initScrollProgress();
}

function initReveals(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const pending = new Set<HTMLElement>();
  const reveal = (el: HTMLElement) => {
    el.classList.remove('is-pending');
    pending.delete(el);
    observer.unobserve(el);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  const fold = window.innerHeight;
  for (const item of items) {
    // Only hide what the visitor has not seen yet — never content already on
    // screen, which would flash.
    if (item.getBoundingClientRect().top < fold * 0.92) continue;
    const order = item.dataset.revealOrder;
    if (order) item.style.setProperty('--reveal-order', order);
    item.classList.add('is-pending');
    pending.add(item);
    observer.observe(item);
  }

  // Safety net: an observer only fires when an element crosses a threshold,
  // so a jump (End key, anchor link, fast fling) can carry an element from
  // below the viewport to above it unseen. Anything whose top has passed the
  // reveal line is shown, so content can never be left hidden.
  let frame = 0;
  const sweep = () => {
    frame = 0;
    const line = window.innerHeight * 0.92;
    for (const el of pending) if (el.getBoundingClientRect().top < line) reveal(el);
    if (!pending.size) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onScroll);
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(sweep);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', onScroll);
  // Arriving on a deep link (e.g. /work/#lead-finder) starts mid-page.
  if (location.hash) onScroll();
}

function initScrollProgress(): void {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-scroll-progress]')];
  if (!targets.length) return;

  if (reducedMotion.matches) return;

  // Custom properties are set through the CSSOM, which the CSP permits;
  // inline style attributes in markup would be blocked.
  for (const el of targets) {
    const items = el.querySelectorAll<HTMLElement>('[data-progress-item]');
    el.style.setProperty('--total', String(items.length));
    items.forEach((item, i) => item.style.setProperty('--i', String(i)));
  }

  const active = new Set<HTMLElement>();
  let frame = 0;

  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    for (const el of active) {
      const rect = el.getBoundingClientRect();
      // 0 when the element's top reaches 85% of the viewport,
      // 1 when its bottom reaches 55%: the reading zone.
      const start = vh * 0.85;
      const end = vh * 0.55;
      const total = rect.height + (start - end);
      const p = Math.min(1, Math.max(0, (start - rect.top) / total));
      el.style.setProperty('--progress', p.toFixed(4));
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // Only elements near the viewport are measured on scroll.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) active.add(el);
        else active.delete(el);
      }
      schedule();
    },
    { rootMargin: '20% 0px 20% 0px' },
  );
  for (const el of targets) observer.observe(el);

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}
