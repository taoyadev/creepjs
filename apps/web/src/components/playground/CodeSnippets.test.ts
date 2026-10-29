import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { SITE_CONFIG } from '@/lib/metadata';

import { buildCodeExamples } from './CodeSnippets';

describe('playground code snippets', () => {
  it('builds four copyable examples from the production API base', () => {
    const examples = buildCodeExamples('');

    expect(Object.keys(examples)).toEqual([
      'javascript',
      'python',
      'curl',
      'go',
    ]);
    for (const example of Object.values(examples)) {
      expect(example).toContain(`${SITE_CONFIG.apiUrl}/v1/fingerprint`);
      expect(example).toContain('YOUR_API_TOKEN');
    }
    expect(examples.python).toContain("Path('fingerprint.json')");
    expect(examples.javascript).toContain('collectFingerprint()');
  });

  it('uses the in-memory token without adding a highlighter', () => {
    const token = 'test';
    const examples = buildCodeExamples(token);
    const source = readFileSync(
      path.join(
        process.cwd(),
        'src',
        'components',
        'playground',
        'CodeSnippets.tsx'
      ),
      'utf8'
    );

    for (const example of Object.values(examples)) {
      expect(example).toContain(token);
    }
    expect(source).toContain('<pre');
    expect(source).toContain('<code>');
    expect(source).not.toMatch(/highlight|rehype/i);
  });
});
