/**
 * Enquiry composer. Runs entirely in the browser and makes no network
 * requests: it validates the fields, then hands a pre-filled message to the
 * visitor's own email client via a mailto: link.
 *
 * All user input is placed into the URL with encodeURIComponent and into the
 * page with textContent only — never parsed as HTML.
 */

import { assembleAddress } from './email';

const LIMITS = { name: 120, message: 2000 } as const;

/** Copy text to the clipboard; resolves false where the browser does not allow it. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function setError(input: HTMLInputElement | HTMLTextAreaElement, message: string | null): void {
  const error = document.querySelector<HTMLElement>(`[data-error-for="${input.id}"]`);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (!error) return;
  error.textContent = message ?? '';
  error.hidden = !message;
}

export function initComposer(): void {
  const root = document.querySelector<HTMLElement>('[data-composer]');
  const form = root?.querySelector<HTMLFormElement>('[data-composer-form]');
  if (!root || !form) return;

  const address = assembleAddress(root);
  if (!address) return;

  const nameInput = form.querySelector<HTMLInputElement>('#f-name');
  const topicInput = form.querySelector<HTMLSelectElement>('#f-topic');
  const messageInput = form.querySelector<HTMLTextAreaElement>('#f-message');
  const status = form.querySelector<HTMLElement>('[data-composer-status]');
  const revealButton = root.querySelector<HTMLButtonElement>('[data-reveal-address]');
  const addressSlot = root.querySelector<HTMLElement>('[data-address-slot]');
  const fallback = form.querySelector<HTMLElement>('[data-composer-fallback]');
  const fallbackText = form.querySelector<HTMLTextAreaElement>('[data-fallback-text]');
  const copyStatus = form.querySelector<HTMLElement>('[data-copy-status]');
  if (!nameInput || !topicInput || !messageInput || !status) return;

  form.hidden = false;
  if (revealButton) revealButton.hidden = false;

  // Arriving from a service ("Discuss a website") pre-selects that topic.
  const requested = new URLSearchParams(window.location.search).get('topic');
  if (requested && [...topicInput.options].some((o) => o.value === requested)) {
    topicInput.value = requested;
  }

  let prepared = '';

  const validate = (): boolean => {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    let firstInvalid: HTMLElement | null = null;

    if (!name) {
      setError(nameInput, 'Please enter your name.');
      firstInvalid ??= nameInput;
    } else if (name.length > LIMITS.name) {
      setError(nameInput, `Please keep your name under ${LIMITS.name} characters.`);
      firstInvalid ??= nameInput;
    } else {
      setError(nameInput, null);
    }

    if (message.length < 10) {
      setError(messageInput, 'Please write a short message — at least a sentence.');
      firstInvalid ??= messageInput;
    } else if (message.length > LIMITS.message) {
      setError(messageInput, `Please keep your message under ${LIMITS.message} characters.`);
      firstInvalid ??= messageInput;
    } else {
      setError(messageInput, null);
    }

    firstInvalid?.focus();
    return !firstInvalid;
  };

  form.addEventListener('submit', (event) => {
    // Never allow a real form submission; there is nowhere to submit to.
    event.preventDefault();
    if (!validate()) {
      status.textContent = '';
      return;
    }

    const topic = topicInput.selectedOptions[0]?.textContent?.trim() ?? 'Enquiry';
    const subject = `[APOLLO Network] ${topic}`;
    const body = `${messageInput.value.trim()}\n\n— ${nameInput.value.trim()}`;
    const href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    prepared = `To: ${address}\nSubject: ${subject}\n\n${body}`;

    status.textContent =
      'Your email app should now open with the message ready to review. Nothing has been sent yet — press send there when you are happy with it.';
    if (fallback) {
      const slot = fallback.querySelector<HTMLElement>('[data-fallback-address]');
      if (slot) slot.textContent = address;
      if (fallbackText) {
        fallbackText.value = prepared;
        fallbackText.hidden = true;
      }
      if (copyStatus) copyStatus.textContent = '';
      fallback.hidden = false;
    }
    window.location.href = href;
  });

  // "Copy message" / "Copy email address" for visitors without an email app.
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.addEventListener('click', async () => {
      const what = button.dataset.copy;
      const text = what === 'message' ? prepared : address;
      if (!text) return;
      const ok = await copyText(text);
      const message = ok
        ? what === 'message'
          ? 'Message copied. Paste it into a new email.'
          : 'Email address copied.'
        : what === 'message'
          ? 'Copying is not available here. Select the message below and copy it instead.'
          : 'Copying is not available here. Select the address above and copy it instead.';
      if (copyStatus && form.contains(button)) copyStatus.textContent = message;
      else {
        const label = button.textContent;
        button.textContent = ok ? 'Copied' : 'Select the address to copy';
        window.setTimeout(() => (button.textContent = label), 2500);
      }
      if (!ok && what === 'message' && fallbackText) {
        fallbackText.hidden = false;
        fallbackText.select();
      }
    });
  }

  revealButton?.addEventListener('click', () => {
    if (!addressSlot) return;
    addressSlot.replaceChildren();
    const anchor = document.createElement('a');
    anchor.href = `mailto:${address}`;
    anchor.textContent = address;
    addressSlot.append(anchor);
    addressSlot.hidden = false;
    revealButton.hidden = true;
    const copyAfter = root.querySelector<HTMLButtonElement>('[data-copy-after-reveal]');
    if (copyAfter) copyAfter.hidden = false;
    anchor.focus();
  });
}
