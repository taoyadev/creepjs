# WebRTC Fingerprint

<!-- llms-safe:start -->

## What CreepJS reports

CreepJS runs the WebRTC Fingerprint collector in the current browser. It inspects the browser surface represented by this network signal and reports the observed value or availability state, collection timing, and any collector error. The live result is local browser evidence, not a population estimate.

## How to interpret it

Use WebRTC Fingerprint as one observation alongside other signals. Different browsers, devices, settings, and permissions may return different values. An unsupported or blocked API may return no value. A single signal does not identify a person.

## Limits

This reference makes no uniqueness, match-rate, or fraud-probability claim. Results can change after browser, operating-system, hardware, permission, privacy-setting, or driver changes. Treat unavailable data as unavailable, not as evidence of safety or risk.

## Test the signal

- Live signal page: https://creepjs.org/fingerprint/webrtc
- Full checker: https://creepjs.org/checker
- Category: Network

Reviewed: 2026-07-28.

<!-- llms-safe:end -->
