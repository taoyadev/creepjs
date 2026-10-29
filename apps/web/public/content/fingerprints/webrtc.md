# WebRTC Fingerprint

<!-- llms-safe:start -->

## What CreepJS reports

After you start the check, creates a peer connection with Google STUN servers and reports candidate addresses, connection state, codec capabilities, and support flags.

## How to interpret it

Inspect public and local candidates separately. Rerun after changing your VPN or WebRTC policy to compare what the browser exposes.

## Limits

STUN servers can observe your IP. No returned public candidate does not prove that a VPN prevents leaks. Candidate gathering is bounded and browser policy may conceal addresses. A single signal does not identify a person.

## Test the signal

Keep the live result for comparison, change one relevant setting, then run again in the same tab. Compare the fields before interpreting a changed signature.

- Live signal page: https://creepjs.org/fingerprint/webrtc
- Full checker: https://creepjs.org/checker
- Category: Network

Reviewed: 2026-10-29.

<!-- llms-safe:end -->
