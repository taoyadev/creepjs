import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('root layout rendering boundary', () => {
  it('keeps server page content mounted instead of swapping the whole main', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src', 'app', 'layout.tsx'),
      'utf8'
    );

    expect(source).not.toContain('<Suspense');
    expect(source).toMatch(
      /<main className="flex-1">\s*\{children\}\s*<\/main>/
    );
  });
});
