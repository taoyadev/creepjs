#!/usr/bin/env node

/**
 * Browser acceptance for a Cloudflare Pages preview or the canonical site.
 *
 * Run through the OpenClaw E2E lane, which provides Playwright as shared
 * tooling. This script intentionally adds no project browser dependency.
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.QA_BASE_URL;
const isImmutablePreview =
  typeof baseUrl === 'string' &&
  /^https:\/\/[^/]+\.pages\.dev$/u.test(baseUrl);
const isExplicitProduction =
  process.env.QA_ALLOW_PRODUCTION === '1' && baseUrl === 'https://creepjs.org';
if (!isImmutablePreview && !isExplicitProduction) {
  throw new Error(
    'QA_BASE_URL must be an immutable Pages URL, or the explicit canonical production URL.'
  );
}

const artifactDir =
  process.env.QA_ARTIFACT_DIR ??
  path.join(process.cwd(), 'test-results', 'preview-browser-qa');
fs.mkdirSync(artifactDir, { recursive: true });

const results = [];
let activePage = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(name, callback) {
  const startedAt = Date.now();
  try {
    await callback();
    results.push({ name, status: 'pass', durationMs: Date.now() - startedAt });
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({
      name,
      status: 'fail',
      durationMs: Date.now() - startedAt,
      error: message,
    });
    console.error(`FAIL ${name}: ${message}`);
    if (activePage && !activePage.isClosed()) {
      const filename = `${String(results.length).padStart(2, '0')}-${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, '-')}.png`;
      await activePage
        .screenshot({
          path: path.join(artifactDir, filename),
          fullPage: true,
        })
        .catch(() => {});
    }
  }
}

function jsonHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'retry-after',
    'content-type': 'application/json; charset=utf-8',
  };
}

async function fulfillJson(route, status, body, headers = {}) {
  await route.fulfill({
    status,
    headers: { ...jsonHeaders(), ...headers },
    body: JSON.stringify(body),
  });
}

function ownIpSummary() {
  return {
    ip: '203.0.113.10',
    location: {
      country_code: 'US',
      region: 'California',
      city: 'San Francisco',
    },
    asn: { number: 64500, organization: 'QA Network' },
    risk: { score: 10, band: 'low', verdict: 'low risk', highRisk: false },
  };
}

function publicIpResult() {
  return {
    data: {
      ip: '8.8.8.8',
      location: {
        country: 'United States',
        country_code: 'US',
        region: 'California',
        city: 'Mountain View',
      },
      network: { asn: 'AS15169', org: 'Google LLC' },
      routing: { origin_asn: 'AS15169', prefix: '8.8.8.0/24' },
      score: {
        risk_score: 5,
        band: 'low',
        verdict: 'low risk',
        recommended_action: 'allow',
      },
      classification: {
        is_datacenter: true,
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
      },
      evidence: { signals: [] },
    },
    cached: false,
    highRisk: false,
    rateLimit: { limit: 30, remaining: 29, reset: null, tier: 'public' },
  };
}

function successfulBatch() {
  return {
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
        data: {
          ip: '8.8.8.8',
          location: {
            country_code: 'US',
            region: 'California',
            city: 'Mountain View',
          },
          network: { asn: 'AS15169', org: 'Google LLC' },
          score: { risk_score: 5, band: 'low', verdict: 'low risk' },
        },
        cached: false,
        highRisk: false,
      },
      {
        ip: 'invalid',
        ok: false,
        outcome: 'invalid',
        error: 'Invalid IP address.',
        status: 400,
      },
    ],
  };
}

function partialBatch() {
  return {
    count: 3,
    submittedCount: 3,
    uniqueCount: 3,
    validCount: 3,
    successCount: 1,
    invalidCount: 0,
    failedCount: 1,
    skippedCount: 1,
    cachedCount: 0,
    highRiskCount: 0,
    quotaCost: 3,
    aborted: true,
    abortedReason: 'provider unavailable',
    retryAfter: 30,
    results: [
      {
        ip: '8.8.8.8',
        ok: true,
        outcome: 'success',
        data: {
          ip: '8.8.8.8',
          network: { org: 'Google LLC' },
          score: { risk_score: 5, band: 'low', verdict: 'low risk' },
        },
        cached: false,
        highRisk: false,
      },
      {
        ip: '1.1.1.1',
        ok: false,
        outcome: 'failed',
        error: 'Provider unavailable.',
        status: 503,
      },
      {
        ip: '9.9.9.9',
        ok: false,
        outcome: 'skipped',
        error: 'Skipped after dependency abort.',
      },
    ],
  };
}

async function installCommonApiMocks(context) {
  await context.route('**/my-ip', (route) =>
    fulfillJson(route, 200, ownIpSummary())
  );
  await context.route('**/v1/ip/public/**', (route) =>
    fulfillJson(route, 200, publicIpResult())
  );
}

function captureRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });
  return errors;
}

async function expectSingleH1(page) {
  await page.locator('h1').first().waitFor({ state: 'visible' });
  const count = await page.locator('h1').count();
  assert(count === 1, `expected one H1, found ${count}`);
}

async function expectNoRootOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  assert(overflow <= 1, `root overflows horizontally by ${overflow}px`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
  });
  await installCommonApiMocks(desktop);

  await check('static crawler, llms, mirrors, answers, and schema', async () => {
    const request = desktop.request;
    const robotsResponse = await request.get(`${baseUrl}/robots.txt`);
    const robots = await robotsResponse.text();
    assert(robotsResponse.status() === 200, 'robots.txt did not return 200');
    assert(
      robotsResponse.headers()['content-type']?.includes('text/plain'),
      'robots.txt MIME is not text/plain'
    );
    for (const crawler of [
      'OAI-SearchBot',
      'GPTBot',
      'ChatGPT-User',
      'ClaudeBot',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Perplexity-User',
      'Google-Extended',
    ]) {
      assert(robots.includes(crawler), `robots.txt missing ${crawler}`);
    }
    assert(
      (robots.match(/Disallow: \/(?:api|v1)\/\*/gu) ?? []).length === 4,
      'robots.txt does not repeat both API restrictions for both groups'
    );

    const llmsResponse = await request.get(`${baseUrl}/llms.txt`);
    const llms = await llmsResponse.text();
    assert(llmsResponse.status() === 200, 'llms.txt did not return 200');
    assert(
      llmsResponse.headers()['content-type']?.includes('text/plain'),
      'llms.txt MIME is not text/plain'
    );
    const slugs = [
      ...llms.matchAll(
        /https:\/\/creepjs\.org\/content\/fingerprints\/([a-z0-9-]+)\.md/gu
      ),
    ].map((match) => match[1]);
    assert(slugs.length === 55, `llms.txt contains ${slugs.length} mirrors`);
    assert(new Set(slugs).size === 55, 'llms.txt contains duplicate mirrors');

    const llmsFullResponse = await request.get(`${baseUrl}/llms-full.txt`);
    const llmsFull = await llmsFullResponse.text();
    assert(llmsFullResponse.status() === 200, 'llms-full.txt did not return 200');
    assert(
      llmsFullResponse.headers()['content-type']?.includes('text/plain'),
      'llms-full.txt MIME is not text/plain'
    );

    const mirrorChecks = await Promise.all(
      slugs.map(async (slug) => {
        const response = await request.get(
          `${baseUrl}/content/fingerprints/${slug}.md`
        );
        const body = await response.text();
        return {
          slug,
          status: response.status(),
          mime: response.headers()['content-type'] ?? '',
          safe:
            body.includes('What CreepJS reports') &&
            body.includes('How to interpret it'),
          included: llmsFull.includes(`Signal: ${slug}`),
        };
      })
    );
    for (const mirror of mirrorChecks) {
      assert(mirror.status === 200, `${mirror.slug}.md did not return 200`);
      assert(
        /text\/(?:markdown|plain)/u.test(mirror.mime),
        `${mirror.slug}.md has unexpected MIME ${mirror.mime}`
      );
      assert(mirror.safe, `${mirror.slug}.md lacks reviewed safe sections`);
      assert(
        mirror.included,
        `${mirror.slug}.md is absent from llms-full.txt`
      );
    }

    for (const [route, anchor] of [
      ['/', 'what-is-creepjs'],
      ['/checker', 'what-does-the-checker-report'],
      ['/ip', 'how-ip-risk-is-scored'],
      [
        '/ip-lookup/how-to-tell-if-an-ip-is-a-proxy',
        'how-to-tell',
      ],
    ]) {
      const response = await request.get(`${baseUrl}${route}`);
      const html = await response.text();
      assert(response.status() === 200, `${route} source did not return 200`);
      assert(
        html.includes(`id="${anchor}"`),
        `${route} view-source lacks #${anchor}`
      );
      const schemaTypes = [...html.matchAll(/"@type":"([^"]+)"/gu)].map(
        (match) => match[1]
      );
      assert(!schemaTypes.includes('HowTo'), `${route} emitted HowTo schema`);
      assert(!schemaTypes.includes('Dataset'), `${route} emitted Dataset schema`);
    }
  });

  await check('desktop route rendering and answer anchors', async () => {
    const page = await desktop.newPage();
    activePage = page;
    const errors = captureRuntimeErrors(page);
    for (const route of [
      '/',
      '/checker',
      '/ip',
      '/ip-lookup/how-to-tell-if-an-ip-is-a-proxy',
      '/fingerprint/canvas',
      '/playground',
    ]) {
      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'domcontentloaded',
      });
      assert(response?.status() === 200, `${route} did not render with 200`);
      await expectSingleH1(page);
      await expectNoRootOverflow(page);
    }
    assert(errors.length === 0, `runtime errors: ${errors.join(' | ')}`);
    await page.close();
  });

  await check('fingerprint article is static and fetch-free', async () => {
    const page = await desktop.newPage();
    activePage = page;
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`${baseUrl}/fingerprint/canvas`, {
      waitUntil: 'networkidle',
    });
    await expectSingleH1(page);
    assert((await page.locator('article.prose').count()) === 1, 'article missing');
    await page
      .getByRole('heading', { name: 'What CreepJS reports' })
      .waitFor();
    assert(
      !requests.some((url) => /\/content\/fingerprints\/[^/]+\.md/u.test(url)),
      'browser fetched fingerprint Markdown at runtime'
    );
    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const joinedSchemas = schemas.join('\n');
    assert(!joinedSchemas.includes('"HowTo"'), 'HowTo schema emitted');
    assert(!joinedSchemas.includes('"Dataset"'), 'Dataset schema emitted');
    await page.close();
  });

  await check('checker scan shell, URL round-trip, and blocked IP degradation', async () => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    await context.route('**/my-ip', (route) => route.abort('blockedbyclient'));
    const page = await context.newPage();
    activePage = page;
    await page.goto(
      `${baseUrl}/checker?tab=graphics&fp=abc123&cov=92.5&b=18`,
      { waitUntil: 'domcontentloaded' }
    );
    await expectSingleH1(page);
    await page
      .locator('#what-does-the-checker-report')
      .waitFor({ state: 'attached' });
    await page
      .getByLabel('Shared fingerprint snapshot context')
      .waitFor({ state: 'visible' });
    assert(
      await page.getByText('Collecting browser fingerprint').isVisible(),
      'scan progress did not stay inside its task region'
    );
    assert(
      await page.locator('h1').isVisible(),
      'static page shell disappeared during scan'
    );
    await page
      .getByText('Fingerprint ID', { exact: true })
      .first()
      .waitFor({ timeout: 90_000 });
    await page.getByRole('tab', { name: 'Security' }).click();
    await page.waitForFunction(
      () =>
        new URLSearchParams(location.search).get('tab') === 'security' &&
        new URLSearchParams(location.search).get('fp') === 'abc123'
    );
    await page.getByText('Network Trust Report').waitFor();
    await page
      .getByText('Unavailable', { exact: true })
      .waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: 'Retry network context' })
      .waitFor({ state: 'visible' });
    await context.close();
  });

  await check('IP q-state and batch happy, invalid, auth, quota, abort flows', async () => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      acceptDownloads: true,
    });
    await installCommonApiMocks(context);
    let batchMode = 'happy';
    await context.route('**/v1/ip/batch', async (route) => {
      if (batchMode === '401') {
        return fulfillJson(route, 401, { error: 'Invalid API token.' });
      }
      if (batchMode === '429') {
        return fulfillJson(
          route,
          429,
          { error: 'Rate limit exceeded.' },
          { 'retry-after': '30' }
        );
      }
      return fulfillJson(
        route,
        200,
        batchMode === 'partial' ? partialBatch() : successfulBatch()
      );
    });
    const page = await context.newPage();
    activePage = page;

    await page.goto(`${baseUrl}/ip?q=8.8.8.8`, {
      waitUntil: 'domcontentloaded',
    });
    await page.getByText('No elevated network risk').waitFor();
    assert(
      new URL(page.url()).searchParams.get('q') === '8.8.8.8',
      'IP q parameter did not round-trip'
    );

    async function openBatch() {
      await page.goto(`${baseUrl}/ip#batch`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(250);
      await page.getByLabel('API token').fill('qa');
      return {
        input: page.getByLabel('IP addresses'),
        run: page.getByRole('button', { name: 'Run batch lookup' }),
      };
    }

    let controls = await openBatch();
    await controls.input.fill(
      Array.from({ length: 51 }, (_, index) => `192.0.2.${index}`).join('\n')
    );
    await page.getByText('Enter at most 50 addresses per batch.').waitFor();
    assert(await controls.run.isDisabled(), 'invalid batch was submittable');

    batchMode = 'happy';
    controls = await openBatch();
    await controls.input.fill('8.8.8.8\ninvalid');
    await controls.run.click();
    await page.getByText('Batch results').waitFor();
    assert(
      (await page.locator('tr[data-outcome="success"]').count()) === 1,
      'happy batch success row missing'
    );
    assert(
      (await page.locator('tr[data-outcome="invalid"]').count()) === 1,
      'invalid batch row missing'
    );
    assert(
      await page.getByText('Batch results').evaluate(
        (element) => element === document.activeElement
      ),
      'batch result heading did not receive focus'
    );

    batchMode = '401';
    controls = await openBatch();
    await controls.input.fill('8.8.8.8');
    await controls.run.click();
    await page.getByText('Batch request failed').waitFor();
    await page.getByText('Invalid API token.').waitFor();

    batchMode = '429';
    controls = await openBatch();
    await controls.input.fill('8.8.8.8');
    await controls.run.click();
    await page
      .getByText('Try again in about 30 seconds.', { exact: false })
      .waitFor();

    batchMode = 'partial';
    controls = await openBatch();
    await controls.input.fill('8.8.8.8\n1.1.1.1\n9.9.9.9');
    await controls.run.click();
    await page.getByText('Partial result').waitFor();
    assert(
      (await page.locator('tr[data-outcome="failed"]').count()) === 1,
      'partial batch failed row missing'
    );
    assert(
      (await page.locator('tr[data-outcome="skipped"]').count()) === 1,
      'partial batch skipped row missing'
    );
    await context.close();
  });

  await check('playground token, endpoint, response, error, and memory boundaries', async () => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    let tokenMode = 'success';
    await context.route('**/v1/token', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 750));
      if (tokenMode === 'abort') return route.abort('failed');
      if (tokenMode === 'error') {
        return fulfillJson(route, 401, { error: 'Token request denied.' });
      }
      return fulfillJson(route, 200, { token: 'qa' });
    });
    await context.route('**/v1/fingerprint', (route) =>
      fulfillJson(route, 200, { ok: true, fingerprintId: 'qa-fingerprint' })
    );
    const page = await context.newPage();
    activePage = page;
    await page.goto(`${baseUrl}/playground`, {
      waitUntil: 'networkidle',
    });
    await expectSingleH1(page);
    await page.getByText('Endpoint reference').waitFor();
    await page
      .getByRole('button', { name: 'Test API now' })
      .waitFor({ state: 'visible', timeout: 90_000 });

    const email = page.getByLabel('Email address');
    await email.fill('qa@example.test');
    await page.waitForFunction(
      () => {
        const button = [...document.querySelectorAll('button')].find(
          (candidate) => candidate.textContent?.includes('Generate token')
        );
        return Boolean(
          button &&
            !button.disabled &&
            Object.keys(button).some((key) => key.startsWith('__reactProps$'))
        );
      }
    );
    await email.press('Enter');
    await page.locator('[aria-busy="true"]').waitFor();
    await page.getByText('Token ready for the fingerprint request').waitFor();
    await page
      .getByRole('button', { name: 'Test API now' })
      .waitFor({ state: 'visible', timeout: 90_000 });
    assert(
      await page.getByRole('button', { name: 'Test API now' }).isEnabled(),
      'fingerprint endpoint did not become runnable'
    );
    const memoryState = await page.evaluate(() => ({
      url: location.href,
      local: JSON.stringify(localStorage),
      session: JSON.stringify(sessionStorage),
    }));
    assert(!memoryState.url.includes('qa'), 'token or email leaked into URL');
    assert(!memoryState.local.includes('qa'), 'token leaked into localStorage');
    assert(
      !memoryState.session.includes('qa'),
      'token leaked into sessionStorage'
    );

    await page.getByRole('button', { name: 'Test API now' }).click();
    await page
      .getByText('The request completed successfully.')
      .waitFor({ state: 'visible' });
    await page.getByLabel('API response body').focus();

    tokenMode = 'error';
    await email.press('Enter');
    await page.getByRole('alert').waitFor();
    await page.getByText('Token request denied.', { exact: true }).waitFor();

    tokenMode = 'abort';
    await email.press('Enter');
    await page.getByText('The request failed. Review the response body.').waitFor();
    await context.close();
  });

  await check('mobile navigation, focus return, keyboard, and overflow', async () => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      serviceWorkers: 'block',
    });
    await installCommonApiMocks(context);
    const page = await context.newPage();
    activePage = page;
    for (const route of [
      '/',
      '/checker',
      '/ip',
      '/ip-lookup/how-to-tell-if-an-ip-is-a-proxy',
      '/fingerprint/canvas',
      '/playground',
    ]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await expectSingleH1(page);
      await expectNoRootOverflow(page);
    }
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Open navigation menu' });
    await page.waitForFunction(() => {
      const button = document.querySelector(
        'button[aria-label="Open navigation menu"]'
      );
      return (
        button !== null &&
        Object.keys(button).some((key) => key.startsWith('__reactProps$'))
      );
    });
    await trigger.focus();
    await trigger.press('Enter');
    await page.locator('[role="dialog"]').waitFor({ state: 'visible' });
    await page.waitForTimeout(250);
    assert(
      await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog?.contains(document.activeElement) ?? false;
      }),
      'mobile navigation did not move focus inside the dialog'
    );
    await page.keyboard.press('Escape');
    await page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
    assert(await trigger.evaluate((element) => element === document.activeElement),
      'mobile navigation did not return focus to its trigger'
    );
    await context.close();
  });

  await check('reduced motion contract', async () => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce',
    });
    await installCommonApiMocks(context);
    const page = await context.newPage();
    activePage = page;
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const motion = await page.evaluate(() => ({
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: getComputedStyle(document.body).transitionDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    assert(motion.matches, 'browser did not expose reduced motion');
    assert(motion.scrollBehavior === 'auto', 'smooth scrolling was not disabled');
    await context.close();
  });

  await check('service worker update toast and refresh action', async () => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    await context.addInitScript(() => {
      class FakeEvents {
        constructor() {
          this.listeners = new Map();
        }

        addEventListener(type, callback) {
          const callbacks = this.listeners.get(type) ?? [];
          callbacks.push(callback);
          this.listeners.set(type, callbacks);
        }

        emit(type) {
          for (const callback of this.listeners.get(type) ?? []) callback();
        }
      }

      const worker = new FakeEvents();
      worker.state = 'installing';
      worker.postMessage = (message) => window.__qaServiceWorker.messages.push(message);
      const registration = new FakeEvents();
      registration.installing = worker;
      registration.active = worker;
      const serviceWorker = new FakeEvents();
      serviceWorker.controller = {};
      serviceWorker.ready = Promise.resolve(registration);
      serviceWorker.register = async () => {
        window.__qaServiceWorker.registered = true;
        return registration;
      };
      serviceWorker.getRegistration = async () => registration;
      window.__qaServiceWorker = {
        registered: false,
        messages: [],
        trigger() {
          registration.emit('updatefound');
          worker.state = 'installed';
          worker.emit('statechange');
        },
      };
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: serviceWorker,
      });
    });
    const page = await context.newPage();
    activePage = page;
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__qaServiceWorker?.registered);
    await page.evaluate(() => window.__qaServiceWorker.trigger());
    await page.getByText('A new version of CreepJS is available').waitFor();
    await page.getByRole('button', { name: 'Refresh' }).click();
    assert(
      await page.evaluate(
        () =>
          window.__qaServiceWorker.messages.some(
            (message) => message?.type === 'SKIP_WAITING'
          )
      ),
      'service worker refresh action did not request SKIP_WAITING'
    );
    await context.close();
  });

  activePage = null;
  await desktop.close();
  await browser.close();

  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    passed: results.filter((result) => result.status === 'pass').length,
    failed: results.filter((result) => result.status === 'fail').length,
    results,
  };
  fs.writeFileSync(
    path.join(artifactDir, 'summary.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.failed > 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
