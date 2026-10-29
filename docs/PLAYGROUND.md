# Playground guide

`/playground` has a server-rendered task shell and a client workspace. Collection
and API submission run only after an explicit action. All API credentials stay
in component memory and are cleared by reload.

## Complete a request

1. Paste an existing API token. The field is masked by default; its reveal and
   copy controls are explicit actions.
2. If a token is needed, open “Need a token? Request one,” supply an email,
   and submit. The API returns the token in this tab. It does not email it.
   The address is stored with the token, and tokens for the same inbox share
   the daily allowance.
3. Choose “Collect & send request.” The full browser scan includes Google STUN
   traffic; the collected payload is then sent to `POST /v1/fingerprint`.
4. Inspect the response beside the form: endpoint, HTTP status, elapsed time,
   formatted JSON, result completeness, and a recovery action. On mobile the
   completed response heading receives focus.
5. Subsequent runs can resend the collected snapshot. Discard it explicitly
   when a fresh browser collection is needed.

HTTP requests use the shared bounded JSON client, with a 15-second timeout and
no POST retries. Stopping the wait aborts the client request but cannot undo
server processing. A still-running local collector can finish independently;
its result is ignored after cancellation and is not submitted by that run.

## Token and output boundaries

- No URL, localStorage, sessionStorage, analytics event, or log receives the
  token from the workspace.
- Generated-token response views redact the token and email; the actual token
  remains available in the controlled field.
- Integration snippets use a placeholder until the visitor chooses to include
  the token in visible/copied examples. Browser examples use the hosted SDK
  assets. The npm package is not published yet.
- Response and export views omit image payloads. Other collector values can
  contain network and device details, so a copied report should be reviewed
  before sharing.

## Recovery

- Blank token: add a token to enable the request.
- Invalid email: native email validation keeps the form on the relevant field.
- 400: inspect the API validation details and correct the input.
- 401: replace the token; the collected snapshot is retained.
- 413: inspect the payload against the 128 KiB fingerprint-body limit.
- 429: wait for the returned retry/reset information. Additional tokens for the
  same inbox do not increase the allowance.
- Timeout/network failure: keep inputs, check connectivity, and retry manually.
  A timed-out POST may already have been processed.
- Empty or partial response: inspect available JSON without treating a missing
  ID or missing report fields as a complete success.

## Validation

`docs/UX_ACCEPTANCE.md` describes the project validation path. Run browser work
through the managed OpenClaw E2E lane using `scripts/task-first-browser-qa.cjs`.
The harness uses isolated contexts and API fixtures; it never mints a real token
or spends paid IP-provider quota. The existing preview/production acceptance
script remains separately available for the release path.
