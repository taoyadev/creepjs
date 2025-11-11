# DateTime Locale Fingerprinting

Detects regional date/time formatting via `Intl.DateTimeFormat`, revealing geographic location and language settings.

## API

```javascript
const locale = new Intl.DateTimeFormat().resolvedOptions();
// {
//   locale: "en-US",
//   timeZone: "America/New_York",
//   calendar: "gregory",
//   numberingSystem: "latn"
// }
```

## Uniqueness

**Components**:
- Locale: "en-US", "zh-CN", "fr-FR" (50+ common)
- Time Zone: "America/New_York", "Asia/Shanghai" (400+ total)
- Calendar: "gregory", "chinese", "islamic" (10+ types)
- Numbering: "latn", "arab", "hans" (20+ systems)

**Combined Entropy**: 8-10 bits (thousands of combinations)

## Privacy Risk

Reveals:
- **Geographic location** (timezone → city-level accuracy)
- **Cultural background** (calendar/numbering system)
- **Language preference**
- **Immigration status** (mismatched locale/timezone)

**Example**: `locale: "es-US", timezone: "America/Los_Angeles"` → Likely Hispanic Californian

## Mitigation

**Tor**: Standardizes to `en-US` + `UTC` timezone
**Brave**: Slightly randomizes or rounds
**Manual**: Change browser language (but breaks localization)

**Recommendation**: Accept fingerprinting or use Tor (changing breaks user experience)
