# CPU Architecture Fingerprinting

Detects CPU architecture (x86, ARM, etc.) via `navigator.platform` and user agent analysis.

## Detection Methods

```javascript
// Via navigator.platform
const platform = navigator.platform; // "Win32", "Linux armv7l", "MacIntel"

// Via User Agent parsing
const is64bit = navigator.userAgent.includes('x64') || 
                navigator.userAgent.includes('Win64');
const isARM = /arm|aarch64/i.test(navigator.platform);
```

## Distribution

| Architecture | % | Devices |
|--------------|---|---------|
| x86-64 (Intel/AMD) | 85% | Most PCs, Intel Macs |
| ARM64 (Apple Silicon) | 10% | M1/M2/M3 Macs, high-end phones |
| ARM32 | 4% | Older phones, Raspberry Pi |
| Other | 1% | RISC-V, etc. |

**Entropy**: 1.5-2 bits

## Privacy

**ARM detection** reveals:
- Apple Silicon Mac (premium device, $1000+)
- Mobile device
- Newer hardware (ARM growth trend)

**Use**: Optimize code paths (WebAssembly), detect emulation

**Mitigation**: Hard to fake without breaking compatibility
