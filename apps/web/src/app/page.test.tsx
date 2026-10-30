import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe('/ prerendered HTML', () => {
  it('leads with the automatic fingerprint scan and discloses its STUN contact first', () => {
    const html = renderToStaticMarkup(<HomePage />);
    const disclosure = html.indexOf('Its WebRTC check contacts Google STUN');
    const scan = html.indexOf('id="home-scan-title"');
    const ip = html.indexOf('Your public IP');

    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(html).toContain('Browser fingerprint check</h1>');
    expect(disclosure).toBeGreaterThan(-1);
    expect(disclosure).toBeLessThan(scan);
    expect(scan).toBeLessThan(ip);
    expect(html).toContain('href="/privacy#data"');
  });
});
