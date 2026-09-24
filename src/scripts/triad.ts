/**
 * Links the Understand / Build / Execute steps to the sticky diagram: the
 * step crossing the middle of the viewport becomes the active stage.
 */
export function initTriad(): void {
  const root = document.querySelector<HTMLElement>('[data-triad]');
  // The stepped diagram only applies to the side-by-side layout.
  if (!root || !('IntersectionObserver' in window)) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;

  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const caption = root.querySelector<HTMLElement>('[data-triad-caption]');

  const activate = (step: HTMLElement) => {
    const index = step.dataset.step ?? '0';
    root.dataset.active = index;
    for (const s of steps) s.toggleAttribute('data-current', s === step);
    const verb = step.querySelector('h3')?.textContent?.trim() ?? '';
    if (caption) caption.textContent = `0${Number(index) + 1} — ${verb}`;
  };

  const first = steps[0];
  if (first) activate(first);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(entry.target as HTMLElement);
      }
    },
    // A thin band across the centre of the viewport.
    { rootMargin: '-45% 0px -45% 0px' },
  );
  for (const step of steps) observer.observe(step);
}
