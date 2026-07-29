## Context

Google's July 2026 guidance states that generative-search visibility uses the
normal Search foundation and that `llms.txt` is not used by Google Search.
OpenAI, Anthropic, Perplexity, and Google publish separate crawler or control
tokens with different purposes. CreepJS currently allows all crawlers through a
wildcard rule, so explicit groups document product policy rather than create a
ranking advantage.

The 55 Markdown mirrors are already public, but a source audit found
unsupported exact rates, market forecasts, and false first-person test claims.
They cannot become an AI-facing full-text feed or HTML source until cleaned.

## Goals / Non-Goals

- Goals:
  - expose the real static tool and signal surface to crawlers and agents
  - provide deterministic, attributable navigation and safe text exports
  - answer the four core jobs in rendered HTML with concise named anchors
  - disambiguate the product entity and enforce one brand spelling
  - fail builds when fingerprint content violates evidence or honesty rules
- Non-goals:
  - promise rankings, citations, traffic, or crawler behavior
  - create AI-only pages, tiny "chunks", query-variation fan-out, or new schema
  - publish unreviewed generated prose or preserve fabricated statistics

## Decisions

### Crawler policy

`robots.ts` keeps the wildcard rule and adds explicit allow groups for the
official tokens confirmed on the review date:

- OpenAI: `OAI-SearchBot`, `GPTBot`, `ChatGPT-User`
- Anthropic: `ClaudeBot`, `Claude-SearchBot`, `Claude-User`
- Perplexity: `PerplexityBot`, `Perplexity-User`
- Google: `Google-Extended`

Each explicit group repeats the `/api/*` and `/v1/*` disallows so a more
specific group cannot accidentally broaden restricted web paths. A code comment
records the policy purpose, source links, and `2026-07-28` review date.
User-triggered fetchers may ignore robots.txt; the file expresses preference,
not an enforcement or identity-verification boundary.

### Machine-readable navigation

`llms.txt` is a deterministic build artifact derived from
`STATIC_SEO_ROUTES` and `FINGERPRINT_TECHNIQUES`. It includes:

- a short product/entity block
- all non-legal tools and guides
- all signal pages grouped by category
- both canonical HTML and deployed Markdown mirror URLs
- API/docs links and the `llms-full.txt` pointer
- a clear note that this is an interoperability aid, not a Google ranking
  mechanism

`llms-full.txt` is a static route. It reads signal Markdown at build time in
canonical manifest order and concatenates only content that passes the
fingerprint content-quality gate.

### Content-quality gate

The Markdown corpus is treated as public product content, not trusted build
input. A deterministic validator runs in tests/build and rejects:

- first-person claims of tests, studies, measurements, or proprietary findings
  without a checked evidence record
- unsupported percentages, accuracy/uniqueness/match-rate claims, market
  forecasts, and fabricated sample sizes
- undated current-version claims, invented citations, and ranking promises
- unsupported fraud-probability claims

The implementation may replace the current generated long-form corpus with
concise signal references backed by the canonical manifest and the working live
collector. Distinct tool output is the page's utility; prose needs only explain
purpose, method, limitations, and safe interpretation. The full-text route
fails closed if any expected file is missing or fails validation.

### Answer anchors and entity identity

Four visible server-rendered blocks remain at or gain these stable anchors:

- `/#what-is-creepjs`
- `/checker#what-does-the-checker-report`
- `/ip#how-ip-risk-is-scored`
- `/ip-lookup/how-to-tell-if-an-ip-is-a-proxy#how-to-tell`

Each answer is self-contained, names CreepJS, stays concise, and makes no
unsupported uniqueness or fraud claim.

The homepage visibly states that CreepJS.org is this privacy diagnostic and API,
while Abraham Juliot maintains a separate open-source research project with the
same name. Product structured data uses only product-owned `sameAs` URLs.
Visible UI and exported reports use `CreepJS`, not `CreepJS 2.0`.

### Schema restraint

No new `FAQPage`, `HowTo`, or `Dataset` markup is emitted. `Dataset` remains
blocked while uniqueness samples are below the k-anonymous baseline and there
is no publishable dataset contract. Structured data must mirror visible
supported entities only.

## Risks / Trade-offs

- Explicit allow groups are redundant with the wildcard today, but make policy
  reviewable and prevent future wildcard changes from silently changing intent.
- `llms.txt` support varies and Google explicitly ignores it; value is limited
  to systems that choose to consume it and to deterministic content discovery.
- Cleaning the Markdown corpus reduces keyword-heavy prose, but removes
  fabricated evidence and makes the working collector—not commodity text—the
  durable value.

## Rollout

1. Approve and strictly validate the change.
2. Clean and gate the signal Markdown corpus.
3. Land crawler, llms, answer, entity, and schema-restraint changes.
4. Run repository gates and static-output assertions.
5. Verify the deployed files, crawler access, answer anchors, and schema in the
   managed Pages preview before production rollout.
