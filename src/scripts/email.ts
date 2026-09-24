/**
 * Reassembles the business address from reversed data attributes, and
 * powers every "Show email address" control on the site. Only a plain,
 * validated address is ever turned into a mailto: link, and it is written to
 * the page with DOM APIs — never parsed as HTML.
 */

export function assembleAddress(el: HTMLElement): string | null {
  const u = el.dataset.u;
  const d = el.dataset.d;
  if (!u || !d) return null;
  const reverse = (s: string) => [...s].reverse().join('');
  const address = `${reverse(u)}@${reverse(d)}`;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(address) ? address : null;
}

export function initEmailReveals(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-email-reveal]')) {
    const address = assembleAddress(root);
    const button = root.querySelector<HTMLButtonElement>('[data-email-button]');
    const slot = root.querySelector<HTMLElement>('[data-email-slot]');
    if (!address || !button || !slot) continue;

    button.hidden = false;
    button.addEventListener('click', () => {
      const anchor = document.createElement('a');
      anchor.href = `mailto:${address}`;
      anchor.textContent = address;
      slot.replaceChildren(anchor);
      slot.hidden = false;
      button.hidden = true;
      anchor.focus();
    });
  }
}
