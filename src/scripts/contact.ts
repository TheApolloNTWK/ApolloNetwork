/**
 * Enquiry composer. Runs entirely in the browser and makes no network
 * requests: it validates the fields, then hands a pre-filled message to the
 * visitor's own email client via a mailto: link.
 *
 * All user input is placed into the URL with encodeURIComponent and into the
 * page with textContent only — never parsed as HTML.
 */

const LIMITS = { name: 120, message: 2000 } as const;

function assembleAddress(root: HTMLElement): string | null {
  const u = root.dataset.u;
  const d = root.dataset.d;
  if (!u || !d) return null;
  const reverse = (s: string) => [...s].reverse().join('');
  const address = `${reverse(u)}@${reverse(d)}`;
  // Defence in depth: only ever build a mailto for a plain address.
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(address) ? address : null;
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
  const revealButton = form.querySelector<HTMLButtonElement>('[data-reveal-address]');
  const addressSlot = form.querySelector<HTMLElement>('[data-address-slot]');
  if (!nameInput || !topicInput || !messageInput || !status) return;

  form.hidden = false;

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

    const subject = `[APOLLO Network] ${topicInput.value}`;
    const body = `${messageInput.value.trim()}\n\n— ${nameInput.value.trim()}`;
    const href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent =
      'Your email app should now open with the message ready to review. Nothing has been sent yet — press send there when you are happy with it.';
    window.location.href = href;
  });

  revealButton?.addEventListener('click', () => {
    if (!addressSlot) return;
    addressSlot.replaceChildren();
    const lead = document.createTextNode('Email: ');
    const anchor = document.createElement('a');
    anchor.href = `mailto:${address}`;
    anchor.textContent = address;
    addressSlot.append(lead, anchor);
    addressSlot.hidden = false;
    revealButton.hidden = true;
    anchor.focus();
  });
}
