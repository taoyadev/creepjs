import Link from 'next/link';
import { PartnerCards } from '@/components/partners/PartnerCards';
import { PartnerTrackingProvider } from '@/components/partners/PartnerTracking';
import { StructuredData } from '@/components/StructuredData';
import { generateMetadata, structuredData } from '@/lib/metadata';
import { providersForPlacement } from '@/lib/proxy-providers';

const path = '/guide/static-vs-rotating-proxies';
const title = 'Static vs rotating proxies';
const description =
  'Choose proxy session behavior separately from network type, compare billing units, and test your own requirements without assuming a proxy changes your browser fingerprint.';
export const metadata = generateMetadata({ title, description, path });

export default function ProxySelectionGuide() {
  return (
    <PartnerTrackingProvider>
      <StructuredData
        data={structuredData.webPage({ name: title, description, path })}
      />
      <article className="container mx-auto max-w-4xl space-y-8 px-4 py-7 md:px-8 md:py-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground leading-7">
            Choose a stable exit when continuity matters. Choose rotation when
            your authorized task needs different exits. Check the actual session
            policy before treating either label as a guarantee.
          </p>
          <p className="text-muted-foreground text-sm">
            Reviewed <time dateTime="2026-10-29">October 29, 2026</time> ·
            Selection guidance, not a provider performance review
          </p>
        </header>
        <section className="space-y-4" aria-labelledby="behavior-heading">
          <h2 id="behavior-heading" className="text-2xl font-semibold">
            Exit behavior and network type are different choices
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border p-5">
              <h3 className="font-semibold">Static or sticky</h3>
              <p className="text-muted-foreground text-sm leading-7">
                A static allocation aims to keep an assigned exit. A sticky
                session asks a service to reuse an exit across requests for a
                supported period. A sticky session on a rotating pool is not a
                permanent allocation.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border p-5">
              <h3 className="font-semibold">Rotating</h3>
              <p className="text-muted-foreground text-sm leading-7">
                A service can select a different exit per request, session, or
                configured interval. Confirm which behavior applies to your
                product and connection method; the word “rotating” alone does
                not specify it.
              </p>
            </div>
          </div>
          <p className="text-muted-foreground leading-7">
            Residential, ISP, and datacenter describe the network or product
            category. Static and rotating describe how exits are used. Compare
            these dimensions separately: one category can offer more than one
            session mode. For a concrete example, the{' '}
            <a
              href="https://developers.oxylabs.io/help-center/products-and-features/how-to-use-session-control"
              className="text-primary underline"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            >
              Oxylabs session-control documentation
            </a>{' '}
            describes session control across several product categories. This
            source is a technical reference, not a partnership claim.
          </p>
        </section>
        <section
          className="space-y-4 border-t pt-6"
          aria-labelledby="needs-heading"
        >
          <h2 id="needs-heading" className="text-2xl font-semibold">
            Start with continuity and coverage
          </h2>
          <ul className="list-disc space-y-3 pl-5 leading-7">
            <li>
              <strong>
                Allowlisted integrations or a repeatable regional QA setup:
              </strong>{' '}
              investigate a stable exit and confirm the allocation, replacement,
              and renewal policy.
            </li>
            <li>
              <strong>
                A multi-step session on a system you are authorized to test:
              </strong>{' '}
              check session lifetime, idle timeout, and what happens if the exit
              disconnects. Keep your application session requirements separate
              from proxy session controls.
            </li>
            <li>
              <strong>Tests across multiple exits or regions:</strong>{' '}
              investigate rotation and region targeting. Record the exits
              actually observed; a pool size does not prove your test received
              distinct or suitable addresses.
            </li>
          </ul>
          <p className="text-muted-foreground text-sm leading-7">
            Confirm the provider’s acceptable-use rules and your authorization
            for the target system. A new exit does not grant permission or
            guarantee access.
          </p>
        </section>
        <section
          className="space-y-4 border-t pt-6"
          aria-labelledby="budget-heading"
        >
          <h2 id="budget-heading" className="text-2xl font-semibold">
            Compare the bill, not just the advertised unit
          </h2>
          <p className="text-muted-foreground leading-7">
            Ask whether the plan bills by traffic, allocated IP, time, or
            requests. Then check minimum purchase, unused-credit expiry,
            renewal, concurrency, and which failed attempts or retries consume
            the allowance. Protocol support and refund eligibility are
            product-specific: confirm them in current official terms.
          </p>
          <p className="text-muted-foreground leading-7">
            Estimate your own expected traffic and test duration before
            comparing plans. A per-GB price and a per-IP monthly price answer
            different questions; neither alone tells you the cost of a completed
            task. This guide does not promise a trial, discount, or refund.
          </p>
        </section>
        <section
          className="space-y-4 border-t pt-6"
          aria-labelledby="test-heading"
        >
          <h2 id="test-heading" className="text-2xl font-semibold">
            Run a small, repeatable evaluation
          </h2>
          <ol className="list-decimal space-y-3 pl-5 leading-7">
            <li>
              Define the permitted target, region, protocol, session duration,
              request count, and budget before testing.
            </li>
            <li>
              Check the exit you actually use with the{' '}
              <Link href="/ip" className="text-primary underline">
                IP Risk Checker
              </Link>
              . A classification is one provider’s observation, not a guarantee
              that a service will work.
            </li>
            <li>
              On your authorized target, measure response time, failures,
              retries, and completed tasks using the same workload and time
              window for each option. Define success before counting it.
            </li>
            <li>
              Repeat after an idle period and a reconnect. Record whether the
              exit changed and whether your multi-step task continued.
            </li>
            <li>
              Compare billed usage with the recorded requests. Keep uncertainty
              visible if the sample is small or the target changed during the
              test.
            </li>
          </ol>
          <p className="text-muted-foreground text-sm leading-7">
            These are evaluation steps, not results of tests performed by
            CreepJS.org. For missing or conflicting evidence, read{' '}
            <Link
              href="/ip-lookup/how-to-tell-if-an-ip-is-a-proxy"
              className="text-primary underline"
            >
              how to interpret proxy signals
            </Link>
            .
          </p>
        </section>
        <section
          className="space-y-4 border-t pt-6"
          aria-labelledby="fingerprint-heading"
        >
          <h2 id="fingerprint-heading" className="text-2xl font-semibold">
            A proxy does not reset your browser fingerprint
          </h2>
          <p className="text-muted-foreground leading-7">
            Changing the network exit does not directly change your installed
            fonts or Canvas rendering. Browser and operating-system features are
            separate fingerprinting inputs, as explained in{' '}
            <a
              href="https://developer.mozilla.org/en-US/docs/Glossary/Fingerprinting"
              className="text-primary underline"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            >
              MDN’s fingerprinting overview
            </a>
            . Our guidance is to inspect network and browser changes separately;
            buying a proxy is not a guaranteed privacy fix.
          </p>
          <Link
            href="/guide/what-is-browser-fingerprinting"
            className="text-primary inline-flex min-h-11 items-center underline"
          >
            Understand browser fingerprinting
          </Link>
        </section>
        <section
          className="space-y-4 border-t pt-6"
          aria-labelledby="partners-heading"
        >
          <h2 id="partners-heading" className="text-2xl font-semibold">
            Review partner information
          </h2>
          <p className="text-muted-foreground leading-7">
            The{' '}
            <Link href="/proxy-providers" className="text-primary underline">
              proxy provider directory
            </Link>{' '}
            lists reviewed partner information, sources, and limitations when
            available. We may earn a commission from qualifying purchases
            through disclosed partner links. Partnerships do not affect
            diagnostic results.
          </p>
          {providersForPlacement('partner-guide').length > 0 && (
            <PartnerCards placement="partner-guide" />
          )}
        </section>
      </article>
    </PartnerTrackingProvider>
  );
}
