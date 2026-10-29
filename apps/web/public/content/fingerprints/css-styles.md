# CSS Styles

<!-- llms-safe:start -->

## What CreepJS reports

Reads computed CSS properties and system-font styles, then produces a signature for the returned style data.

## How to interpret it

Compare individual styles after changing the system theme, default fonts, or browser. A changed signature can come from a small style difference.

## Limits

Computed styles are browser-exposed values. They can be normalized and do not establish a unique browser or operating system. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/css-styles
- Full checker: https://creepjs.org/checker
- Category: Browser

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
