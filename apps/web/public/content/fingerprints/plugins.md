# Browser Plugins Fingerprinting: The Privacy Nightmare That Finally Died

Let me tell you about one of the biggest privacy disasters in web history: the `navigator.plugins` API. For years, websites could see every single plugin you had installed—Flash, Java, PDF readers, video codecs, everything. It was like giving websites a complete inventory of your software. And yeah, trackers absolutely loved it.

The good news? This nightmare is mostly over. Let me explain what happened.

## What Were Browser Plugins?

Okay, quick history lesson. Back in the 90s and early 2000s, browsers couldn't do much. No video playback, no interactive content, no rich web apps. To add these capabilities, browsers supported **plugins**—external software that extended what browsers could do.

The most famous ones:

- **Adobe Flash Player** - animations, games, video players
- **Java Runtime Environment** - Java applets
- **Adobe Acrobat** - PDF viewing
- **QuickTime** - Apple's video player
- **Silverlight** - Microsoft's Flash competitor
- **RealPlayer** - streaming media
- **Windows Media Player** - video playback
- **Unity Web Player** - 3D games

Every plugin would register itself with the browser, and websites could detect them using `navigator.plugins`:

```javascript
// The old way (pre-2020)
const plugins = Array.from(navigator.plugins).map((p) => ({
  name: p.name,
  description: p.description,
  filename: p.filename,
  version: p.version,
}));

console.log(plugins);
// Output (circa 2015): [
//   {name: "Chrome PDF Plugin", description: "Portable Document Format", ...},
//   {name: "Shockwave Flash", description: "Adobe Flash Player", ...},
//   {name: "Java Plugin", description: "Java Runtime Environment", ...},
//   ... 20-30 more plugins
// ]
```

## Why This Was a Fingerprinting Gold Mine

Here's the problem: **your plugin list was essentially unique to you**.

Think about it. What are the chances that someone else has:

- The exact same plugins you have
- The exact same versions
- In the exact same installation order
- With the exact same update history

Pretty much zero, right?

A landmark study by the Electronic Frontier Foundation's Panopticlick project found that plugin lists provided **10+ bits of entropy**. That's enough to distinguish between **over 1,000 different users**.

When combined with other fingerprinting techniques, your plugin list made you uniquely identifiable with 99%+ accuracy.

## The Tracking Technique

Let me show you how sophisticated trackers actually used plugin detection:

```javascript
function getPluginFingerprint() {
  const plugins = Array.from(navigator.plugins);

  const fingerprint = {
    // Basic counts
    totalPlugins: plugins.length,
    totalMimeTypes: navigator.mimeTypes.length,

    // Plugin names and versions
    plugins: plugins.map((p) => ({
      name: p.name,
      description: p.description,
      version: p.version || 'unknown',
      filename: p.filename,
    })),

    // Check for specific high-value plugins
    hasFlash: plugins.some((p) => p.name.toLowerCase().includes('flash')),
    hasJava: plugins.some((p) => p.name.toLowerCase().includes('java')),
    hasSilverlight: plugins.some((p) =>
      p.name.toLowerCase().includes('silverlight')
    ),
    hasQuickTime: plugins.some((p) =>
      p.name.toLowerCase().includes('quicktime')
    ),
    hasUnity: plugins.some((p) => p.name.toLowerCase().includes('unity')),
    hasPDF: plugins.some((p) => p.name.toLowerCase().includes('pdf')),

    // Plugin order (reveals installation sequence)
    pluginOrder: plugins.map((p) => p.name),

    // Hash the entire plugin list
    hash: hashPlugins(plugins),
  };

  return fingerprint;
}

function hashPlugins(plugins) {
  const str = plugins
    .map((p) => `${p.name}|${p.description}|${p.filename}`)
    .sort()
    .join('::');

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}
```

This would generate a highly unique fingerprint. If you had Flash Player 32.0.0.465, and I had Flash Player 32.0.0.445, we'd have different fingerprints. If you had QuickTime and I didn't, different fingerprints. If you installed plugins in a different order, different fingerprints.

## The Corporate Tracking Angle

Here's something really creepy: enterprise software often installs browser plugins. So trackers could identify corporate users by detecting:

- **Cisco WebEx** plugins (video conferencing)
- **Citrix** plugins (remote desktop)
- **SAP** plugins (enterprise software)
- **Oracle** plugins (business applications)
- **Corporate VPN** plugins

If a tracker saw these plugins, they knew you were browsing from a corporate environment. They could even guess which company based on the specific combination of plugins.

Universities were similar. Students would have:

- **Respondus LockDown Browser** (exam proctoring)
- **SafeAssign** (plagiarism detection)
- **ProctorU** (online testing)

Advertisers would target students differently based on detecting these plugins.

## The Browser Wars Change Everything

Around 2015-2017, browsers started killing plugin support. Here's why:

### Security Nightmares

Plugins were a massive security liability. Some statistics:

- **Over 50%** of serious browser vulnerabilities in 2015 were plugin-related
- **Flash Player** had 266 documented security vulnerabilities in 2016 alone
- **Java browser plugins** were responsible for 91% of all compromised Windows systems in 2013

Plugins ran with elevated privileges and could access your entire system. A vulnerability in Flash could let attackers steal your files, install malware, or take over your computer.

### Performance Issues

Plugins were slow and battery-draining. Adobe admitted that Flash was responsible for:

- **10-20% battery drain** on laptops
- **3-5x slower** page load times
- Frequent browser crashes

### The Rise of HTML5

By 2015, HTML5 could do almost everything plugins did:

- `<video>` and `<audio>` tags for media playback (no more Flash)
- `<canvas>` and WebGL for graphics and games
- WebRTC for video chat
- Web Audio API for sound processing

Plugins became obsolete.

## The Great Plugin Purge: Timeline

Here's how browsers killed plugins:

### Chrome 87 (October 2020)

Chrome stopped exposing the actual plugin list and started returning a **hardcoded list** instead.

Before Chrome 87:

```javascript
navigator.plugins.length; // 20-30 plugins
```

After Chrome 87:

```javascript
navigator.plugins.length; // 5 plugins (PDF, Flash if enabled, Widevine CDM)
```

Everyone using Chrome 87+ gets the same plugin list. It doesn't matter what you actually have installed—Chrome lies to websites and returns a standardized list.

### Firefox 91 (August 2021)

Firefox followed Chrome's lead and **hardcoded the plugin list** to a minimal set.

The Firefox team stated: "To reduce fingerprinting, navigator.plugins now returns a fixed list of plugins."

### Safari (2017-2018)

Safari was actually ahead of the curve. They started restricting plugin enumeration around 2017, years before Chrome and Firefox.

Safari never exposed many plugins because:

1. **macOS/iOS** never had as many plugins as Windows
2. Apple controls the ecosystem tightly
3. Safari prioritized privacy earlier than competitors

### Edge 87+ (2020)

When Edge switched to Chromium, it inherited Chrome's hardcoded plugin list. Same behavior as Chrome.

## What Browsers Return Today (2024)

Let me show you what `navigator.plugins` returns on modern browsers:

```javascript
// Chrome 120 / Edge 120 / Brave 1.60 / Opera 106 (all Chromium-based)
console.log(navigator.plugins.length); // 5
console.log(Array.from(navigator.plugins).map((p) => p.name));
// Output: [
//   "PDF Viewer",
//   "Chrome PDF Viewer",
//   "Chromium PDF Viewer",
//   "Microsoft Edge PDF Viewer",
//   "WebKit built-in PDF"
// ]

// Firefox 121
console.log(navigator.plugins.length); // 5
console.log(Array.from(navigator.plugins).map((p) => p.name));
// Output: [
//   "PDF Viewer",
//   "Chrome PDF Viewer",
//   "Chromium PDF Viewer",
//   "Microsoft Edge PDF Viewer",
//   "WebKit built-in PDF"
// ]

// Safari 17
console.log(navigator.plugins.length); // 5
console.log(Array.from(navigator.plugins).map((p) => p.name));
// Output: [
//   "PDF Viewer",
//   "Chrome PDF Viewer",
//   "Chromium PDF Viewer",
//   "Microsoft Edge PDF Viewer",
//   "WebKit built-in PDF"
// ]
```

See the pattern? **All modern browsers return the exact same list**. It doesn't matter if you're on Windows, macOS, or Linux. It doesn't matter what software you have installed. Everyone gets the same answer.

This is deliberate. The web standards were updated to require browsers to return a fixed list to prevent fingerprinting.

## Browser Market Share and Plugin Protection (2024)

| Browser           | Version | Plugin List           | Market Share | Protected? |
| ----------------- | ------- | --------------------- | ------------ | ---------- |
| Chrome 87+        | Modern  | Hardcoded (5 plugins) | ~63%         | ✅ Yes     |
| Firefox 91+       | Modern  | Hardcoded (5 plugins) | ~3%          | ✅ Yes     |
| Safari 14+        | Modern  | Hardcoded (5 plugins) | ~20%         | ✅ Yes     |
| Edge 87+          | Modern  | Hardcoded (5 plugins) | ~5%          | ✅ Yes     |
| Opera 73+         | Modern  | Hardcoded (5 plugins) | ~2%          | ✅ Yes     |
| Brave (all)       | Modern  | Hardcoded (5 plugins) | ~0.5%        | ✅ Yes     |
| Chrome <87        | Legacy  | Real plugin list      | <1%          | ❌ No      |
| Firefox <91       | Legacy  | Real plugin list      | <0.5%        | ❌ No      |
| Internet Explorer | Dead    | Empty list            | ~0.1%        | N/A        |

**Bottom line**: Over 93% of users are protected from plugin fingerprinting as of 2024.

## The Internet Explorer Exception

Quick funny story: Internet Explorer never properly supported `navigator.plugins`. It would always return an empty array.

```javascript
// On Internet Explorer 11
navigator.plugins.length; // 0
```

This wasn't a privacy feature—IE just used a completely different plugin system (ActiveX) that didn't integrate with `navigator.plugins`. Accidentally privacy-preserving.

## The Widevine Exception

There's one plugin that modern browsers still expose: **Widevine CDM** (Content Decryption Module). This is used for playing encrypted video (Netflix, YouTube Premium, etc.).

But here's the clever part: the Widevine plugin information is **standardized** across all browsers. So detecting Widevine doesn't help fingerprint you.

## How Trackers Adapted

Killing plugin enumeration was a huge privacy win, but trackers didn't give up. They adapted their techniques:

### 1. Feature Detection

Instead of checking if you have a Java plugin, they'll try to run Java code and see if it works:

```javascript
// Can you run Java?
function hasJava() {
  try {
    new java.lang.String('test');
    return true;
  } catch (e) {
    return false;
  }
}
```

### 2. Codec Detection

Instead of checking for video plugins, they test which codecs you support:

```javascript
function detectCodecs() {
  const video = document.createElement('video');
  return {
    h264: video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '',
    h265: video.canPlayType('video/mp4; codecs="hev1"') !== '',
    vp8: video.canPlayType('video/webm; codecs="vp8"') !== '',
    vp9: video.canPlayType('video/webm; codecs="vp9"') !== '',
    av1: video.canPlayType('video/mp4; codecs="av01"') !== '',
  };
}
```

### 3. Extension Detection

Trackers moved from detecting plugins to detecting browser extensions. That's a whole other fingerprinting vector (and harder to block).

### 4. Font Fingerprinting

Instead of detecting Adobe software via plugins, trackers detect Adobe fonts (which get installed with Adobe software).

## The MDN Documentation

According to MDN Web Docs (the official web standards documentation):

> "The `navigator.plugins` feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, or is in the process of being dropped."

The documentation explicitly states: "Recent versions of the specification hard-code the returned list. If inline viewing of PDF files is supported, the property lists five standard plugins. Otherwise, an empty list is returned."

## VexTrio's Fingerprinting (Real-World Case Study)

A 2024 security analysis by security researchers found that the VexTrio threat group was still using plugin fingerprinting in their tracking scripts.

But here's the thing: **it doesn't work anymore**. Their scripts would detect the hardcoded plugin list and think everyone is the same. The researchers noted that VexTrio's fingerprinting accuracy dropped from ~95% to ~60% after browsers hardcoded plugin lists.

This shows that even sophisticated attackers can't overcome the browser's privacy protections.

## Mobile Browsers Never Had This Problem

Mobile browsers (iOS Safari, Chrome Android, Firefox Android) never had significant plugin support to begin with.

Why? Two reasons:

1. **iOS doesn't allow plugins** - Apple's walled garden approach
2. **Android discouraged plugins** - for security and battery life

So mobile users were always somewhat protected from plugin fingerprinting.

## Can You Still Be Tracked?

The short answer: **not via plugins, unless you're on a really old browser**.

If you're using Chrome 87+, Firefox 91+, Safari 14+, or Edge 87+, you're safe. These browsers return the same hardcoded plugin list for everyone.

But remember: plugin fingerprinting was just one technique. Trackers have many others:

- **Canvas fingerprinting**: 10-15 bits of entropy (still very effective)
- **WebGL fingerprinting**: 8-12 bits of entropy (reveals GPU)
- **Audio fingerprinting**: 4-6 bits of entropy (hardware differences)
- **Font enumeration**: 8-10 bits of entropy (installed fonts)
- **Screen resolution**: 4-6 bits of entropy
- **Timezone**: 3-5 bits of entropy

Killing plugin fingerprinting was important, but it's just one piece of a much larger puzzle.

## The Enumeration Change

Here's a technical detail: the way you enumerate plugins changed too.

Old way (no longer works):

```javascript
for (let plugin in navigator.plugins) {
  console.log(plugin);
}
```

Modern way (still works):

```javascript
for (let i = 0; i < navigator.plugins.length; i++) {
  console.log(navigator.plugins[i]);
}
```

The MDN documentation notes: "Own properties of PluginArray objects are no longer enumerable in the latest browser versions."

This was deliberate—to break legacy fingerprinting scripts that relied on `for...in` loops.

## What About Browser Extensions?

Extensions are different from plugins. Plugins were system-level software (Flash, Java), while extensions are browser-specific add-ons (ad blockers, password managers).

`navigator.plugins` never exposed extensions. But extensions can be detected through other methods (like checking for injected scripts or modified web pages). That's a separate fingerprinting vector.

## The Bottom Line

For over two decades, `navigator.plugins` was one of the most powerful browser fingerprinting techniques. Your plugin list was essentially unique, providing 10+ bits of entropy—enough to track millions of users individually.

But as of 2024, **plugin fingerprinting is effectively dead**. Over 93% of users are protected by modern browsers that return hardcoded, standardized plugin lists.

This is one of the biggest privacy wins in web history. It required coordination across all major browsers (Chrome, Firefox, Safari, Edge) and updates to the web standards themselves.

The lesson? Privacy can improve when browsers work together and when the web platform evolves to close fingerprinting vectors.

But the war isn't over. As one fingerprinting technique dies, trackers invent new ones. Canvas fingerprinting, WebGL fingerprinting, and audio fingerprinting are all still effective. Browser vendors have to keep fighting, and users have to stay informed.

At least we killed this one monster. Small victories matter.

## Sources

1. MDN Web Docs - Navigator.plugins API Reference: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/plugins
2. MDN Web Docs - PluginArray Interface: https://developer.mozilla.org/en-US/docs/Web/API/PluginArray
3. Chrome Status - Return Fixed Lists for navigator.plugins: https://chromestatus.com/feature/5741884322349056
4. Can I Use - Navigator.plugins Browser Support: https://caniuse.com/mdn-api_navigator_plugins
5. Medium - VexTrio's Browser Fingerprinting Analysis (2024): https://gi7w0rm.medium.com/vextrios-browser-fingerprinting-aeb721be6e30
6. Stack Overflow - Detecting Installed Plugins Across Browsers: https://stackoverflow.com/questions/5188908/detecting-installed-plugins-under-different-browsers
7. W3cubDocs - Navigator.plugins Documentation: https://docs.w3cub.com/dom/navigator/plugins
