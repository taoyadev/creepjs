# Screen Frame Detection

<!-- llms-safe:start -->

## What CreepJS reports

Estimates the top, right, bottom, and left screen frame from available screen geometry.

## How to interpret it

Compare the edges after moving the window or changing taskbar placement. Null means an edge could not be determined.

## Limits

Values are browser estimates in CSS coordinates. Window managers, multiple displays, and privacy settings can make them unavailable or misleading. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/screen-frame
- Full checker: https://creepjs.org/checker
- Category: Hardware

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
