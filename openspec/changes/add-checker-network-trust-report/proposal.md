# Add Checker Network Trust Report

## Why

The checker currently presents browser integrity and own-IP intelligence in
separate tools. Users must mentally combine coverage, browser inconsistencies,
automation exposure, ASN/location, and optional IP risk context. E7 calls for
one explainable report without turning those observations into a fraud
probability.

## What Changes

- Fetch the visitor's existing `/my-ip` summary once inside the checker.
- Add a `#trust` report that combines browser integrity and own-IP context into
  explicit dimensions and plain-language guidance.
- Degrade to browser-only output when `/my-ip` or paid risk enrichment is
  unavailable.
- Add the optional network summary to user-initiated JSON/CSV report exports.
- Link to `/ip?q=<own-ip>` for deeper IP investigation.

## Impact

- **Tracker:** E7, dependent on the E3 checker shell.
- **Code:** checker hooks/components, `ExportReport`, and checker navigation.
- **No API change:** this consumes the existing `/my-ip` contract.
- **Out of scope:** arbitrary-IP input on `/checker`, probability claims, new
  collectors, paid features, or new dependencies.
