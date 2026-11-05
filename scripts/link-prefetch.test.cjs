const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { settleBeforeLeaving } = require('./link-prefetch.cjs');

const origin = 'http://127.0.0.1:4000';
const options = { quietMs: 40, startMs: 200, timeoutMs: 1000 };
const request = (url) => ({ url: () => url });
const after = (ms, action) => setTimeout(action, ms);

// A page whose first document is already loaded from the site.
async function loadedPage() {
  const page = new EventEmitter();
  page.location = 'about:blank';
  page.url = () => page.location;
  await settleBeforeLeaving(page, origin, options);
  page.location = origin + '/fingerprint';
  return page;
}

test('does not leave while the prefetch queue is still running', async () => {
  const page = await loadedPage();
  const first = request(origin + '/fingerprint/canvas.txt?_rsc=a');
  const queued = request(origin + '/fingerprint/webgl.txt?_rsc=a');
  let drained = false;
  page.emit('request', first);
  after(30, () => {
    page.emit('requestfinished', first);
    page.emit('request', queued);
  });
  after(60, () => {
    page.emit('requestfailed', queued);
    drained = true;
  });
  await settleBeforeLeaving(page, origin, options);
  assert.equal(drained, true);
});

test('waits for a hydrating document to start prefetching', async () => {
  const page = await loadedPage();
  const late = request(origin + '/ip.txt?_rsc=b');
  let finished = false;
  after(50, () => page.emit('request', late));
  after(80, () => {
    page.emit('requestfinished', late);
    finished = true;
  });
  await settleBeforeLeaving(page, origin, options);
  assert.equal(finished, true);
});

test('ignores other requests and leaves a document without prefetches', async () => {
  const page = await loadedPage();
  page.emit('request', request(origin + '/_next/static/chunks/app.js'));
  page.emit('request', request('https://api.creepjs.org/v1/x?_rsc=c'));
  const started = Date.now();
  await settleBeforeLeaving(page, origin, options);
  const waited = Date.now() - started;
  assert.ok(waited >= options.startMs - 25 && waited < options.timeoutMs);
});

test('stops waiting after the timeout instead of hanging', async () => {
  const page = await loadedPage();
  page.emit('request', request(origin + '/docs.txt?_rsc=d'));
  const started = Date.now();
  await settleBeforeLeaving(page, origin, { ...options, timeoutMs: 150 });
  assert.ok(Date.now() - started < options.timeoutMs);
});
