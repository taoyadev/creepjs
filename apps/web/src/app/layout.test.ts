import { readdirSync, readFileSync } from 'node:fs';
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
      /<main[^>]*id="main-content"[^>]*>[\s\S]*?\{children\}\s*<\/main>/
    );
    expect(source).toContain('href="#main-content"');
  });

  it('leaves the root layout as the only <main> landmark', () => {
    const appRoot = path.join(process.cwd(), 'src', 'app');
    const withMain = readdirSync(appRoot, { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.tsx') && !file.includes('.test.'))
      .filter((file) =>
        readFileSync(path.join(appRoot, file), 'utf8').includes('<main')
      )
      .sort();

    // global-error.tsx replaces the root layout, so it brings its own <main>.
    expect(withMain).toEqual(['global-error.tsx', 'layout.tsx']);
  });
});
