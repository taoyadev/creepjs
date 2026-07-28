import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LiveIpCard } from './LiveIpCard';

describe('LiveIpCard', () => {
  it('reserves its card and renders an honest loading state', () => {
    const html = renderToStaticMarkup(<LiveIpCard />);

    expect(html).toContain('min-h-[22rem]');
    expect(html).toContain('Loading public IP summary');
    expect(html).toContain('href="/ip"');
    expect(html).not.toContain('0.0.0.0');
  });
});
