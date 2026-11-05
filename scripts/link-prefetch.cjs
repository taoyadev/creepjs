// Next.js prefetches each visible <Link> once a page hydrates, five requests
// at a time, and starts the next queued request whenever one settles. If a
// document navigation begins meanwhile, WebKit refuses the requests that the
// queue starts during unload and logs "Fetch API cannot load ... due to
// access control checks."; Playwright's WebKit driver reports that console
// error as a page error. Users move between pages through the client router,
// which keeps the document, so the harness waits for these requests before it
// leaves a document itself.
const defaults = { quietMs: 250, startMs: 3000, timeoutMs: 10000 };
const watchers = new WeakMap();

function watch(page, origin) {
  const state = { pending: new Set(), started: 0, last: 0, since: Date.now() };
  const isFlight = (request) => {
    const url = new URL(request.url());
    return url.origin === origin && url.searchParams.has('_rsc');
  };
  page.on('request', (request) => {
    if (!isFlight(request)) return;
    state.pending.add(request);
    state.started += 1;
    state.last = Date.now();
  });
  const settle = (request) => {
    if (state.pending.delete(request)) state.last = Date.now();
  };
  page.on('requestfinished', settle);
  page.on('requestfailed', settle);
  return state;
}

// Call before each goto or reload. Resolves once the current document has
// started prefetching, nothing is in flight, and nothing started or settled
// for quietMs. A document that starts none within startMs has nothing to
// interrupt. After timeoutMs it stops waiting, so a request interrupted then
// still surfaces as a runtime error instead of being hidden.
async function settleBeforeLeaving(page, origin, options = {}) {
  const { quietMs, startMs, timeoutMs } = { ...defaults, ...options };
  if (!watchers.has(page)) watchers.set(page, watch(page, origin));
  const state = watchers.get(page);
  const deadline = Date.now() + timeoutMs;
  while (new URL(page.url()).origin === origin && Date.now() < deadline) {
    const idle =
      state.pending.size === 0 &&
      (state.started > 0
        ? Date.now() - state.last >= quietMs
        : Date.now() - state.since >= startMs);
    if (idle) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  state.pending.clear();
  state.started = 0;
  state.since = Date.now();
}

module.exports = { settleBeforeLeaving };
