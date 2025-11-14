# DateTime Locale Fingerprinting: Your Clock Is Snitching On You

Look, every time you visit a website, your browser is broadcasting your timezone, locale preferences, and date formatting—without you clicking a single permission prompt. It's not just "oh, they know I'm in New York." It's way more precise than that. And when combined with other fingerprinting techniques, it becomes a tracking goldmine.

The `Intl.DateTimeFormat` API was designed to help websites display dates correctly for your region. Makes sense, right? But here's the thing: that same API creates a unique signature that can track you across the web. Your timezone alone narrows you down to a specific city or region, and when paired with your language settings, calendar preferences, and numbering system, you become surprisingly identifiable.

## What Is DateTime Locale Fingerprinting?

DateTime locale fingerprinting collects information about how your system formats dates, times, and numbers using JavaScript's Internationalization API (`Intl`). This includes:

- **Timezone**: Your geographic region (e.g., "America/New_York", "Asia/Shanghai")
- **Locale**: Language and regional format (e.g., "en-US", "zh-CN", "fr-FR")
- **Calendar System**: Which calendar you use (Gregorian, Islamic, Chinese, etc.)
- **Numbering System**: How numbers are displayed (Latin, Arabic, Han numerals)
- **Hour Cycle**: 12-hour vs 24-hour time format

All of this data is accessible without any permission prompts. Websites just call `Intl.DateTimeFormat().resolvedOptions()` and boom—they've got your digital coordinates.

## How It Works

```javascript
const locale = new Intl.DateTimeFormat().resolvedOptions();
// Example output:
// {
//   locale: "en-US",
//   timeZone: "America/New_York",
//   calendar: "gregory",
//   numberingSystem: "latn",
//   hourCycle: "h12",
//   timeZoneName: "America/New_York"
// }

// Or detect timezone offset
const offset = new Date().getTimezoneOffset();
// -300 (for UTC-5, aka EST)

// Get locale-specific formatting
const dateFormat = new Intl.DateTimeFormat('en-US').format(new Date());
// "1/15/2025" (US format)

const dateFormatEU = new Intl.DateTimeFormat('en-GB').format(new Date());
// "15/01/2025" (European format)
```

## The Statistics

According to research from 2024-2025, **83.6% of browsers have unique fingerprints** when combining timezone with other browser attributes. Here's why:

| Attribute            | Possible Values                                       | Entropy Contribution |
| -------------------- | ----------------------------------------------------- | -------------------- |
| **Timezone**         | 400+ valid IANA zones                                 | 8-9 bits             |
| **Locale**           | 50+ common locales                                    | 5-6 bits             |
| **Calendar**         | 10+ types (gregory, chinese, islamic, buddhist, etc.) | 3-4 bits             |
| **Numbering System** | 20+ systems (latn, arab, hans, etc.)                  | 4-5 bits             |
| **Hour Cycle**       | 2 options (h12, h23)                                  | 1 bit                |

**Combined Entropy**: 8-10 bits alone, but when mixed with other signals (screen resolution, fonts, canvas), uniqueness skyrockets to over 90%.

### Common Timezone Distributions

Based on 2024 web traffic data:

- **America/New_York (EST/EDT)**: ~15% of global traffic
- **Europe/London (GMT/BST)**: ~8%
- **Asia/Shanghai (CST)**: ~12%
- **America/Los_Angeles (PST/PDT)**: ~10%
- **UTC** (privacy browsers, servers): ~3%
- **Other 390+ timezones**: ~52%

If you're in a less common timezone like "Pacific/Fiji" or "Asia/Kathmandu", you're **extremely unique**—potentially 1 in 10,000 users.

## What Nobody Tells You

### Geographic Precision Is Scary

Your timezone doesn't just say "East Coast USA." It can reveal:

- **City-level accuracy**: America/New_York covers NYC, but America/Indiana/Indianapolis is way more specific
- **Unusual locations**: Timezones like America/Argentina/Ushuaia are rare enough to narrow you down dramatically
- **Travel patterns**: If your timezone suddenly changes, trackers can infer you're traveling

### Cultural and Demographic Profiling

Here's where it gets creepy. Your locale and calendar settings reveal:

- **Cultural background**: `ar-SA` + `islamic` calendar → likely Muslim user in Saudi Arabia
- **Immigrant communities**: `es-US` + `America/Los_Angeles` → likely Hispanic community in California
- **Religious affiliation**: Buddhist calendar use outside Southeast Asia is extremely rare
- **Language fluency**: Mismatched browser language and OS language can indicate bilingual users

**Real-world example**: A user with `locale: "zh-CN"`, `timezone: "America/Los_Angeles"`, and `calendar: "chinese"` is likely a Chinese immigrant or descendant living in California. That's a specific demographic profile from just three data points.

### The Immigration Signal

This is controversial, but let's be real: Mismatched locale and timezone settings can **infer immigration status or cultural heritage**.

- `locale: "ar-EG"` + `timezone: "Europe/Paris"` → Likely Egyptian living in France
- `locale: "en-US"` + `timezone: "Asia/Dubai"` → Expat worker in UAE
- `locale: "es-MX"` + `timezone: "America/Chicago"` → Mexican community in US Midwest

Advertisers, political campaigns, and yes, even governments could use this for targeted messaging or surveillance.

## How Browsers Handle This (2024-2025 State)

### Privacy-Focused Browsers

| Browser                                  | Timezone Behavior                                    | Privacy Level |
| ---------------------------------------- | ---------------------------------------------------- | ------------- |
| **Tor Browser**                          | Always UTC                                           | Very High     |
| **Brave**                                | Real timezone (considering randomization as of 2024) | Medium        |
| **Firefox (Resist Fingerprinting mode)** | Rounds to nearest hour or spoofs timezone            | Medium-High   |
| **Standard Chrome/Safari**               | Real timezone, no protection                         | None          |

**Why Tor is bulletproof**: Every Tor Browser user shows `en-US` locale and `UTC` timezone, creating a massive anonymity set. You're literally hiding in a crowd of millions.

**Why Brave is improving**: As of 2024, Brave has enhanced fingerprinting resistance but still exposes real timezones by default (though they're exploring randomization).

### Firefox's Resist Fingerprinting Mode

Firefox has a hidden setting `privacy.resistFingerprinting` that:

- Spoofs timezone to UTC (or rounds to nearest hour)
- Standardizes locale to `en-US`
- Disables high-resolution timestamps

Activate it:

1. Go to `about:config`
2. Set `privacy.resistFingerprinting` to `true`
3. Restart browser

**Trade-off**: Websites may display wrong times or dates, and localized content breaks.

## The Google Announcement That Changed Everything

In **December 2024**, Google dropped a bombshell: They announced they would **no longer prohibit advertising customers from using fingerprinting techniques starting February 16, 2025**.

This was a massive shift. Previously, Google's ad policies restricted fingerprinting. Now? It's open season. The UK Information Commissioner's Office (ICO) sharply rebuked this decision, but the damage is done.

**What this means**: Expect fingerprinting (including timezone tracking) to become ubiquitous on any site using Google Ads, Analytics, or Tag Manager.

## Real-World Use Cases

### Legitimate Uses

✅ **Localization**: Display dates/times in user's format
✅ **Scheduling**: Show event times in user's timezone
✅ **Fraud detection**: Mismatched timezone and IP address can indicate VPN/proxy use
✅ **A/B testing**: Segment users by region for testing

### Concerning Uses

❌ **Cross-site tracking**: Combine timezone with other signals to track users without cookies
❌ **Price discrimination**: Charge more to users in wealthy timezones
❌ **Political profiling**: Target ads based on inferred location and demographics
❌ **Surveillance**: Governments tracking dissidents via timezone changes

## Protecting Your Privacy

### What Works

1. **Tor Browser**: Best option—complete anonymity via UTC standardization
2. **Firefox + Resist Fingerprinting**: Good middle ground (some UX breakage)
3. **Brave**: Decent defaults, improving over time
4. **VPN + Timezone Spoofer**: Manually set timezone to match VPN location

### Browser Extensions

- **Spoof Timezone**: WebExtension that overrides `Intl` and `Date` APIs
- **Brave's built-in protection**: Randomizes some fingerprinting vectors (as of 2024)

### What Doesn't Work

- **VPNs alone**: Your timezone stays the same even if your IP changes
- **Private browsing**: Timezone is still exposed
- **Clearing cookies**: Hardware and software settings remain

### The Painful Truth

Want real anonymity? You need to **sacrifice user experience**. Setting your timezone to UTC means:

- Event times display wrong
- Date formats break
- Localized content disappears

That's why most people don't bother. And trackers know it.

## Try It Yourself

Want to see what your browser reveals? Check your datetime locale fingerprint at [/fingerprint/datetime-locale](/fingerprint/datetime-locale).

## Sources

- [Electronic Frontier Foundation: GDPR and Browser Fingerprinting](https://www.eff.org/deeplinks/2018/06/gdpr-and-browser-fingerprinting-how-it-changes-game-sneakiest-web-trackers)
- [Texas A&M University: Browser Fingerprinting Research (2025)](https://engineering.tamu.edu/news/2025/06/websites-are-tracking-you-via-browser-fingerprinting.html)
- [Google's Fingerprinting Policy Change (December 2024)](https://www.malwarebytes.com/blog/news/2025/02/google-now-allows-digital-fingerprinting-of-its-users)
- [Brave Browser: Anti-Fingerprinting Development](https://github.com/brave/brave-browser/issues/8574)
- [Mozilla: Privacy and Fingerprinting Resistance](https://wiki.mozilla.org/Fingerprinting)
- [Pitg Network: Browser Fingerprinting in 2025](https://pitg.network/news/techdive/2025/08/15/browser-fingerprinting.html)

---

**Last Updated**: January 2025 | **Word Count**: 1,420 words
