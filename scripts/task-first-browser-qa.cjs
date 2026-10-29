#!/usr/bin/env node

// Run with openclaw-ops e2e. This bounded harness owns its loopback static
// server, isolated browser contexts, API fixtures, artifacts, and teardown.
// An explicit canonical target reuses the same checks after publication.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

if (!process.env.OPENCLAW_ARTIFACT_DIR) {
  throw new Error(
    'Run this browser harness through the managed OpenClaw E2E lane.'
  );
}
const root = path.resolve('apps/web/out');
const artifacts = process.env.OPENCLAW_ARTIFACT_DIR;
const results = [];
const screenshots = [];
const a11yAudits = [];
const a11yOnly = process.argv.includes('--a11y-only');
const ipOnly =
  process.argv.includes('--ip-only') || process.env.QA_SCOPE === 'ip';
const ipScenarios = new Set([
  'IP success, invalid, partial, empty, quota, malformed and recovery states',
  'IP auto-detection never overwrites typed input; cancellation keeps input',
  'no browser runtime errors across the changed routes',
  'WCAG A and AA automated audit of representative pages',
  'first render remains truthful and usable before JavaScript',
]);
const publicBase = process.env.QA_BASE_URL;
if (
  publicBase &&
  !(
    publicBase === 'https://creepjs.org' &&
    process.env.QA_ALLOW_PRODUCTION === '1'
  )
) {
  throw new Error(
    'Public acceptance requires the explicit canonical production URL and QA_ALLOW_PRODUCTION=1.'
  );
}
const mime = {
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown',
};
const paths = [
  ...fs
    .readFileSync(path.join(root, 'sitemap.xml'), 'utf8')
    .matchAll(/<loc>([^<]+)<\/loc>/g),
].map((match) => new URL(match[1]).pathname);
let page;
function assert(value, message) {
  if (!value) throw new Error(message);
}
async function check(name, action) {
  if (ipOnly && !ipScenarios.has(name)) return;
  const started = Date.now();
  try {
    await action();
    results.push({ name, status: 'pass', durationMs: Date.now() - started });
    console.log('PASS ' + name);
  } catch (error) {
    results.push({
      name,
      status: 'fail',
      error: error.message,
      durationMs: Date.now() - started,
    });
    console.error('FAIL ' + name + ': ' + error.message);
    if (page && !page.isClosed())
      await page
        .screenshot({
          path: path.join(artifacts, 'failure-' + results.length + '.png'),
        })
        .catch(() => {});
  }
}
async function screenshot(name) {
  await page.screenshot({ path: path.join(artifacts, name + '.png') });
  screenshots.push(name + '.png');
}
const ownIp = {
  ip: '203.0.113.10',
  location: { country_code: 'US', city: 'Test city' },
  asn: { number: 64500, organization: 'Test network' },
  risk: { score: 5, band: 'low', highRisk: false },
};
function ipResult(ip = '8.8.8.8') {
  return {
    data: {
      ip,
      location: {
        country: 'Test country',
        country_code: 'US',
        latitude: 0,
        longitude: 0,
      },
      network: { asn: 'AS15169', org: 'Test DNS network' },
      routing: { prefix: '8.8.8.0/24' },
      score: { risk_score: 0, band: 'low', verdict: 'low risk' },
      classification: {
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
        is_datacenter: true,
      },
      evidence: { signals: [] },
    },
    highRisk: false,
    cached: true,
    rateLimit: { limit: 30, remaining: 29, reset: null, tier: 'public' },
  };
}
async function mockApi(context, state = {}) {
  state.calls = [];
  await context.route('https://static.cloudflareinsights.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    })
  );
  await context.route('https://api.creepjs.org/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    state.calls.push({ path: url.pathname, method: request.method() });
    const json = (status, data, headers = {}) =>
      route
        .fulfill({
          status,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'access-control-allow-headers': 'Content-Type, X-API-Token',
            'access-control-expose-headers': 'Retry-After',
            ...headers,
          },
          body: JSON.stringify(data),
        })
        .catch(() => {});
    if (request.method() === 'OPTIONS') return json(200, {});
    if (url.pathname === '/my-ip') {
      if (state.detectDelay)
        await new Promise((resolve) => setTimeout(resolve, state.detectDelay));
      return json(
        state.ownError ? 503 : 200,
        state.ownError ? { error: 'Unavailable' } : ownIp
      );
    }
    if (url.pathname.startsWith('/v1/ip/public/')) {
      const ip = decodeURIComponent(url.pathname.split('/').pop());
      if (state.ipMode === 'slow')
        await new Promise((resolve) => setTimeout(resolve, 1000));
      if (state.ipMode === 'quota')
        return json(429, { error: 'Quota reached' }, { 'retry-after': '30' });
      if (state.ipMode === 'error')
        return json(503, { error: 'Provider unavailable' });
      if (state.ipMode === 'malformed') return json(200, {});
      const body = ipResult(ip);
      if (state.ipMode === 'partial')
        body.data = { ip, location: { country_code: 'US' } };
      if (state.ipMode === 'empty') body.data = { ip };
      return json(200, body);
    }
    if (url.pathname === '/v1/token')
      return json(200, {
        token: 'qa_fixture_token',
        email: 'fixture@example.test',
      });
    if (url.pathname === '/v1/fingerprint') {
      if (state.apiMode === 'error')
        return json(401, { error: 'Invalid API token' });
      if (state.apiMode === 'empty') return json(200, {});
      if (state.apiMode === 'partial')
        return json(200, { fingerprintId: 'partial-id' });
      const body = JSON.parse(request.postData() || '{}');
      return json(200, { ...body, fingerprintId: 'qa_server_fingerprint' });
    }
    if (url.pathname === '/v1/stats/uniqueness') {
      if (state.baselineError) return json(503, { error: 'Unavailable' });
      return json(200, { totalSamples: 2, kAnonThreshold: 20, estimates: {} });
    }
    if (url.pathname === '/v1/ip/batch') {
      return json(200, {
        count: 2,
        submittedCount: 2,
        uniqueCount: 2,
        validCount: 1,
        successCount: 1,
        invalidCount: 1,
        failedCount: 0,
        skippedCount: 0,
        cachedCount: 0,
        highRiskCount: 0,
        quotaCost: 1,
        aborted: false,
        results: [
          {
            ip: '8.8.8.8',
            ok: true,
            outcome: 'success',
            data: ipResult().data,
            cached: false,
            highRisk: false,
          },
          {
            ip: 'invalid',
            ok: false,
            outcome: 'invalid',
            error: 'Invalid IP address',
            status: 400,
          },
        ],
      });
    }
    // Analytics remain isolated. No real quota, token issuance, or provider call.
    return json(200, { ok: true });
  });
}
async function noOverflow() {
  assert(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1
    ),
    'horizontal page overflow'
  );
}

async function main() {
  fs.mkdirSync(artifacts, { recursive: true });
  const server = publicBase
    ? null
    : http.createServer((req, res) => {
        const pathname = decodeURIComponent(
          new URL(req.url, 'http://localhost').pathname
        );
        const safe = path.resolve(root, '.' + pathname);
        if (!safe.startsWith(root + path.sep) && safe !== root) {
          res.writeHead(403).end();
          return;
        }
        const candidates = [
          safe,
          safe + '.html',
          path.join(safe, 'index.html'),
        ];
        const file = candidates.find(
          (item) => fs.existsSync(item) && fs.statSync(item).isFile()
        );
        if (!file) {
          res.writeHead(404, { 'content-type': 'text/html' });
          res.end(fs.readFileSync(path.join(root, '404.html')));
          return;
        }
        res.writeHead(200, {
          'content-type':
            mime[path.extname(file)] || 'application/octet-stream',
          'cache-control': 'no-store',
        });
        fs.createReadStream(file).pipe(res);
      });
  if (server)
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = publicBase || 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium
    .launch({ headless: true })
    .catch(async (error) => {
      if (server) await new Promise((resolve) => server.close(resolve));
      throw error;
    });
  const runtimeErrors = [];
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: 'block',
  });
  const state = {};
  await mockApi(context, state);
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', (error) =>
    runtimeErrors.push(`${page.url()}: ${error.message}`)
  );
  async function visit(route, target = page) {
    // Background edge and telemetry requests do not define tool readiness.
    // Keep navigation, visible content, bootstrap and layout as explicit gates.
    await target.goto(base + route, { waitUntil: 'domcontentloaded' });
    await target.locator('h1').waitFor();
    await target
      .locator('nav button[aria-label^="Switch to "]:visible')
      .waitFor();
    await target.waitForFunction(() => {
      const styles = [...document.querySelectorAll('link[rel="stylesheet"]')];
      return (
        styles.length > 0 &&
        styles.every((link) => link.sheet !== null) &&
        document.fonts.status === 'loaded'
      );
    });
  }
  try {
    if (!a11yOnly) {
      await check(
        'all 65 routes have truthful static HTML and stable canonical URLs',
        async () => {
          assert(
            paths.length === 65 && new Set(paths).size === 65,
            'page registry count changed'
          );
          for (const route of paths) {
            const filename =
              route === '/'
                ? path.join(root, 'index.html')
                : path.join(root, route + '.html');
            const expected = fs.readFileSync(filename, 'utf8');
            let html = expected;
            if (publicBase) {
              const response = await context.request.get(base + route, {
                timeout: 30000,
              });
              assert(
                response.status() === 200,
                route + ': published document did not return 200'
              );
              html = await response.text();
              const heading = expected.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
              assert(
                heading && html.includes(heading),
                route + ': published heading differs from the release'
              );
              const article = expected.match(
                /<article\b[^>]*>([\s\S]*?)<\/article>/
              )?.[1];
              if (article)
                assert(
                  html.includes(article),
                  route + ': published signal article differs from the release'
                );
            }
            assert(
              (html.match(/<h1(?:\s|>)/g) || []).length === 1,
              route + ': expected exactly one H1'
            );
            assert(
              html.includes('id="main-content"') &&
                html.includes('href="#main-content"'),
              route + ': missing skip destination'
            );
            assert(
              html.includes(
                'https://creepjs.org' + (route === '/' ? '"' : route)
              ),
              route + ': canonical missing'
            );
            assert(
              !html.includes('"@type":"FAQPage"'),
              route + ': unwanted FAQ schema'
            );
          }
        }
      );
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await check(
          'all 65 routes render without overflow at ' + viewport.width + 'px',
          async () => {
            await page.setViewportSize(viewport);
            for (const route of paths) {
              await visit(route);
              assert(
                (await page.locator('h1').count()) === 1,
                route + ': H1 missing after hydration'
              );
              assert(
                (await page.locator('main').count()) === 1,
                route + ': incorrect main landmarks'
              );
              await noOverflow();
              if (
                route === '/' ||
                route === '/playground' ||
                route === '/fingerprint/canvas'
              )
                await screenshot(
                  viewport.width + route.replaceAll('/', '-') || 'home'
                );
            }
          }
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await check(
        'core tool controls are reachable in the first mobile viewport',
        async () => {
          for (const [route, selector] of [
            ['/', 'button:has-text("Run local scan")'],
            ['/ip', '#ip-address'],
            ['/ip', 'button:has-text("Check IP Risk")'],
            ['/fingerprint', '#signal-search'],
            ['/fingerprint/canvas', '#live-signal-title'],
            ['/checker', '#scan'],
            ['/playground', '#playground-token'],
            ['/playground', 'button:has-text("Collect & send request")'],
            [
              '/ip-lookup/how-to-tell-if-an-ip-is-a-proxy',
              'button:has-text("Check for proxy signals")',
            ],
          ]) {
            await visit(route);
            const box = await page.locator(selector).first().boundingBox();
            assert(
              box && box.y >= 0 && box.y < 844,
              route + ': task control below the first viewport'
            );
          }
        }
      );
      await check(
        'signal search, scenarios, no-match recovery, and keyboard navigation',
        async () => {
          await visit('/fingerprint');
          await page.getByLabel('Find a signal').fill('no-such-signal');
          await page.getByText('No signals match these filters').waitFor();
          await page.getByRole('button', { name: 'Show all signals' }).click();
          await page
            .getByRole('button', { name: 'Check display preferences' })
            .click();
          assert(
            (await page.locator('main a[href^="/fingerprint/"]').count()) > 0,
            'scenario did not filter signals'
          );
          await page.getByLabel('Find a signal').fill('motion');
          await page.getByLabel('Find a signal').press('Tab');
          assert(
            await page
              .locator('#signal-category')
              .evaluate((element) => element === document.activeElement),
            'keyboard cannot reach category select'
          );
        }
      );
      await check(
        'signal comparison, image-safe JSON, and unavailable API state',
        async () => {
          await visit('/fingerprint/canvas');
          await page
            .getByRole('button', { name: 'Keep for comparison' })
            .waitFor();
          await page
            .getByRole('button', { name: 'Keep for comparison' })
            .click();
          await page.getByRole('button', { name: 'Run again' }).click();
          await page
            .getByText('No values changed from your saved comparison.', {
              exact: false,
            })
            .waitFor();
          await page
            .getByText('Inspect complete JSON', { exact: false })
            .click();
          assert(
            !(
              await page.getByLabel('Canvas Fingerprint result').textContent()
            ).includes('data:image'),
            'image payload exposed in JSON'
          );
          const isolated = await browser.newContext({
            viewport: { width: 390, height: 844 },
            serviceWorkers: 'block',
          });
          await mockApi(isolated);
          await isolated.addInitScript(() => {
            HTMLCanvasElement.prototype.getContext = () => null;
          });
          const target = await isolated.newPage();
          await target.goto(base + '/fingerprint/canvas');
          await target
            .getByText('Signal unavailable', { exact: false })
            .waitFor();
          await isolated.close();
        }
      );
      await check(
        'network-sensitive checks wait for an explicit action',
        async () => {
          for (const route of ['/fingerprint/webrtc', '/fingerprint/lies']) {
            await visit(route);
            await page
              .getByRole('button', { name: 'Run signal check' })
              .waitFor();
            assert(
              await page
                .getByText('Ready to inspect this signal.', { exact: true })
                .isVisible(),
              'network check ran without action'
            );
          }
        }
      );
      await check(
        'IP success, invalid, partial, empty, quota, malformed and recovery states',
        async () => {
          await visit('/ip?q=8.8.8.8');
          await page
            .getByRole('heading', { name: 'No elevated network risk' })
            .waitFor();
          assert(
            await page.getByText('0, 0', { exact: true }).isVisible(),
            'valid zero coordinates hidden'
          );
          const before = state.calls.filter((call) =>
            call.path.includes('/v1/ip/public/')
          ).length;
          await page
            .getByLabel('IP address', { exact: true })
            .fill('https://example.test');
          await page
            .getByRole('button', { name: 'Check IP Risk', exact: true })
            .click();
          assert(
            (await page
              .getByLabel('IP address', { exact: true })
              .getAttribute('aria-invalid')) === 'true',
            'invalid address not labelled'
          );
          assert(
            state.calls.filter((call) => call.path.includes('/v1/ip/public/'))
              .length === before,
            'invalid input consumed a lookup'
          );
          for (const [mode, heading] of [
            ['partial', 'Risk data unavailable'],
            ['empty', 'No intelligence returned'],
            ['quota', 'Free lookup limit reached'],
            ['error', 'temporarily unavailable'],
            ['malformed', 'temporarily unavailable'],
            ['success', 'No elevated network risk'],
          ]) {
            state.ipMode = mode;
            await page
              .getByLabel('IP address', { exact: true })
              .fill('8.8.8.8');
            await page
              .getByRole('button', { name: 'Check IP Risk', exact: true })
              .click();
            if (['partial', 'empty', 'success'].includes(mode))
              await page
                .getByRole('heading', { name: heading, exact: true })
                .waitFor();
            else
              await page
                .getByRole('alert')
                .filter({ hasText: heading })
                .waitFor();
          }
          await noOverflow();
          await screenshot('mobile-ip-result');
        }
      );
      await check(
        'IP auto-detection never overwrites typed input; cancellation keeps input',
        async () => {
          state.detectDelay = 1000;
          state.ipMode = 'success';
          await page.goto(base + '/ip', { waitUntil: 'domcontentloaded' });
          await page.getByLabel('IP address', { exact: true }).fill('1.1.1.1');
          await page
            .getByRole('button', { name: 'Use my IP', exact: true })
            .waitFor({ state: 'visible' });
          await page.waitForFunction(
            () =>
              !document
                .querySelector('button[disabled]')
                ?.textContent.includes('Detecting your IP')
          );
          assert(
            (await page
              .getByLabel('IP address', { exact: true })
              .inputValue()) === '1.1.1.1',
            'auto detection replaced user input'
          );
          state.detectDelay = 0;
          state.ipMode = 'slow';
          await page
            .getByRole('button', { name: 'Check IP Risk', exact: true })
            .click();
          await page
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
          assert(
            (await page
              .getByLabel('IP address', { exact: true })
              .inputValue()) === '1.1.1.1',
            'cancel cleared input'
          );
          state.ipMode = 'success';
          await page.getByLabel('IP address', { exact: true }).fill('9.9.9.9');
          await page
            .getByRole('button', { name: 'Check IP Risk', exact: true })
            .click();
          await page
            .getByRole('heading', { name: 'No elevated network risk' })
            .waitFor();
          assert(
            new URL(page.url()).searchParams.get('q') === '9.9.9.9',
            'late cancelled request replaced a newer result'
          );
        }
      );
      await check(
        'proxy guide keeps absent classification unknown and recovers from invalid input',
        async () => {
          state.ipMode = 'partial';
          await visit('/ip-lookup/how-to-tell-if-an-ip-is-a-proxy');
          await page.getByRole('button', { name: 'Example IPv6' }).click();
          await page
            .getByRole('button', { name: 'Check for proxy signals' })
            .click();
          await page
            .getByRole('heading', { name: 'Proxy classification unavailable' })
            .waitFor();
          assert(
            (await page.getByText('Unknown', { exact: true }).count()) === 4,
            'unknown proxy flags rendered as false'
          );
        }
      );
      await check(
        'batch deep link opens the tool and retains explicit invalid rows',
        async () => {
          await visit('/ip#batch');
          const form = page.getByLabel('IP addresses');
          await form.waitFor({ state: 'visible' });
          await page
            .getByLabel('API token', { exact: true })
            .fill('qa_fixture_token');
          await form.fill('8.8.8.8\ninvalid');
          await page.getByRole('button', { name: 'Run batch lookup' }).click();
          await page.getByText('Batch results', { exact: true }).waitFor();
          assert(
            (await page.locator('tr[data-outcome="invalid"]').count()) === 1,
            'batch invalid result lost'
          );
        }
      );
      await check(
        'playground completes a real collection with mocked HTTP, bounded errors and memory-only token',
        async () => {
          await visit('/playground');
          const before = state.calls.filter((call) =>
            ['/v1/token', '/v1/fingerprint'].includes(call.path)
          ).length;
          const token = page.getByLabel('API token', { exact: true });
          await token.fill('qa_fixture_token');
          assert(
            (await token.getAttribute('type')) === 'password',
            'token visible by default'
          );
          assert(
            state.calls.filter((call) =>
              ['/v1/token', '/v1/fingerprint'].includes(call.path)
            ).length === before,
            'playground submitted on load'
          );
          await page
            .getByRole('button', { name: 'Collect & send request' })
            .click();
          await page
            .getByText('The request completed successfully.', { exact: true })
            .waitFor({ timeout: 30000 });
          assert(
            (await page.getByLabel('API response body').textContent()).includes(
              'qa_server_fingerprint'
            ),
            'response missing server-derived ID'
          );
          state.apiMode = 'error';
          await page
            .getByRole('button', { name: 'Resend collected snapshot' })
            .click();
          await page
            .getByText('The token was rejected.', { exact: false })
            .waitFor();
          assert(
            (await token.inputValue()) === 'qa_fixture_token',
            'error cleared token'
          );
          state.apiMode = 'empty';
          await page
            .getByRole('button', { name: 'Resend collected snapshot' })
            .click();
          await page
            .getByText('The API returned no usable result.', { exact: true })
            .waitFor();
          state.apiMode = 'partial';
          await page
            .getByRole('button', { name: 'Resend collected snapshot' })
            .click();
          await page
            .getByText('The request returned a partial result.', {
              exact: true,
            })
            .waitFor();
          const persisted = await page.evaluate(() =>
            [
              ...Object.values(localStorage),
              ...Object.values(sessionStorage),
              location.href,
            ].some((value) => value.includes('qa_fixture_token'))
          );
          assert(!persisted, 'token persisted or placed in URL');
          await page.reload({ waitUntil: 'networkidle' });
          assert(
            (await page
              .getByLabel('API token', { exact: true })
              .inputValue()) === '',
            'token survived reload'
          );
          await screenshot('mobile-playground');
        }
      );
      await check(
        'checker starts in the task region; optional comparison is off until requested',
        async () => {
          await visit('/checker?tab=graphics');
          await page
            .getByText('Fingerprint ID', { exact: true })
            .first()
            .waitFor({ timeout: 30000 });
          assert(
            !state.calls.some((call) => call.path === '/v1/stats/uniqueness'),
            'population subset sent without explicit action'
          );
          const compare = page.getByRole('button', {
            name: 'Compare with population',
            exact: true,
          });
          await compare.click();
          await page
            .getByText('Baseline warming up', { exact: false })
            .first()
            .waitFor();
          assert(
            state.calls.some((call) => call.path === '/v1/stats/uniqueness'),
            'requested comparison never ran'
          );
          await page
            .getByRole('tab', { name: 'Security', exact: true })
            .click();
          assert(
            new URL(page.url()).searchParams.get('tab') === 'security',
            'collector tab URL state lost'
          );
          await page
            .getByRole('button', { name: 'Refresh Fingerprint', exact: true })
            .click();
          assert(
            await page
              .getByText('Fingerprint ID', { exact: true })
              .first()
              .isVisible(),
            'refresh removed previous report'
          );
        }
      );
      await check(
        'keyboard skip link and mobile navigation return focus',
        async () => {
          await visit('/');
          await page.keyboard.press('Tab');
          assert(
            await page
              .getByText('Skip to main content', { exact: true })
              .evaluate((node) => node === document.activeElement),
            'skip link is not first keyboard action'
          );
          await page.keyboard.press('Enter');
          assert(
            await page
              .locator('main')
              .evaluate((node) => node === document.activeElement),
            'skip link did not focus main'
          );
          const trigger = page.getByRole('button', {
            name: 'Open navigation menu',
            exact: false,
          });
          await trigger.click();
          await page.keyboard.press('Escape');
          assert(
            await trigger.evaluate((node) => node === document.activeElement),
            'mobile menu did not return focus'
          );
        }
      );
      await check(
        'clipboard denial has a usable recovery and dark reduced-motion UI stays usable',
        async () => {
          await visit('/fingerprint/canvas');
          await page
            .getByRole('button', { name: 'Copy JSON', exact: true })
            .waitFor();
          await page.evaluate(() =>
            Object.defineProperty(navigator, 'clipboard', {
              configurable: true,
              value: {
                writeText: async () => {
                  throw new Error('Clipboard denied');
                },
              },
            })
          );
          await page
            .getByRole('button', { name: 'Copy JSON', exact: true })
            .click();
          await page
            .getByText(
              'Clipboard unavailable. Select the text and copy it manually.',
              { exact: true }
            )
            .waitFor();
          const reduced = await browser.newContext({
            viewport: { width: 390, height: 844 },
            colorScheme: 'dark',
            reducedMotion: 'reduce',
            serviceWorkers: 'block',
          });
          await mockApi(reduced);
          const target = await reduced.newPage();
          target.on('pageerror', (error) =>
            runtimeErrors.push(`${target.url()}: ${error.message}`)
          );
          await visit('/fingerprint/reduced-motion', target);
          assert(
            await target
              .locator('html')
              .evaluate((node) => node.classList.contains('dark')),
            'dark theme did not initialize'
          );
          assert(
            await target.getByText('reduce', { exact: true }).isVisible(),
            'reduced-motion preference not reflected in result'
          );
          await target.screenshot({
            path: path.join(artifacts, 'mobile-dark-reduced-motion.png'),
          });
          await reduced.close();
        }
      );
    }
    let axePath;
    try {
      axePath = require.resolve('axe-core/axe.min.js');
    } catch {
      /* report the exact missing audit separately */
    }
    if (axePath) {
      await check(
        'WCAG A and AA automated audit of representative pages',
        async () => {
          for (const mode of [
            { width: 1440, theme: 'light' },
            { width: 390, theme: 'light' },
            { width: 390, theme: 'dark' },
          ]) {
            await page.setViewportSize({ width: mode.width, height: 900 });
            await page.emulateMedia({ colorScheme: mode.theme });
            for (const route of ipOnly
              ? ['/ip']
              : [
                  '/',
                  '/ip',
                  '/checker?tab=all',
                  '/checker?tab=graphics',
                  '/fingerprint',
                  '/fingerprint/canvas',
                  '/playground',
                  '/docs',
                  '/guide/what-is-browser-fingerprinting',
                  '/ip-lookup/how-to-tell-if-an-ip-is-a-proxy',
                  '/privacy',
                  '/terms',
                ]) {
              await visit(route);
              assert(
                (await page
                  .locator('html')
                  .evaluate((node) => node.classList.contains('dark'))) ===
                  (mode.theme === 'dark'),
                'theme did not match audit mode'
              );
              if (route.startsWith('/checker')) {
                await page
                  .getByText('Fingerprint ID', { exact: true })
                  .first()
                  .waitFor({ timeout: 30000 });
                await page
                  .getByText('Fingerprint History', { exact: true })
                  .first()
                  .waitFor({ timeout: 30000 });
                await page
                  .getByText('Inspect collection coverage', { exact: true })
                  .click();
                await page
                  .getByText('Avg per Attempted', { exact: true })
                  .waitFor();
              }
              if (route === '/ip') {
                const submit = page.getByRole('button', {
                  name: 'Check IP Risk',
                  exact: true,
                });
                await submit.hover();
                await submit.evaluate((node) =>
                  Promise.all(node.getAnimations().map((item) => item.finished))
                );
              }
              await page.addScriptTag({ path: axePath });
              const result = await page.evaluate(async () =>
                window.axe.run(document, {
                  runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
                  },
                })
              );
              a11yAudits.push({
                route,
                width: mode.width,
                theme: mode.theme,
                violations: result.violations.length,
              });
              fs.writeFileSync(
                path.join(
                  artifacts,
                  'axe-' +
                    mode.width +
                    '-' +
                    mode.theme +
                    '-' +
                    route.replace(/[^a-z0-9]/gi, '-') +
                    '.json'
                ),
                JSON.stringify(
                  result.violations.map(({ id, nodes }) => ({
                    id,
                    nodes: nodes.map(({ target, html, failureSummary }) => ({
                      target,
                      html,
                      failureSummary,
                    })),
                  })),
                  null,
                  2
                )
              );
              assert(
                result.violations.length === 0,
                mode.width +
                  'px ' +
                  mode.theme +
                  ' ' +
                  route +
                  ': ' +
                  result.violations
                    .map((item) => item.id + ' (' + item.nodes.length + ')')
                    .join(', ')
              );
            }
          }
        }
      );
    } else {
      await check(
        'WCAG A and AA automated audit of representative pages',
        async () => {
          throw new Error(
            'axe-core is unavailable. Configure NODE_PATH for the existing OpenClaw tooling; the required audit cannot be skipped.'
          );
        }
      );
    }

    if (!a11yOnly) {
      const noJs = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      await check(
        'first render remains truthful and usable before JavaScript',
        async () => {
          const target = await noJs.newPage();
          for (const route of ipOnly
            ? ['/ip']
            : [
                '/',
                '/ip',
                '/checker',
                '/fingerprint/canvas',
                '/fingerprint/webrtc',
                '/docs',
                '/playground',
              ]) {
            await target.goto(base + route);
            if (route === '/ip')
              assert(
                await target
                  .getByLabel('IP address', { exact: true })
                  .isDisabled(),
                'IP input looks ready before client handlers are attached'
              );
            assert(
              (await target.locator('h1').count()) === 1,
              route + ': static H1 missing'
            );
            assert(
              await target.locator('main').isVisible(),
              route + ': static shell collapsed'
            );
            assert(
              await target.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1
              ),
              route + ': pre-JS overflow'
            );
          }
          await noJs.close();
        }
      );
    }
    await check(
      'no browser runtime errors across the changed routes',
      async () => {
        assert(runtimeErrors.length === 0, runtimeErrors.join('\n'));
      }
    );
  } finally {
    await browser.close();
    if (server) await new Promise((resolve) => server.close(resolve));
    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl: base,
      targetKind: publicBase ? 'production' : 'isolated-preview',
      scope: ipOnly ? 'ip-regression' : a11yOnly ? 'accessibility' : 'full',
      readiness: 'rendered-document-and-controls',
      routeCount: paths.length,
      passed: results.filter((item) => item.status === 'pass').length,
      failed: results.filter((item) => item.status === 'fail').length,
      screenshots,
      a11yAudits,
      runtimeErrors,
      results,
    };
    fs.writeFileSync(
      path.join(artifacts, 'task-first-summary.json'),
      JSON.stringify(report, null, 2) + '\n'
    );
    console.log(JSON.stringify(report, null, 2));
    if (report.failed) process.exitCode = 1;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
