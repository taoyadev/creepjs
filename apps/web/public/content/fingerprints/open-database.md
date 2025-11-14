# WebSQL (openDatabase) Fingerprinting: The Zombie API That Finally Died in 2024

Okay, story time. There's this ancient browser API called WebSQL. It's been officially dead since 2010 - the W3C literally abandoned the spec. But like a zombie, it kept shuffling around in browsers for another 14 years. Until 2024, when Chrome finally drove a stake through its heart and removed it completely.

Why am I telling you about a dead API? Because WebSQL detection (`window.openDatabase`) was one of the most reliable ways to fingerprint browsers. It immediately told you: "This is Chrome/Safari" or "This is Firefox/Edge." That's browser fingerprinting gold. Let me show you why this matters and what the current state is in 2024-2025.

## What Was WebSQL Anyway?

WebSQL was basically SQLite in your browser. Think of it like having a real database (with SQL queries and everything) that websites could use to store data locally. It was pretty powerful, but the W3C abandoned it in November 2010 because they couldn't agree on a standard.

Here's the basic API (RIP):

```javascript
// Check if it exists
const hasWebSQL = 'openDatabase' in window;

// Actually use it (when it worked)
if (hasWebSQL) {
  const db = window.openDatabase('myDB', '1.0', 'Test DB', 2 * 1024 * 1024);

  db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS test (id unique, text)');
    tx.executeSql('INSERT INTO test (id, text) VALUES (1, "hello")');
  });
}
```

That SQL syntax? That's real SQLite. Pretty neat for 2010. But also problematic because now every browser has to embed SQLite and maintain it forever. The W3C said "nope" and pushed for IndexedDB instead.

## The Timeline: How WebSQL Finally Died

Let me walk you through the death of WebSQL:

- **April 2009**: WebSQL specification introduced
- **November 2010**: W3C abandons spec (officially "deprecated")
- **2010-2023**: Chrome, Safari, Opera keep supporting it anyway
- **Firefox**: Never implemented it (smart move)
- **Safari/WebKit**: Removed support in 2019
- **Chrome 119** (October 2023): Disabled by default
- **Chrome 123** (March 2024): Last version with flag support
- **Chrome 124+** (April 2024): Completely removed
- **Edge 124+** (April 2024): Completely removed (follows Chromium)

As of **April 2024**, WebSQL is gone from all major browsers. No flag can bring it back. It's dead dead.

## Browser Support: The Final Scorecard (2024-2025)

Here's the complete picture:

| Browser          | Peak Support        | Removal Date                  | 2024-2025 Status | Alternative                |
| ---------------- | ------------------- | ----------------------------- | ---------------- | -------------------------- |
| Chrome           | v4-123 (2010-2024)  | April 2024 (v124)             | Not supported    | IndexedDB, SQLite via WASM |
| Firefox          | Never               | N/A                           | Never supported  | IndexedDB                  |
| Safari           | v3.1-13 (2008-2019) | 2019 (WebKit removal)         | Not supported    | IndexedDB                  |
| Edge (Chromium)  | v79-123 (2020-2024) | April 2024 (v124)             | Not supported    | IndexedDB                  |
| Opera            | v10-108 (2010-2024) | April 2024 (follows Chrome)   | Not supported    | IndexedDB                  |
| Mobile Safari    | iOS 3.2-13          | 2019                          | Not supported    | IndexedDB                  |
| Samsung Internet | v4-23               | April 2024 (follows Chromium) | Not supported    | IndexedDB                  |

Source: Chrome Platform Status, MDN Web Docs, WebKit blog, browser release notes

**Bottom line**: As of 2024-2025, checking for `window.openDatabase` will return `undefined` or `false` in every browser. This makes it completely useless for fingerprinting now.

## Why This Was Amazing for Fingerprinting (2010-2024)

For 14 years, WebSQL detection gave you instant browser identification:

```javascript
function detectBrowserByWebSQL() {
  const hasWebSQL = 'openDatabase' in window;

  if (hasWebSQL) {
    return 'Chrome, Safari, or Chromium-based browser (pre-2024)';
  } else {
    return 'Firefox, Edge (pre-Chromium), or modern browser (2024+)';
  }
}
```

This was beautiful for fingerprinters because:

1. **High entropy**: Roughly 50/50 split when Firefox had ~30% market share
2. **No false positives**: Firefox users stood out immediately
3. **Reliable**: Couldn't be spoofed easily
4. **Simple**: One property check
5. **Combined with other signals**: Narrowed down exact browser version

### Historical Entropy Calculation (2020-2023)

Let's do the math for when WebSQL was still alive:

Assuming this browser market share in 2023:

- Chrome + Chromium browsers: ~70% (had WebSQL)
- Safari: ~15% (no WebSQL after 2019)
- Firefox: ~8% (never had WebSQL)
- Other: ~7%

**Entropy calculation**:

- Has WebSQL: ~70% → -log2(0.70) = 0.51 bits
- No WebSQL: ~30% → -log2(0.30) = 1.74 bits

Combined entropy: **~0.88 bits**

That's significant. For comparison:

- Canvas fingerprinting: 8-10 bits
- WebGL: 5-7 bits
- **WebSQL check: 0.88 bits** (not bad for a one-liner)

## What Fingerprinting Scripts Actually Did

Real fingerprinting libraries checked WebSQL as part of their browser detection suite:

```javascript
function comprehensiveBrowserFingerprint() {
  return {
    // Storage APIs
    webSQL: 'openDatabase' in window,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window,
    sessionStorage: 'sessionStorage' in window,

    // Infer browser from storage patterns
    likelyBrowser: (() => {
      const hasWebSQL = 'openDatabase' in window;
      const hasIndexedDB = 'indexedDB' in window;

      if (hasWebSQL && hasIndexedDB) {
        return 'Chrome/Safari (pre-2024)';
      } else if (!hasWebSQL && hasIndexedDB) {
        return 'Firefox or modern browser (2024+)';
      } else if (hasWebSQL && !hasIndexedDB) {
        return 'Very old Chrome/Safari';
      } else {
        return 'Ancient browser or bot';
      }
    })(),
  };
}
```

Libraries like FingerprintJS, Fingerprint2, and ClientJS all checked for WebSQL. It was a standard component in browser fingerprinting toolkits.

## Why Chrome Kept It for So Long (And Why They Finally Removed It)

Good question. The spec was abandoned in 2010. Why did Chrome support it until 2024?

**Reasons for keeping it**:

1. **Legacy apps**: Enterprise apps built in 2010-2015 relied on WebSQL
2. **No breaking changes**: Chrome's philosophy was not to break the web
3. **Maintenance burden was low**: SQLite was already embedded in Chrome
4. **IndexedDB adoption was slow**: Developers kept using WebSQL because it was easier (SQL is familiar)

**Reasons for finally removing it**:

1. **Security concerns**: Maintaining old APIs is a security risk
2. **Code bloat**: Every feature has maintenance cost
3. **Web standards**: W3C wanted it gone for 14 years
4. **IndexedDB maturity**: Modern alternative is now stable and well-supported
5. **SQLite WASM**: You can now run SQLite in browsers via WebAssembly without native APIs

Chrome's announcement (August 2023): _"Web SQL Database has been removed from the HTML specification and is no longer recommended for use. We are removing Web SQL Database from Chrome."_

They gave developers a deprecation trial from Chrome 119-123 (5 months) to update their apps. That trial expired in March 2024. Chrome 124 (April 2024) removed it completely.

## The Modern Alternative: SQLite via WebAssembly

Here's the cool part. WebSQL is dead, but SQL in browsers isn't. You can now run actual SQLite using WebAssembly:

```javascript
// Using sql.js (SQLite compiled to WASM)
import initSqlJs from 'sql.js';

async function useSQLite() {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Create a database
  const db = new SQL.Database();

  // Run SQL queries (just like WebSQL!)
  db.run('CREATE TABLE test (id INTEGER, name TEXT)');
  db.run("INSERT INTO test VALUES (1, 'hello')");

  const results = db.exec('SELECT * FROM test');
  console.log(results);
}
```

This is better than WebSQL because:

- **Sandboxed**: Runs in WASM, not native code
- **Standardized**: Works identically in every browser
- **Up-to-date**: You control the SQLite version
- **No fingerprinting**: Every browser behaves the same way

Libraries like [sql.js](https://github.com/sql-js/sql.js) and [wa-sqlite](https://github.com/rhashimoto/wa-sqlite) provide this functionality.

## Current Fingerprinting Value: Zero

As of 2024-2025, checking for WebSQL tells you nothing:

```javascript
const hasWebSQL = 'openDatabase' in window; // false everywhere

// Entropy: 0 bits (everyone returns false)
```

It's like asking "Do you have a floppy disk drive?" in 2025. Everyone says no. No information gained.

But here's a fun twist: if you're testing in an older browser (Chrome 123 or earlier), it _still_ might show up. So fingerprinting scripts that check for WebSQL can now detect:

- **Modern browser (2024+)**: No WebSQL
- **Old browser (pre-2024)**: Has WebSQL
- **Old browser trying to look new**: Has WebSQL but claims to be new

This is reverse fingerprinting - detecting outdated browsers, which might indicate bots or suspicious activity.

## What Developers Should Use Instead

If you were using WebSQL for your app, here's the migration path:

### Option 1: IndexedDB (Recommended for Most)

```javascript
// IndexedDB is the official replacement
const request = indexedDB.open('myDB', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  const store = db.createObjectStore('test', { keyPath: 'id' });
};

request.onsuccess = function (event) {
  const db = event.target.result;
  const tx = db.transaction('test', 'readwrite');
  const store = tx.objectStore('test');

  store.add({ id: 1, text: 'hello' });
};
```

**Pros**: Native API, no dependencies, async, well-supported
**Cons**: Not SQL (NoSQL-style API), steeper learning curve

### Option 2: SQLite via WASM (For SQL Fans)

```javascript
// If you really want SQL, use WASM
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

const worker = sqlite3Worker1Promiser({
  onready: async () => {
    await worker('config-get', {});
    await worker('open', { filename: 'test.db' });
    await worker('exec', {
      sql: 'CREATE TABLE test (id INTEGER, text TEXT)',
    });
  },
});
```

**Pros**: Real SQL, familiar syntax, latest SQLite features
**Cons**: Requires WASM support (99%+ browsers), slightly larger bundle

### Option 3: LocalStorage (For Simple Data)

```javascript
// If you don't need a database, use localStorage
localStorage.setItem('key', JSON.stringify({ id: 1, text: 'hello' }));
const data = JSON.parse(localStorage.getItem('key'));
```

**Pros**: Super simple, synchronous, widely supported
**Cons**: Limited to ~5-10MB, string-only, no queries

## Migration Statistics (2024 Data)

According to Chrome usage statistics published during the deprecation process:

- **0.024% of page loads** used WebSQL in Chrome 119 (October 2023)
- That's about 24 in 100,000 page loads
- By Chrome 123 (March 2024), usage dropped to **0.008%** (thanks to the deprecation trial)

This means WebSQL removal affected less than 1 in 10,000 websites. Most had already migrated or weren't using it.

### Top Use Cases (What Broke)

The sites that did break were mostly:

1. **Old enterprise apps** (intranet sites from 2010-2015)
2. **Legacy mobile apps** (hybrid apps using Cordova/PhoneGap)
3. **Abandoned side projects** (no maintainer to update)
4. **Some email clients** (webmail interfaces with offline support)

Major sites like Gmail, Outlook, and Google Docs had already migrated years ago.

## Testing for WebSQL in 2024-2025

If you're curious about your browser, test it:

```javascript
(function testWebSQL() {
  const results = {
    exists: 'openDatabase' in window,
    type: typeof window.openDatabase,
    functional: false,
    errorOnCall: null,
  };

  if (results.exists) {
    try {
      const db = window.openDatabase('test', '1.0', 'test', 1024);
      results.functional = !!db;
    } catch (e) {
      results.errorOnCall = e.message;
    }
  }

  console.table(results);
  return results;
})();
```

Expected output in 2024-2025:

```
exists: false
type: "undefined"
functional: false
errorOnCall: null
```

If you get `exists: true`, you're on an old browser (pre-April 2024). Update it.

## The Broader Fingerprinting Landscape (2024-2025)

WebSQL removal is part of a larger trend: browsers removing or restricting fingerprinting vectors. Let's look at what else changed recently:

| API/Feature               | Status (2024-2025)         | Fingerprinting Impact           |
| ------------------------- | -------------------------- | ------------------------------- |
| WebSQL                    | Removed (April 2024)       | Was 0.88 bits, now 0 bits       |
| User-Agent string         | Being reduced (2023-2024)  | Down from ~8 bits to ~3 bits    |
| Battery API               | Removed (2019-2021)        | Was 2-3 bits                    |
| Device Motion/Orientation | Permission required (2023) | Was 4-5 bits                    |
| WebRTC local IPs          | Restricted (2023)          | Was 3-5 bits                    |
| Canvas fingerprinting     | Being "farbbled" (2024)    | Still 8-10 bits but less stable |
| WebGL                     | Being restricted (ongoing) | Still 5-7 bits                  |

Browsers are slowly removing or restricting APIs that enable fingerprinting. WebSQL removal fits this pattern.

## Privacy Implications: Was WebSQL a Privacy Risk?

Not really. Here's why:

**Low risk factors**:

1. **Read-only detection**: Scripts could only check if the API existed, not read stored data
2. **Same-origin policy**: Each domain got isolated databases
3. **No cross-site tracking**: WebSQL couldn't track you across sites
4. **Limited entropy**: Only 0.88 bits (not enough to uniquely identify)

**The real risk**:

- Browser identification (Chrome vs Firefox)
- Combined with other signals for more precise fingerprinting
- Helped detect browser spoofing (user agent lies vs actual APIs)

But compared to canvas fingerprinting (8-10 bits), WebGL (5-7 bits), or font detection (5-6 bits), WebSQL was minor.

## Why This Matters for Browser Fingerprinting Education

Even though WebSQL is dead, understanding its story teaches important lessons:

1. **APIs can persist for decades**: Something deprecated in 2010 survived until 2024
2. **Browser fragmentation helps fingerprinting**: Different support = unique identifiers
3. **Removal changes fingerprints**: Sites that relied on WebSQL for ID now have broken scripts
4. **Backwards compatibility is a double-edged sword**: Helps old sites, enables fingerprinting
5. **Standards matter**: IndexedDB won because it's a W3C standard

For developers building fingerprinting protection, the lesson is: **track which APIs are being deprecated and removed**. Each removal potentially breaks fingerprinting scripts.

## The Future: What Other APIs Might Die?

Based on current browser trends (2024-2025), here are candidates for removal:

**High probability**:

- AppCache (already deprecated, removal planned)
- Mutation Events (deprecated, use MutationObserver)
- `document.domain` setter (being removed in Chrome)

**Medium probability**:

- PPAPI plugins (Flash alternative, being phased out)
- Synchronous XMLHttpRequest in page dismissal
- Unload event (being deprecated for BFCache)

**Low probability but discussed**:

- High-precision timing APIs (reduced precision for fingerprinting)
- Font enumeration APIs (privacy risk)
- Some WebRTC features (local IP leaks)

Each removal is another fingerprinting vector eliminated.

## Bottom Line: WebSQL Is Dead, IndexedDB Lives

WebSQL was a zombie API that shambled around for 14 years after being officially killed. It provided an easy browser fingerprinting vector: Chrome/Safari had it, Firefox didn't. But as of April 2024, it's finally gone from all major browsers.

For fingerprinting, this means:

- **Pre-2024**: Useful signal (0.88 bits of entropy)
- **2024-2025**: Useless (0 bits, everyone returns false)
- **Future**: Might detect outdated browsers (reverse fingerprinting)

The alternatives (IndexedDB, SQLite via WASM) are better in every way and don't fragment the web or enable fingerprinting.

If you're building a fingerprinting detection system, you can safely remove WebSQL checks. If you're building a fingerprinting resistance system, congratulations - one less vector to worry about.

The web keeps evolving. Old APIs die. Usually slowly, sometimes overnight. WebSQL took 14 years. But it finally happened.

Rest in peace, `window.openDatabase`. You were weird, powerful, and kind of broken. We barely knew ye.

## Sources

1. Chrome for Developers (2024). "Deprecating and removing Web SQL" - https://developer.chrome.com/blog/deprecating-web-sql
2. W3C (2010). "Web SQL Database Specification (Deprecated)" - https://www.w3.org/TR/webdatabase/
3. Wikipedia (2024). "Web SQL Database" - https://en.wikipedia.org/wiki/Web_SQL_Database
4. Chromium Issue Tracker (2024). "Deprecate and remove WebSQL (Window#openDatabase)" - https://issues.chromium.org/issues/40507959
5. WebKit Blog (2019). "Removing Web SQL Database" - https://webkit.org/blog/
6. Chrome Platform Status (2024). "Web SQL Database Removal" - https://chromestatus.com/feature/5134293578285056
7. MDN Web Docs (2024). "IndexedDB API" - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
8. Stack Overflow (2024). "Why is Web SQL database deprecated?" - https://softwareengineering.stackexchange.com/
9. Mendix Blog (2024). "WebSQL Removal and How It Affects Your Mendix PWAs" - https://www.mendix.com/blog/
10. sql.js GitHub (2024). "SQLite compiled to JavaScript via Emscripten" - https://github.com/sql-js/sql.js
