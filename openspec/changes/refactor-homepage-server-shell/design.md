# Design: Homepage Server Shell

## Design brief

The homepage is a task-first security utility, not a generic startup landing
page. Its visual voice is precise, high-contrast, and evidence-led:

- Stripe Docs contributes progressive hierarchy: answer first, detail second.
- Linear contributes restrained density and quiet interaction chrome.
- Cloudflare Radar contributes clear security-data framing without alarmism.

The page avoids decorative dashboard mosaics, excessive gradients, invented
statistics, and an all-client loading gate. Motion is limited to existing
reduced-motion-safe reveal and progress roles.

## Architecture

`app/page.tsx` remains a server component and owns metadata, structured data,
the hero, answer block, value sections, audience section, signal taxonomy, and
internal navigation. It imports `FINGERPRINT_TECHNIQUES` at build time.

Two client islands remain:

1. `LiveFingerprintTeaser` runs the local fingerprint collector and shows a
   bounded summary with a direct `/checker` continuation.
2. `LiveIpCard` calls `/my-ip`, degrades to a clear unavailable state, and
   links to `/ip`.

Neither island may replace the server shell. Both reserve height so loading,
success, and error states do not shift surrounding content.

## Content hierarchy

1. One H1: `Browser Fingerprint Checker & IP Risk Analysis`.
2. Primary CTA `/checker`; secondary CTA `/ip`.
3. Live evidence rail with the two islands.
4. `#what-is-creepjs` answer block.
5. Product/value explanation and privacy boundary.
6. Audience block for individual users, security teams, and developers using
   single lookup, batch/API, or the SDK.
7. Manifest-backed signal grid and internal links.

## Data and honesty

- Coverage is reported as collector completion, not uniqueness.
- Rarity is not shown by the homepage teaser.
- The fingerprint teaser does not upload the full result.
- The own-IP island uses the existing `/my-ip` contract and treats risk as
  optional.
- Copy avoids collector-count claims that can drift from the registry.

## Responsive and accessibility behavior

The hero collapses to one column, CTA controls retain at least 44px targets,
the evidence rail becomes a vertical stack, and fixed island heights remain
large enough for translated browser/runtime error text even though i18n is out
of scope. Heading order is semantic and every icon is decorative unless it
conveys status.
