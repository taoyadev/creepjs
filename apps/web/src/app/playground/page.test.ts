import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function readSource(...segments: string[]) {
  return readFileSync(path.join(process.cwd(), 'src', ...segments), 'utf8');
}

describe('playground rendering boundaries', () => {
  it('keeps the page shell on the server with one task-first H1', () => {
    const source = readSource('app', 'playground', 'page.tsx');

    expect(source).not.toContain("'use client'");
    expect(source.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(source).toContain('<PlaygroundApp />');
    expect(source.indexOf('<PlaygroundApp />')).toBeLessThan(
      source.indexOf('Endpoint reference')
    );
  });

  it('does not persist or report the token from the client orchestrator', () => {
    const source = readSource(
      'components',
      'playground',
      'PlaygroundApp.tsx'
    );

    for (const forbidden of [
      'localStorage',
      'sessionStorage',
      'URLSearchParams',
      'location.search',
    ]) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).not.toMatch(
      /analytics\.[A-Za-z.]+\([^)]*(?:apiToken|email)/
    );
  });
});
