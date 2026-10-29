import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ResponseViewer } from './ResponseViewer';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe('ResponseViewer', () => {
  it('renders a stable idle response region', () => {
    const html = renderToStaticMarkup(
      <ResponseViewer loading={false} response={{ body: '', tone: 'idle' }} />
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('No request has run yet.');
    expect(html).toContain('<pre');
    expect(html).toContain('<code>');
  });

  it('uses the shared accessible skeleton while loading', () => {
    const html = renderToStaticMarkup(
      <ResponseViewer loading response={{ body: '', tone: 'idle' }} />
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Waiting for API response');
  });

  it('announces success without placing the JSON body in the live region', () => {
    const html = renderToStaticMarkup(
      <ResponseViewer
        loading={false}
        response={{ body: '{"ok":true}', tone: 'success' }}
      />
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('The request completed successfully.');
    expect(html).toContain('<code>{&quot;ok&quot;:true}</code>');
  });

  it('exposes request failures as alerts', () => {
    const html = renderToStaticMarkup(
      <ResponseViewer
        loading={false}
        response={{ body: 'Error: unavailable', tone: 'error' }}
      />
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain('Error: unavailable');
  });

  it('distinguishes partial responses from complete success', () => {
    const html = renderToStaticMarkup(
      <ResponseViewer
        loading={false}
        response={{
          body: '{"fingerprintId":"partial"}',
          tone: 'partial',
          hint: 'Expected report fields are missing.',
        }}
      />
    );
    expect(html).toContain('The request returned a partial result.');
    expect(html).toContain('Expected report fields are missing.');
    expect(html).not.toContain('The request completed successfully.');
  });
});
