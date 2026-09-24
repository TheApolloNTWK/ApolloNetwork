// Verifies the production build: routing under the base path, metadata,
// links, and the security-relevant shape of every page.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { before, describe, test } from 'node:test';
import {
  BASE,
  DIST,
  ORIGIN,
  assertBuilt,
  attrs,
  htmlFiles,
  ids,
  read,
  rel,
  resolveToFile,
  walk,
} from './helpers.mjs';

const PAGES = ['', 'environment/', 'project/', 'work/', 'about/', 'contact/', 'privacy/'];

before(assertBuilt);

describe('routes', () => {
  test('every public page, the 404 page and meta files exist', () => {
    for (const p of PAGES)
      assert.ok(existsSync(join(DIST, p, 'index.html')), `missing ${p || '/'}`);
    for (const f of [
      '404.html',
      'robots.txt',
      'sitemap.xml',
      'site.webmanifest',
      'favicon.svg',
      'favicon.ico',
      'og-image.png',
      'apple-touch-icon.png',
      'icon-512.png',
    ]) {
      assert.ok(existsSync(join(DIST, f)), `missing ${f}`);
    }
  });

  test('sitemap lists exactly the public pages with absolute base-path URLs', () => {
    const xml = read(join(DIST, 'sitemap.xml'));
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.deepEqual(locs.sort(), PAGES.map((p) => `${ORIGIN}${BASE}/${p}`).sort());
  });

  test('robots.txt points at the sitemap', () => {
    assert.match(
      read(join(DIST, 'robots.txt')),
      new RegExp(`Sitemap: ${ORIGIN}${BASE}/sitemap.xml`),
    );
  });

  test('manifest is valid JSON scoped to the base path', () => {
    const manifest = JSON.parse(read(join(DIST, 'site.webmanifest')));
    assert.equal(manifest.start_url, `${BASE}/`);
    for (const icon of manifest.icons) assert.ok(resolveToFile(icon.src), `icon ${icon.src}`);
  });
});

describe('pages', () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    const name = rel(file);
    const is404 = file.endsWith('404.html');

    describe(name, () => {
      test('document basics', () => {
        assert.match(html, /^<!DOCTYPE html>/i);
        assert.match(html, /<html lang="en-GB"/);
        assert.match(html, /<meta name="viewport"/);
        assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, 'exactly one <h1>');
        assert.match(html, /<title>[^<]{10,}<\/title>/);
        assert.match(html, /<meta name="description" content="[^"]{50,}"/);
        assert.match(html, /<a class="skip-link" href="#main"/);
        assert.match(html, /<main id="main"/);
      });

      test('canonical and social metadata', () => {
        if (is404) {
          assert.match(html, /<meta name="robots" content="noindex"/);
          return;
        }
        const [canonical] = attrs(html.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', 'href');
        assert.ok(canonical?.startsWith(`${ORIGIN}${BASE}/`), `canonical: ${canonical}`);
        assert.match(html, /<meta property="og:image" content="https:\/\//);
        assert.match(html, /<meta property="og:title"/);
      });

      test('content security policy is present and strict', () => {
        const csp = html.match(/<meta http-equiv="content-security-policy" content="([^"]+)"/)?.[1];
        assert.ok(csp, 'CSP meta missing');
        assert.match(csp, /default-src 'none'/);
        assert.match(csp, /object-src 'none'/);
        assert.match(csp, /base-uri 'none'/);
        assert.match(csp, /form-action 'none'/);
        assert.match(csp, /require-trusted-types-for 'script'/);
        assert.match(csp, /script-src 'self'/);
        assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|unsafe-hashes|\*/);
        assert.match(html, /<meta name="referrer" content="no-referrer"/);
      });

      test('no inline handlers, style attributes or script URLs', () => {
        assert.doesNotMatch(html, /\son[a-z]+="/i, 'inline event handler');
        assert.doesNotMatch(html, /\sstyle="/i, 'style attribute (blocked by CSP)');
        assert.doesNotMatch(html, /(href|src)="\s*(javascript|data|vbscript):/i);
        assert.doesNotMatch(html, /<iframe|<embed|<object/i);
      });

      test('every script is same-origin or a hashed inline module', () => {
        for (const tag of html.match(/<script[^>]*>/g) ?? []) {
          if (/type="application\/ld\+json"/.test(tag)) continue;
          const src = attrs(tag, 'src')[0];
          if (src) {
            assert.ok(src.startsWith(`${BASE}/_astro/`), `external script: ${src}`);
            assert.ok(resolveToFile(src), `missing script ${src}`);
          } else {
            assert.match(tag, /type="module"/);
          }
        }
      });

      test('internal links and assets resolve', () => {
        const refs = [...attrs(html, 'href'), ...attrs(html, 'src')];
        for (const ref of refs) {
          if (/^(https?:|mailto:)/.test(ref)) continue;
          if (ref.startsWith('#')) {
            assert.ok(ids(html).has(ref.slice(1)), `${name}: missing anchor ${ref}`);
            continue;
          }
          assert.ok(ref.startsWith(`${BASE}/`), `${name}: link not under base path: ${ref}`);
          const [path, hash] = ref.split('#');
          const target = resolveToFile(path);
          assert.ok(target, `${name}: broken link ${ref}`);
          if (hash && target.endsWith('.html')) {
            assert.ok(ids(read(target)).has(hash), `${name}: missing anchor ${ref}`);
          }
        }
      });

      test('external links are https and do not leak referrer or opener', () => {
        for (const tag of html.match(/<a\s[^>]*href="https?:[^"]*"[^>]*>/g) ?? []) {
          const href = attrs(tag, 'href')[0];
          assert.ok(href.startsWith('https://'), `insecure link ${href}`);
          if (href.startsWith(ORIGIN)) continue;
          assert.match(tag, /rel="[^"]*noopener[^"]*"/, `noopener: ${href}`);
          assert.match(tag, /rel="[^"]*noreferrer[^"]*"/, `noreferrer: ${href}`);
        }
      });
    });
  }
});

describe('bundles', () => {
  const js = walk(DIST, (f) => f.endsWith('.js'));
  const inline = htmlFiles().flatMap((f) =>
    [...read(f).matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]),
  );

  test('no source maps are published', () => {
    assert.deepEqual(
      walk(DIST, (f) => f.endsWith('.map')),
      [],
    );
    for (const f of js) assert.doesNotMatch(read(f), /sourceMappingURL/);
  });

  test('no dynamic code execution or HTML-injection sinks', () => {
    for (const code of [...js.map((f) => read(f)), ...inline]) {
      assert.doesNotMatch(
        code,
        /\beval\(|new Function\(|\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|document\.write/,
      );
      assert.doesNotMatch(code, /setTimeout\(\s*['"`]|setInterval\(\s*['"`]/);
    }
  });

  test('no network calls from client code', () => {
    for (const code of [...js.map((f) => read(f)), ...inline]) {
      assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource/);
    }
  });

  test('client JavaScript stays within budget (40 KB uncompressed, all pages)', () => {
    const external = js.reduce((n, f) => n + readFileSync(f).length, 0);
    const inlined = [...new Set(inline)].reduce((n, s) => n + s.length, 0);
    const total = external + inlined;
    assert.ok(total < 40_000, `client JS is ${total} bytes`);
  });
});

describe('content integrity', () => {
  const pages = htmlFiles().map((f) => ({ name: rel(f), html: read(f) }));
  const text = (html) =>
    html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');

  test('brand language is Understand / Build / Execute, not the retired phrasing', () => {
    const home = text(read(join(DIST, 'index.html')));
    for (const verb of ['Understand', 'Build', 'Execute']) assert.match(home, new RegExp(verb));
    for (const { name, html } of pages) {
      assert.doesNotMatch(text(html), /organi[sz]e\.?\s+act\b/i, `${name}: retired tagline`);
    }
  });

  test('no invented metrics, testimonials or pricing', () => {
    const banned = [
      /\b\d[\d,.]*\s*\+?\s*(clients|customers|users|leads|businesses|companies)\b/i,
      /\b\d{1,3}\s?%/,
      /[£$€]\s?\d/,
      /\btrusted by\b/i,
      /\btestimonial/i,
    ];
    for (const { name, html } of pages) {
      const t = text(html);
      for (const re of banned) assert.doesNotMatch(t, re, `${name}: ${re}`);
    }
  });

  test('unreleased work is labelled, and nothing claims public availability', () => {
    const t = text(read(join(DIST, 'project', 'index.html')));
    assert.match(t, /In private development/);
    assert.match(t, /Future direction/);
    for (const { name, html } of pages) {
      assert.doesNotMatch(
        text(html),
        /\b(download (it )?now|available now|sign up|join the waitlist|buy now)\b/i,
        name,
      );
    }
  });

  test('contact page never presents a form that cannot deliver', () => {
    const html = read(join(DIST, 'contact', 'index.html'));
    const forms = html.match(/<form[^>]*>/g) ?? [];
    for (const f of forms) assert.match(f, /data-composer-form/, 'unexpected form');
    if (!forms.length) {
      // No email configured: the public enquiry channel must be offered instead.
      assert.match(html, /issues\/new\?template=enquiry\.yml/);
      assert.ok(existsSync(join(DIST, '..', '.github', 'ISSUE_TEMPLATE', 'enquiry.yml')));
    }
    assert.doesNotMatch(html, /@gmail\.com|@outlook\.com|@hotmail\.com/i, 'personal address');
  });

  test('Lead Finder is present as real, conservatively described work', () => {
    const t = text(read(join(DIST, 'work', 'index.html')));
    assert.match(t, /Lead Finder/);
    assert.match(t, /Internal tool/);
  });
});
