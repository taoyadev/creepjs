import assert from 'node:assert/strict';
import { test } from 'vitest';
import { deferStaticBootstrap } from './defer-static-bootstrap.mjs';

test('defers framework startup and preserves script source order and attributes', () => {
  const html =
    '<script src="/_next/static/chunks/react.js" async="" crossorigin="anonymous"></script><main>Ready to read</main><script src="/_next/static/chunks/webpack.js" async></script>';
  const result = deferStaticBootstrap(html);
  assert.equal(
    result,
    '<script src="/_next/static/chunks/react.js" crossorigin="anonymous" defer></script><main>Ready to read</main><script src="/_next/static/chunks/webpack.js" defer></script>'
  );
  assert.ok(result.indexOf('react.js') < result.indexOf('webpack.js'));
});

test('preserves inline response data, SDK examples and third-party scripts', () => {
  const html =
    '<script>self.__next_f.push([1,"response data"])</script><script src="/sdk.js" async></script><script src="https://static.cloudflareinsights.com/beacon.min.js" async></script><code>&lt;script src="/_next/static/chunks/example.js" async&gt;</code>';
  assert.equal(deferStaticBootstrap(html), html);
});

test('does not change legacy polyfills or mistake data attributes for async', () => {
  const html =
    '<script src="/_next/static/chunks/polyfills.js" async nomodule></script><script src="/_next/static/chunks/main.js" data-async="true" defer></script>';
  assert.equal(deferStaticBootstrap(html), html);
});

test('is idempotent and retains an existing defer attribute', () => {
  const html =
    "<script src='/_next/static/chunks/main.js' async='true' defer></script>";
  const result = deferStaticBootstrap(html);
  assert.equal(
    result,
    "<script src='/_next/static/chunks/main.js' defer></script>"
  );
  assert.equal(deferStaticBootstrap(result), result);
});

test('keeps custom head nodes ahead of non-hoistable deferred startup scripts', () => {
  const html =
    '<html><head><script src="/_next/static/chunks/react.js" async></script><script id="theme">applyTheme()</script><script type="application/ld+json">{"name":"CreepJS"}</script><script src="/_next/static/chunks/main.js" async></script></head><body><main>Ready</main><script src="/_next/static/chunks/webpack.js" async></script></body></html>';
  const result = deferStaticBootstrap(html);
  assert.ok(result.indexOf('id="theme"') < result.indexOf('chunks/react.js'));
  assert.ok(
    result.indexOf('application/ld+json') < result.indexOf('chunks/react.js')
  );
  assert.ok(
    result.indexOf('chunks/react.js') < result.indexOf('chunks/main.js')
  );
  assert.ok(result.indexOf('chunks/main.js') < result.indexOf('</head>'));
  assert.ok(result.indexOf('chunks/webpack.js') > result.indexOf('</head>'));
  assert.equal(deferStaticBootstrap(result), result);
});
