import Link from 'next/link';
import { CopyButton } from '@/components/CopyButton';
import { DocsSectionAnalytics } from '@/components/DocsSectionAnalytics';
import { SITE_CONFIG } from '@/lib/metadata';

function Example({ title, code }: { title: string; code: string }) {
  return (
    <div className="min-w-0 space-y-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <CopyButton
          value={code}
          label="Copy example"
          variant="outline"
          ariaLabel={`Copy ${title}`}
        />
      </div>
      <pre
        className="bg-muted max-h-96 max-w-full overflow-auto rounded-lg p-4 font-mono text-xs"
        tabIndex={0}
        aria-label={title}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  const apiUrl = SITE_CONFIG.apiUrl;
  const sdkExample = `<script src="https://creepjs.org/sdk.js"></script>
<label>API token <input id="token" type="password" autocomplete="off"></label>
<button id="check" type="button">Collect & submit</button>
<output id="result" aria-live="polite"></output>
<script>
  const button = document.querySelector('#check');
  const output = document.querySelector('#result');
  button.addEventListener('click', async () => {
    const token = document.querySelector('#token').value.trim();
    if (!token) { output.textContent = 'Enter an API token.'; return; }
    button.disabled = true;
    output.textContent = 'Collecting and submitting…';
    try {
      // Run only after the visitor agrees to collection and API submission.
      const client = new CreepJS.CreepJS({ token, cache: false });
      const result = await client.getFingerprint();
      output.textContent = 'Diagnostic ID: ' + result.fingerprintId;
    } catch {
      output.textContent = 'Request failed. Check the token and connection, then retry.';
    } finally {
      button.disabled = false;
    }
  });
</script>`;
  const localExample = `<script src="https://creepjs.org/sdk.full.js"></script>
<button id="inspect" type="button">Inspect locally</button>
<output id="local-result" aria-live="polite"></output>
<script>
  const button = document.querySelector('#inspect');
  const output = document.querySelector('#local-result');
  button.addEventListener('click', async () => {
    button.disabled = true;
    output.textContent = 'Collecting…';
    try {
      const result = await CreepJSFull.collectFingerprint();
      output.textContent = 'Diagnostic ID: ' + result.fingerprintId;
    } catch {
      output.textContent = 'Collection failed. Retry or inspect individual signals.';
    } finally { button.disabled = false; }
  });
</script>`;
  const ipExample = `curl --fail-with-body --max-time 15 '${apiUrl}/v1/ip/8.8.8.8' \\
  -H 'X-API-Token: YOUR_API_TOKEN'`;

  return (
    <div
      id="docs-tabs-root"
      className="container mx-auto max-w-6xl space-y-7 px-4 py-7 md:px-8 md:py-10"
    >
      <DocsSectionAnalytics
        rootId="docs-tabs-root"
        defaultSection="quickstart"
      />
      <header className="max-w-3xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Documentation
        </h1>
        <p className="text-muted-foreground leading-7">
          Run a browser check, integrate the SDK, or call the IP API. Start with
          a working example, then check the data flow and error behavior.
        </p>
      </header>
      <nav aria-label="Documentation sections" className="flex flex-wrap gap-2">
        {[
          ['quickstart', 'Quick start'],
          ['api', 'API reference'],
          ['collectors', 'Read the output'],
          ['faq', 'Fix a failed request'],
          ['introduction', 'Privacy & limits'],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            data-docs-tab={id}
            className="hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-medium"
          >
            {label}
          </a>
        ))}
      </nav>
      <section
        id="quickstart"
        className="section-anchor space-y-4"
        aria-labelledby="quickstart-title"
      >
        <div className="space-y-2">
          <h2 id="quickstart-title" className="text-xl font-bold">
            Choose your first result
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                '/checker',
                'Inspect this browser',
                'Local report; no API token.',
              ],
              [
                '/playground',
                'Test the API in your browser',
                'Paste a token and send a snapshot.',
              ],
              ['/ip', 'Check an IP address', 'A free single-address lookup.'],
            ].map(([href, title, detail]) => (
              <Link
                key={href}
                href={href}
                className="hover:bg-muted/40 space-y-2 rounded-lg border p-4"
              >
                <span className="text-primary block text-sm font-semibold">
                  {title}
                </span>
                <span className="text-muted-foreground block text-sm leading-6">
                  {detail}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground max-w-3xl text-sm leading-6">
          For an HTML page, use the hosted SDK below. Its small loader fetches
          the full collectors when you first run a scan. The npm package is not
          published yet; a package-install instruction is not required for this
          example.
        </p>
        <Example
          title="HTML · collect and submit with the SDK"
          code={sdkExample}
        />
        <p className="text-muted-foreground text-sm leading-6">
          This example transmits the complete collected payload to the API. Full
          scans include a Google STUN request. Use a test token and collect only
          after your own disclosure and consent requirements are satisfied.
          Browser tokens can be inspected by page scripts.
        </p>
        <details className="rounded-xl border p-4">
          <summary className="cursor-pointer font-medium">
            Need a local report without an API submission?
          </summary>
          <div className="space-y-3 pt-4">
            <p className="text-muted-foreground text-sm leading-6">
              This version computes a report locally and does not send it to the
              CreepJS API. Its WebRTC collector still contacts Google STUN
              servers.
            </p>
            <Example title="HTML · local collection only" code={localExample} />
          </div>
        </details>
      </section>
      <section
        id="api"
        className="section-anchor space-y-4 border-t pt-6"
        aria-labelledby="api-title"
      >
        <h2 id="api-title" className="text-xl font-bold">
          API reference
        </h2>
        <p className="text-muted-foreground text-sm leading-6">
          Base URL: <code className="break-all">{apiUrl}</code>. Authenticated
          requests use <code>X-API-Token</code>. Public IP and own-IP lookups do
          not need a token.
        </p>
        <div
          className="max-w-full overflow-x-auto rounded-lg border"
          tabIndex={0}
          aria-label="API endpoints"
        >
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">
              Endpoints, inputs, authentication, and returned output
            </caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="p-3">
                  Endpoint
                </th>
                <th scope="col" className="p-3">
                  Input &amp; access
                </th>
                <th scope="col" className="p-3">
                  Output &amp; limits
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                [
                  'POST /v1/token',
                  'JSON: { email }. No existing token.',
                  'Token is returned here, not emailed. Issuance limits apply.',
                ],
                [
                  'POST /v1/fingerprint',
                  'A real collected snapshot; token required.',
                  'Recalculated ID, data, coverage, timings. Maximum 128 KiB.',
                ],
                [
                  'GET /my-ip',
                  'No address or token needed.',
                  'Your public IP, approximate location, and optional risk context.',
                ],
                [
                  'GET /v1/ip/public/:ip',
                  'One IPv4 or IPv6 literal; no token.',
                  'IP report. 30 lookups per visitor per day.',
                ],
                [
                  'GET /v1/ip/:ip',
                  'One IPv4 or IPv6 literal; token required.',
                  'IP report with daily quota metadata.',
                ],
                [
                  'POST /v1/ip/batch',
                  'JSON: { ips: [...] }; token required.',
                  'Up to 50 entries. Per-row outcomes; partial results stay usable.',
                ],
              ].map(([endpoint, input, output]) => (
                <tr key={endpoint}>
                  <th scope="row" className="p-3 font-mono text-xs font-medium">
                    {endpoint}
                  </th>
                  <td className="p-3 leading-6">{input}</td>
                  <td className="p-3 leading-6">{output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          Authenticated requests share an allowance of 1,000 requests per day
          across tokens issued to the same email. Batch responses expose charged
          and skipped outcomes; use the returned quota fields rather than
          assuming every row succeeded.
        </p>
        <Example title="cURL · authenticated IP lookup" code={ipExample} />
        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer font-medium">
            SDK cache and request options
          </summary>
          <dl className="grid gap-4 pt-3 text-sm sm:grid-cols-2">
            {[
              [
                'cache',
                'Defaults to true. Set false for a new collection and API request.',
              ],
              [
                'cacheTtl',
                'Seconds, default 86400; capped at 7 days. Zero disables caching.',
              ],
              [
                'timeoutMs',
                'Bounds the API request. Handle timeout as an uncertain request outcome.',
              ],
              [
                'fullBundleUrl',
                'Defaults to the sibling sdk.full.js. Set it when self-hosting collector assets.',
              ],
            ].map(([name, detail]) => (
              <div key={name}>
                <dt className="font-mono font-semibold">{name}</dt>
                <dd className="text-muted-foreground mt-1 leading-6">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </section>
      <section
        id="collectors"
        className="section-anchor max-w-3xl space-y-3 border-t pt-6"
        aria-labelledby="output-title"
      >
        <h2 id="output-title" className="text-xl font-bold">
          Read the output before making a decision
        </h2>
        <dl className="space-y-3 text-sm">
          {[
            [
              'fingerprintId',
              'A diagnostic ID derived from the submitted components. Changes in environment or available signals can change it.',
            ],
            [
              'data',
              'The actual observed collector values. Missing APIs and false or zero values must remain distinct.',
            ],
            [
              'coverage / confidence',
              'Collection completion, not a uniqueness estimate or probability of fraud. Inspect successful, failed, and skipped counts.',
            ],
            [
              'collectors / timings',
              'Per-collector outcomes and duration. Use these to investigate a partial scan before comparing IDs.',
            ],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="font-mono font-semibold">{term}</dt>
              <dd className="text-muted-foreground mt-1 leading-6">{detail}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/fingerprint"
          className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Find the method and limits for each signal
        </Link>
      </section>
      <section
        id="faq"
        className="section-anchor space-y-4 border-t pt-6"
        aria-labelledby="recovery-title"
      >
        <h2 id="recovery-title" className="text-xl font-bold">
          Fix a failed request
        </h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            [
              '400 · invalid input',
              'Check the returned validation details. IP tools accept address literals, not URLs, hostnames, ports, or ranges.',
            ],
            [
              '401 · token rejected',
              'Replace the token and retry. Never put the token in a query string.',
            ],
            [
              '413 · payload too large',
              'The fingerprint endpoint accepts at most 128 KiB. Inspect the actual collected JSON before resubmitting.',
            ],
            [
              '429 · quota reached',
              'Wait for the returned retry or reset time. Generating more tokens for the same inbox does not increase its allowance.',
            ],
            [
              'Network error or timeout',
              'Keep inputs and retry manually when ready. A timed-out POST may have been processed; do not replay it automatically.',
            ],
            [
              'Partial or missing data',
              'Keep available fields, mark missing fields unknown, and retry failed rows or collectors independently. Missing evidence is not proof of safety.',
            ],
          ].map(([name, detail]) => (
            <div key={name} className="rounded-lg border p-4">
              <dt className="font-semibold">{name}</dt>
              <dd className="text-muted-foreground mt-2 leading-6">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section
        id="introduction"
        className="section-anchor max-w-3xl space-y-3 border-t py-6"
        aria-labelledby="privacy-title"
      >
        <h2 id="privacy-title" className="text-xl font-bold">
          Privacy &amp; interpretation limits
        </h2>
        <p className="text-muted-foreground text-sm leading-7">
          Browser fingerprinting combines observable rendering, environment, and
          capability signals. It does not prove a person’s identity. Private
          browsing can isolate stored data while leaving many browser values
          observable.
        </p>
        <p className="text-muted-foreground text-sm leading-7">
          Local collectors do not require an API token. SDK submission sends the
          collected payload to the API, which validates it and records coarse
          aggregate comparison statistics. Token records contain the email and
          creation time. IP reports may be cached. SDK caching is local to the
          browser; set cache to false if you do not want it.
        </p>
        <p className="text-muted-foreground text-sm leading-7">
          <Link
            href="/privacy"
            className="text-primary underline underline-offset-4"
          >
            Read data handling and retention
          </Link>
          . Use the{' '}
          <Link
            href="/checker"
            className="text-primary underline underline-offset-4"
          >
            checker
          </Link>{' '}
          to compare observed settings before drawing a conclusion from a score.
        </p>
      </section>
    </div>
  );
}
