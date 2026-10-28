import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(process.cwd(), 'src', 'components', 'Header.tsx'),
  'utf8'
);

describe('Header desktop navigation', () => {
  it('renders each item as one link styled as a button', () => {
    // A button inside a link is invalid markup and two tab stops per item.
    expect(source).not.toMatch(/<Link\b[^>]*>\s*<Button\b/);
    expect(source).toMatch(/<Button\b[^>]*\basChild\b[^>]*>\s*<Link\b/);
  });

  it('shares the item list with the mobile menu and marks the current page', () => {
    expect(source).toContain('navItems.map(');
    expect(source).toContain("aria-current={isActive ? 'page' : undefined}");
  });
});
