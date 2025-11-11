# Platform Fingerprinting

Detects OS platform via `navigator.platform`, revealing operating system and architecture.

## API

```javascript
const platform = navigator.platform;
// "Win32", "MacIntel", "Linux x86_64", "iPhone", etc.
```

## Distribution

| Platform | % | OS |
|----------|---|-----|
| Win32 | 72% | Windows |
| MacIntel | 16% | macOS |
| Linux x86_64 | 3% | Linux Desktop |
| iPhone | 6% | iOS |
| Android | 3% | Android (via user agent) |

**Entropy**: 2 bits | Often combined with User Agent

## Privacy

OS detection enables:
- Price discrimination (macOS users pay more)
- Targeted exploits
- Behavioral profiling

**Mitigation**: Spoofing breaks compatibility. Best: Use Tor (standardizes)
