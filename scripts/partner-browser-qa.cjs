const fs = require('node:fs');
const path = require('node:path');

module.exports = async function partnerChecks({
  browser,
  base,
  check,
  assert,
  mockApi,
  artifacts,
}) {
  const directory = '/proxy-providers';
  const guide = '/guide/static-vs-rotating-proxies';
  const fixture = process.env.QA_PARTNER_FIXTURE === '1';
  const runtimeErrors = [];
  const createContext = async (options) => {
    const context = await browser.newContext(options);
    context.on('page', (target) =>
      target.on('pageerror', (error) => runtimeErrors.push(error.message))
    );
    return context;
  };
  const hasProviders = fs
    .readFileSync(path.resolve('apps/web/out/proxy-providers.html'), 'utf8')
    .includes('data-partner-id=');
  const evidence = [];
  const until = async (condition) => {
    for (let i = 0; i < 100; i++) {
      if (condition()) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Expected event did not arrive');
  };
  const snapshot = (target) =>
    target.locator('main').evaluate((node) => {
      // noscript intentionally has different parsing/display under JS. Compare
      // business content; check the no-JS notice and JSON-LD separately.
      const content = node.cloneNode(true);
      content
        .querySelectorAll('script, style, noscript')
        .forEach((item) => item.remove());
      return {
        text: content.textContent.replace(/\s+/g, ' ').trim(),
        schemas: [
          ...node.querySelectorAll('script[type="application/ld+json"]'),
        ].map((item) => item.textContent),
        ids: [...node.querySelectorAll('[data-partner-id]')].map(
          (item) => item.dataset.partnerId
        ),
        dates: [...node.querySelectorAll('time')].map((item) => item.dateTime),
        hrefs: [...node.querySelectorAll('a')].map((item) =>
          item.getAttribute('href')
        ),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });

  await check(
    'partner pages: static/bootstrap/settled parity, metadata, and zero merchant prefetch',
    async () => {
      const noJs = await createContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
        serviceWorkers: 'block',
      });
      const context = await createContext({
        viewport: { width: 390, height: 844 },
        serviceWorkers: 'block',
      });
      const state = {};
      await mockApi(context, state);
      const external = [];
      context.on('request', (request) => {
        if (
          !request.url().startsWith(base) &&
          !request.url().startsWith('https://api.creepjs.org/v1/events') &&
          !request.url().startsWith('https://static.cloudflareinsights.com/')
        )
          external.push(request.url());
      });
      const target = await context.newPage();
      const staticPage = await noJs.newPage();
      try {
        for (const route of [directory, guide]) {
          await staticPage.goto(base + route);
          const first = await snapshot(staticPage);
          assert(
            await staticPage
              .getByText(
                'Live checks, filters, and copy controls require JavaScript. You can still read signal methods, documentation, and policies.',
                { exact: true }
              )
              .isVisible(),
            'no-JS fallback notice is missing'
          );
          await target.goto(base + route, { waitUntil: 'domcontentloaded' });
          const bootstrap = await snapshot(target);
          await target.waitForLoadState('networkidle');
          const settled = await snapshot(target);
          evidence.push({ route, first, bootstrap, settled });
          assert(
            JSON.stringify(first) === JSON.stringify(bootstrap) &&
              JSON.stringify(first) === JSON.stringify(settled),
            route +
              ': first-frame parity drift in ' +
              Object.keys(first)
                .filter(
                  (key) =>
                    JSON.stringify(first[key]) !==
                      JSON.stringify(bootstrap[key]) ||
                    JSON.stringify(first[key]) !== JSON.stringify(settled[key])
                )
                .join(', ')
          );
          assert(!first.overflow, route + ': first-frame overflow');
          assert((await target.locator('h1').count()) === 1, route + ': H1');
          assert(
            (await target
              .locator('link[rel="canonical"]')
              .getAttribute('href')) ===
              'https://creepjs.org' + route,
            route + ': canonical'
          );
          if (route === directory) {
            const count = first.ids.length;
            assert(
              fixture
                ? count === 3
                : !first.ids.some((id) => id.startsWith('qa-provider-')),
              'unexpected catalog / synthetic fixture leaked'
            );
            const robots = await target
              .locator('meta[name="robots"]')
              .getAttribute('content');
            assert(
              robots.includes('noindex') === !count,
              'directory index state'
            );
            const sitemap = await (
              await context.request.get(base + '/sitemap.xml')
            ).text();
            assert(
              sitemap.includes('https://creepjs.org/proxy-providers') ===
                Boolean(count),
              'directory sitemap state'
            );
          }
          await staticPage.screenshot({
            path: path.join(
              artifacts,
              'partner-no-js-' +
                (route === directory ? 'directory' : 'guide') +
                '.png'
            ),
            fullPage: true,
          });
        }
        assert(
          external.length === 0,
          'unexpected external reads: ' + external.join(', ')
        );
        assert(
          state.calls.every((call) => call.path === '/v1/events'),
          'commercial read called a diagnostic/truth API'
        );
      } finally {
        await noJs.close();
        await context.close();
      }
    }
  );

  await check(
    'partner layouts: 390/768/1024/1440, both themes, navigation and focus',
    async () => {
      for (const theme of ['light', 'dark']) {
        const context = await createContext({
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        await mockApi(context, {});
        const target = await context.newPage();
        try {
          for (const width of [390, 768, 1024, 1440]) {
            await target.setViewportSize({ width, height: 900 });
            for (const route of [directory, guide]) {
              await target.goto(base + route, { waitUntil: 'networkidle' });
              assert(
                await target.evaluate(
                  () => document.documentElement.scrollWidth <= innerWidth + 1
                ),
                width + '/' + theme + ': overflow'
              );
              const navLink = target.locator(
                'nav[aria-label="Main navigation"] a[href="/proxy-providers"]'
              );
              const mobile = width < (hasProviders ? 1280 : 768);
              assert(
                (await navLink.count()) === (hasProviders ? 1 : 0),
                'directory navigation visibility'
              );
              if (mobile) {
                const trigger = target.getByRole('button', {
                  name: 'Open navigation menu',
                });
                await trigger.click();
                if (hasProviders && route === directory)
                  assert(
                    (await target
                      .getByRole('dialog')
                      .locator('a[href="/proxy-providers"]')
                      .getAttribute('aria-current')) === 'page',
                    'mobile active item'
                  );
                await target.keyboard.press('Escape');
                assert(
                  await trigger.evaluate(
                    (node) => node === document.activeElement
                  ),
                  'focus did not return'
                );
              } else if (hasProviders && route === directory)
                assert(
                  (await navLink.getAttribute('aria-current')) === 'page',
                  'desktop active item'
                );
              await target.keyboard.press('Tab');
              assert(
                await target.evaluate(() => {
                  const style = getComputedStyle(document.activeElement);
                  return (
                    style.outlineStyle !== 'none' || style.boxShadow !== 'none'
                  );
                }),
                'keyboard focus not visible'
              );
              await target.screenshot({
                path: path.join(
                  artifacts,
                  `partner-${route === directory ? 'directory' : 'guide'}-${width}-${theme}.png`
                ),
                fullPage: true,
              });
            }
          }
        } finally {
          await context.close();
        }
      }
    }
  );

  if (fixture) {
    await check(
      'fixture partners: IP result order, unknown/high risk, remount dedupe and error isolation',
      async () => {
        const context = await createContext({
          viewport: { width: 1440, height: 900 },
          serviceWorkers: 'block',
        });
        const state = {};
        await mockApi(context, state);
        const target = await context.newPage();
        try {
          await target.goto(base + '/ip?q=8.8.8.8', {
            waitUntil: 'networkidle',
          });
          const cards = target.locator(
            '[data-partner-placement="partner-ip-result"]'
          );
          assert(
            (await cards.count()) === 2,
            'IP recommendations must cap at two'
          );
          const expected = await cards.evaluateAll((nodes) =>
            nodes.map((node) => node.dataset.partnerId)
          );
          assert(
            state.events.filter((event) => event.name === 'partner_impression')
              .length === 0,
            'offscreen cards counted'
          );
          assert(
            await target.evaluate(() => {
              const method = [...document.querySelectorAll('summary')].find(
                (node) => node.textContent.includes('Method, freshness')
              );
              const card = document.querySelector('[data-partner-id]');
              return Boolean(
                method.compareDocumentPosition(card) &
                  Node.DOCUMENT_POSITION_FOLLOWING
              );
            }),
            'recommendations precede complete evidence/method'
          );
          await cards.first().scrollIntoViewIfNeeded();
          await until(
            () =>
              state.events.filter(
                (event) => event.name === 'partner_impression'
              ).length === 2
          );
          for (const mode of ['partial', 'high', undefined]) {
            state.ipMode = mode;
            await target
              .getByRole('button', { name: 'Check IP Risk', exact: true })
              .click();
            await cards.first().waitFor();
            await cards.first().scrollIntoViewIfNeeded();
            await target.waitForLoadState('networkidle');
            assert(
              JSON.stringify(
                await cards.evaluateAll((nodes) =>
                  nodes.map((node) => node.dataset.partnerId)
                )
              ) === JSON.stringify(expected),
              'risk changed selection'
            );
          }
          assert(
            state.events.filter((event) => event.name === 'partner_impression')
              .length === 2,
            'requery duplicated impressions'
          );
          const reports = state.calls.filter((call) =>
            call.path.startsWith('/v1/ip/public/')
          );
          assert(reports.length === 4, 'promotion added IP lookups');
          await target.screenshot({
            path: path.join(artifacts, 'partner-ip-result.png'),
          });
          for (const mode of ['error', 'quota']) {
            state.ipMode = mode;
            await target
              .getByRole('button', { name: 'Check IP Risk', exact: true })
              .click();
            await target.getByRole('alert').first().waitFor();
            assert(
              (await cards.count()) === 0,
              'recommendations on failed lookup'
            );
          }
          state.ipMode = 'slow';
          await target
            .getByRole('button', { name: 'Check IP Risk', exact: true })
            .click();
          assert((await cards.count()) === 0, 'recommendations while loading');
          await target
            .getByRole('button', { name: 'Cancel', exact: true })
            .click();
          assert((await cards.count()) === 0, 'recommendations after cancel');
          for (const event of state.events.filter((event) =>
            event.props?.section?.startsWith('partner-')
          )) {
            assert(
              JSON.stringify(event).includes('8.8.8.8') === false &&
                event.path === '/ip',
              'diagnostic data leaked'
            );
            assert(
              Object.keys(event.props).sort().join(',') === 'label,section',
              'extra partner props'
            );
          }
        } finally {
          await context.close();
        }
      }
    );

    await check(
      'fixture partners: ordinary anchors, keyboard/middle clicks, dedupe and transport failures',
      async () => {
        const context = await createContext({ serviceWorkers: 'block' });
        const state = {};
        await mockApi(context, state);
        const outbound = [];
        let stage = 'keyboard';
        await context.route(/https:\/\/partner-.*\.test\//, async (route) => {
          const destination = {
            url: route.request().url(),
            referrer: route.request().headers().referer,
          };
          await route.fulfill({
            contentType: 'text/html',
            body: '<h1>Intercepted test destination</h1>',
          });
          outbound.push(destination);
        });
        const target = await context.newPage();
        try {
          await target.goto(base + '/ip?q=8.8.8.8', {
            waitUntil: 'networkidle',
          });
          const link = target.locator('a[data-partner-outbound]').first();
          assert(
            (await link.getAttribute('rel')) ===
              'sponsored noopener noreferrer',
            'sponsored protection'
          );
          assert(
            (await link.getAttribute('referrerpolicy')) === 'no-referrer',
            'referrer policy'
          );
          assert(
            !(await link.getAttribute('href')).includes('8.8.8.8'),
            'IP in href'
          );
          // New targets keep the same page instance so repeated activations can be measured.
          await link.evaluate((node) => (node.target = '_blank'));
          await link.focus();
          const first = context.waitForEvent('page');
          await target.keyboard.press('Enter');
          const popup = await first;
          await popup
            .getByRole('heading', { name: 'Intercepted test destination' })
            .waitFor();
          await popup.close();
          await until(() => outbound.length === 1);
          await until(
            () =>
              state.events.filter(
                (event) =>
                  event.name === 'link_clicked' &&
                  event.props.section === 'partner-ip-result'
              ).length === 1
          );
          // Restore the product's normal anchor before testing native middle-click.
          await link.evaluate((node) => node.removeAttribute('target'));
          stage = 'middle';
          const middle = context.waitForEvent('page');
          await link.click({ button: 'middle' });
          const second = await middle;
          // A background tab's paint is outside the site's handoff contract.
          // The fulfilled response proves navigation, and headers prove privacy.
          await until(() => outbound.length === 2);
          assert(
            second !== target,
            'middle-click did not open a separate page'
          );
          await second.close();
          assert(
            state.events.filter(
              (event) =>
                event.name === 'link_clicked' &&
                event.props.section === 'partner-ip-result'
            ).length === 1,
            'activation counted twice'
          );
          stage = 'failed-analytics';
          await context.route('https://api.creepjs.org/v1/events', (route) =>
            route.abort()
          );
          await target.goto(base + '/ip?q=8.8.8.8', {
            waitUntil: 'networkidle',
          });
          await target.locator('a[data-partner-outbound]').first().click();
          await target
            .getByRole('heading', { name: 'Intercepted test destination' })
            .waitFor();
          assert(
            outbound.every(
              (request) => !request.referrer && !request.url.includes('8.8.8.8')
            ),
            'referrer or diagnostic leak'
          );
        } catch (error) {
          throw new Error(
            stage +
              ': ' +
              error.message +
              '; destinations=' +
              JSON.stringify(outbound) +
              '; pages=' +
              JSON.stringify(context.pages().map((item) => item.url()))
          );
        } finally {
          fs.writeFileSync(
            path.join(artifacts, 'partner-link-evidence.json'),
            JSON.stringify({ stage, outbound, events: state.events }, null, 2)
          );
          await context.close();
        }
      }
    );

    await check(
      'fixture partners: DNT, GPC and missing observer preserve links',
      async () => {
        for (const mode of ['dnt', 'gpc', 'no-observer']) {
          const context = await createContext({ serviceWorkers: 'block' });
          await context.addInitScript((mode) => {
            if (mode === 'dnt')
              Object.defineProperty(navigator, 'doNotTrack', {
                get: () => '1',
              });
            if (mode === 'gpc')
              Object.defineProperty(navigator, 'globalPrivacyControl', {
                get: () => true,
              });
            if (mode === 'no-observer') window.IntersectionObserver = undefined;
          }, mode);
          const state = {};
          await mockApi(context, state);
          await context.route(/https:\/\/partner-.*\.test\//, (route) =>
            route.fulfill({
              contentType: 'text/html',
              body: '<h1>Test destination</h1>',
            })
          );
          const target = await context.newPage();
          try {
            await target.goto(base + directory, { waitUntil: 'networkidle' });
            await target.locator('a[data-partner-outbound]').first().click();
            await target
              .getByRole('heading', { name: 'Test destination' })
              .waitFor();
            if (mode === 'no-observer')
              assert(
                !state.events.some(
                  (event) => event.name === 'partner_impression'
                ),
                'inferred impression'
              );
            else assert(state.events.length === 0, mode + ': analytics sent');
          } finally {
            await context.close();
          }
        }
      }
    );
  }
  await check('partner pages: no browser runtime errors', async () => {
    assert(runtimeErrors.length === 0, runtimeErrors.join(' | '));
  });
  fs.writeFileSync(
    path.join(artifacts, 'partner-phase-evidence.json'),
    JSON.stringify(
      {
        fixture,
        targetKind: fixture ? 'synthetic-partner-fixture' : 'delivery-preview',
        evidence,
      },
      null,
      2
    )
  );
};
