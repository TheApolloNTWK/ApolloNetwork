/**
 * APOLLO assistant behaviour. Guided answers only: replies are cloned from
 * pre-rendered <template> elements, user choices are written with
 * textContent, and nothing is sent over the network.
 *
 * Nothing is stored on the visitor's device: the greeting is offered only on
 * the page that opts in (the home page), so no "already seen" flag is needed.
 */

const GREETING_DELAY_MS = 6000;
const GREETING_VISIBLE_MS = 12000;
const MAX_MESSAGES = 8;

export function initAssistant(): void {
  const root = document.querySelector<HTMLElement>('[data-assistant]');
  const toggle = root?.querySelector<HTMLButtonElement>('[data-assistant-toggle]');
  const panel = root?.querySelector<HTMLElement>('[data-assistant-panel]');
  const log = root?.querySelector<HTMLElement>('[data-assistant-log]');
  const bubble = root?.querySelector<HTMLElement>('[data-assistant-bubble]');
  if (!root || !toggle || !panel || !log || !bubble) return;

  root.hidden = false;

  const hideBubble = () => {
    bubble.hidden = true;
  };

  const setOpen = (open: boolean, { focus = true } = {}) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      hideBubble();
      if (focus) panel.querySelector<HTMLElement>('[data-topic]')?.focus();
    } else if (focus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden !== false));
  panel.querySelector('[data-assistant-close]')?.addEventListener('click', () => setOpen(false));
  bubble.querySelector('[data-assistant-dismiss]')?.addEventListener('click', hideBubble);
  bubble.addEventListener('click', (event) => {
    if (!(event.target as HTMLElement).closest('[data-assistant-dismiss]')) setOpen(true);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  const append = (node: Node) => {
    log.append(node);
    while (log.children.length > MAX_MESSAGES) log.firstElementChild?.remove();
    log.scrollTop = log.scrollHeight;
  };

  for (const choice of panel.querySelectorAll<HTMLButtonElement>('[data-topic]')) {
    choice.addEventListener('click', () => {
      const id = choice.dataset.topic;
      const template = root.querySelector<HTMLTemplateElement>(
        `template[data-answer="${CSS.escape(id ?? '')}"]`,
      );
      if (!template) return;

      const asked = document.createElement('p');
      asked.className = 'assistant__msg assistant__msg--user';
      // Carry Astro's scoping class so the cloned bubble is styled.
      for (const cls of choice.classList) if (cls.startsWith('astro-')) asked.classList.add(cls);
      for (const attr of choice.getAttributeNames())
        if (attr.startsWith('data-astro-cid')) asked.setAttribute(attr, '');
      asked.textContent = choice.textContent?.trim() ?? '';
      append(asked);
      append(template.content.cloneNode(true));
    });
  }

  // A gentle greeting on the page that opts in — never over an open menu or panel.
  if (root.hasAttribute('data-assistant-greet')) {
    window.setTimeout(() => {
      if (panel.hidden && !document.querySelector('[data-header][data-menu-open]')) {
        bubble.hidden = false;
        // It is an invitation, not a fixture: step aside after a while.
        window.setTimeout(() => {
          if (!bubble.hidden) hideBubble();
        }, GREETING_VISIBLE_MS);
      }
    }, GREETING_DELAY_MS);
  }
}
