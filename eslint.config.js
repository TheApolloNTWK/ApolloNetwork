import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Security: forbid dynamic code execution and raw HTML injection paths.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'astro/no-set-html-directive': 'error',
      // Safari/VoiceOver drops list semantics from lists styled with
      // `list-style: none`; role="list" restores them deliberately.
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
      'no-restricted-properties': [
        'error',
        {
          property: 'innerHTML',
          message: 'Use textContent or DOM APIs. innerHTML is blocked by Trusted Types.',
        },
        { property: 'outerHTML', message: 'Use DOM APIs instead of outerHTML.' },
        { property: 'insertAdjacentHTML', message: 'Use DOM APIs instead of insertAdjacentHTML.' },
        { object: 'document', property: 'write', message: 'document.write is not allowed.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message: 'innerHTML is not allowed.',
        },
      ],
    },
  },
];
