// Scans the repository and the build output for credentials, private
// network details and local machine paths. This repository is public: a
// failure here must be treated as a potential incident, not a flaky test.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, test } from 'node:test';
import { DIST, ROOT, walk } from './helpers.mjs';

const BINARY = new Set([
  '.png',
  '.ico',
  '.woff2',
  '.woff',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.gif',
]);

const SECRET_PATTERNS = [
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{40,}/],
  ['Anthropic key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI-style key', /\bsk-(proj-)?[A-Za-z0-9]{32,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Stripe key', /\b(sk|rk)_(live|test)_[A-Za-z0-9]{16,}/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  [
    'credential assignment',
    /\b(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['"][^'"\s]{12,}['"]/i,
  ],
];

const PRIVATE_NETWORK = [
  [
    'private IPv4',
    /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/,
  ],
  ['localhost URL', /\bhttps?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/],
  ['local machine path', /(\/home\/[a-z]|\/Users\/[A-Za-z]|[A-Z]:\\Users\\)/],
  ['.local / internal host', /\b[a-z0-9-]+\.(local|internal|lan|corp)\b/],
];

function trackedFiles() {
  try {
    return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: ROOT,
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean)
      .map((f) => join(ROOT, f));
  } catch {
    return walk(ROOT, (f) => !f.includes('/dist/'));
  }
}

function scan(files, patterns, { skip = () => false } = {}) {
  const hits = [];
  for (const file of files) {
    if (BINARY.has(extname(file)) || skip(file) || !existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const [label, re] of patterns) {
      const m = text.match(re);
      if (m) hits.push(`${label}: ${file.replace(ROOT, '')} → ${m[0].slice(0, 12)}…`);
    }
  }
  return hits;
}

// Files that legitimately contain the patterns as documentation or tests.
const isScannerOrDocs = (f) =>
  f.endsWith('tests/leak-scan.test.mjs') || f.endsWith('package-lock.json');

describe('leak scan', () => {
  test('no credentials in repository files', () => {
    assert.deepEqual(scan(trackedFiles(), SECRET_PATTERNS, { skip: isScannerOrDocs }), []);
  });

  test('no environment files are tracked', () => {
    const envs = trackedFiles().filter(
      (f) => /(^|\/)\.env(\.|$)/.test(f.replace(ROOT, '')) && !f.endsWith('.env.example'),
    );
    assert.deepEqual(envs, []);
  });

  test('build output contains no credentials, private network details or local paths', () => {
    if (!existsSync(DIST)) return;
    const files = walk(DIST);
    assert.deepEqual(scan(files, [...SECRET_PATTERNS, ...PRIVATE_NETWORK]), []);
  });
});
