import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IpBatchWorkspace } from './IpBatchWorkspace';

describe('IpBatchWorkspace', () => {
  it('renders a private, labelled, keyboard-operable batch form', () => {
    const html = renderToStaticMarkup(<IpBatchWorkspace />);

    expect(html).toContain('id="batch"');
    expect(html).toContain('for="batch-api-token"');
    expect(html).toContain('id="batch-api-token"');
    expect(html).toContain('type="password"');
    expect(html).toContain('autoComplete="off"');
    expect(html).toContain('for="batch-ip-list"');
    expect(html).toContain('id="batch-ip-list"');
    expect(html).toContain('aria-describedby="batch-input-help batch-input-count"');
    expect(html).toContain('href="/playground"');
    expect(html).toContain('Run batch lookup');
    expect(html).toContain('disabled=""');
    expect(html).toContain('role="status"');
  });
});
