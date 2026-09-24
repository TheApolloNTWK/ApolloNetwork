/**
 * Register of everything this website stores on a visitor's device
 * (cookies, localStorage, sessionStorage, IndexedDB, cache storage…).
 *
 * The Cookie Policy is rendered from this list, and tests fail if client code
 * uses device storage while this register is empty. Under PECR, storage that
 * is not strictly necessary needs consent BEFORE it is set — see
 * docs/LEGAL.md before adding anything here.
 */

export interface StorageItem {
  name: string;
  kind: 'cookie' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'cache';
  setBy: string;
  purpose: string;
  duration: string;
  /** True only if strictly necessary for something the visitor asked for. */
  strictlyNecessary: boolean;
}

export const deviceStorage: StorageItem[] = [];
