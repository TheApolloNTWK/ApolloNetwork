/**
 * Header behaviour: scrolled state and the small-screen menu.
 * The menu is a disclosure (button + aria-expanded), not a modal dialog, but
 * while open it traps focus and locks scroll because it covers the page.
 */

const MOBILE_QUERY = '(max-width: 767px)';

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header?.querySelector<HTMLElement>('[data-menu]');
  const label = header?.querySelector<HTMLElement>('[data-menu-label]');
  if (!header || !toggle || !menu || !label) return;

  // Scrolled state via a marker element: no scroll listener needed.
  const marker = document.createElement('div');
  marker.setAttribute('aria-hidden', 'true');
  marker.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
  document.body.prepend(marker);
  new IntersectionObserver(([entry]) => {
    header.toggleAttribute('data-scrolled', !entry?.isIntersecting);
  }).observe(marker);

  toggle.hidden = false;
  header.setAttribute('data-menu-ready', '');

  const mobile = window.matchMedia(MOBILE_QUERY);
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open: boolean, { restoreFocus = true } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close menu' : 'Open menu';
    header.toggleAttribute('data-menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.querySelector<HTMLElement>('a')?.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    // Keep focus within the toggle + menu links while the overlay is open.
    const focusable = [toggle, ...menu.querySelectorAll<HTMLElement>('a[href]')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Same-page anchors should close the menu; navigation handles the rest.
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false, { restoreFocus: false });
  });

  mobile.addEventListener('change', (event) => {
    if (!event.matches && isOpen()) setOpen(false, { restoreFocus: false });
  });
}
