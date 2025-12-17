# Hardware Concurrency Fingerprinting: Your CPU Is Snitching

Hey there! Let's talk about something that's literally counting against you right now. Your CPU cores are basically broadcasting "Hi, I'm a 2024 MacBook Pro!" or "I'm running on a budget laptop from 2018!" to every website you visit. It's called **navigator.hardwareConcurrency**, and it's one of the most straightforward yet powerful browser fingerprinting techniques out there.

## What Is Hardware Concurrency Anyway?

Think of your CPU (that's the brain of your computer) like a factory. Some factories have 2 workers, some have 4, fancy ones have 8, and absolute monsters have 16 or even 32. The `navigator.hardwareConcurrency` API tells websites exactly how many "workers" (logical CPU cores) your computer has.

Here's how simple it is for websites to check:

```javascript
// That's it. One line of code.
const cores = navigator.hardwareConcurrency;

// Common values:
// 2 cores  → Old phone, budget laptop, Tor Browser (spoofed)
// 4 cores  → Mid-range laptop, mainstream desktop
// 6 cores  → Modern laptop (2022-2023)
// 8 cores  → High-end laptop, gaming desktop
// 12 cores → Workstation, Mac Studio, developer machine
// 16+ cores → Serious workstation, server, or you're building rockets
```

The crazy part? **This single number reveals a ton about you**: your device price range, when you bought it, whether you're a professional or casual user, and even your income bracket (statistically speaking).

## The 2025 CPU Landscape: A Massive Shift

Here's where it gets interesting. The CPU market just went through a huge shake-up, and the data tells a wild story.

### Historical Baseline (Pre-2024)

According to **Firefox Hardware Report** data, the old norm was:

- **70% of Firefox users had exactly 2 cores** (dual-core dominance)
- 4% had 1 core (ancient devices or mobile)
- Only 26% had 4+ cores

This was the era of "good enough" computing. Dual-core was mainstream.

### The 2025 Revolution

**CPU-Z's Q1 2025 validation data** shows everything changed:

| Core Count  | Market Share | Change from 2024 | Typical Devices                                     |
| ----------- | ------------ | ---------------- | --------------------------------------------------- |
| **8 cores** | **24.7%**    | +32.6% ⬆️        | **Now #1** - Gaming laptops, M3 MacBooks, Ryzen 7   |
| **6 cores** | 22.5%        | -6.9% ⬇️         | Modern mainstream laptops, M2 MacBook Air           |
| 4 cores     | ~20%         | Declining        | Mid-range devices, older MacBooks                   |
| 2 cores     | ~15%         | Plummeting       | Budget laptops, old phones, enterprise desktops     |
| 12 cores    | ~10%         | Growing          | Mac Studio M2 Pro, AMD Ryzen 9, Intel i9            |
| 16+ cores   | ~8%          | Growing fast     | Workstations, Threadripper, Mac Studio M2 Max/Ultra |

**What happened?** Apple Silicon (M2/M3 chips with 8+ cores), AMD's Ryzen dominance, and Intel finally catching up made 8-core CPUs **the new normal** in 2024-2025. The 32.6% increase in 8-core adoption in ONE YEAR is absolutely wild.

## Why This Matters for Fingerprinting

Navigator.hardwareConcurrency provides **2-3 bits of entropy** on its own, but the real power comes from what it reveals when combined with other data:

### Device Tier Identification

```javascript
// Pseudo-code showing how trackers think
if (cores === 2) {
  deviceTier = 'Budget or ancient';
  likelyPrice = '$0-$500';
  purchaseYear = '2018-2020 or earlier';
} else if (cores === 4) {
  deviceTier = 'Mainstream';
  likelyPrice = '$500-$900';
  purchaseYear = '2020-2022';
} else if (cores === 8) {
  deviceTier = 'Premium';
  likelyPrice = '$1200-$2500';
  purchaseYear = '2023-2025';
  if (platform.includes('Mac')) {
    device = 'MacBook Pro M3/M2 or iMac';
  }
} else if (cores >= 12) {
  deviceTier = 'Professional/Workstation';
  likelyPrice = '$2500-$10,000+';
  professions = ['Software dev', 'Video editor', '3D artist', 'Data scientist'];
}
```

### Real-World Profiling Examples

**Example 1**: 8 cores + macOS + 16GB RAM + Retina display
**Tracker's guess**: "MacBook Pro 14\" M3, purchased 2024, $1999-$2499, professional user"

**Example 2**: 2 cores + Windows + 4GB RAM + 1366×768 screen
**Tracker's guess**: "Corporate enterprise desktop, Windows 10, IT-managed, budget constraints"

**Example 3**: 16 cores + Linux + 32GB+ RAM
**Tracker's guess**: "Software developer, DevOps engineer, or data scientist running local servers"

## Browser Support and Accuracy

The navigator.hardwareConcurrency API has been supported since:

- **Chrome 37** (2014)
- **Firefox 48** (2016)
- **Safari 10.1** (2017)
- **Edge 15** (2017)

**Accuracy**: 99.9% - This API accurately reports logical core counts (including hyperthreading). If you have a 4-core CPU with hyperthreading, it reports 8.

**Caveats**:

- May return `undefined` on very old browsers (pre-2014)
- Can be capped by browser security settings
- May not reflect actual available cores if OS limits allocation

## The Privacy Problem

Here's the uncomfortable truth: **Hardware information is extremely stable**. You're not upgrading your CPU every month. This single value can track you for **3-5 years** (typical device replacement cycle) or longer.

### What Trackers Learn About You

1. **Economic Status**: 12+ cores = you spent $2500+ on a computer = higher income bracket
2. **Professional vs Consumer**: 8+ cores + specific software fingerprints = professional user
3. **Device Age**: 2 cores in 2025 = you're using ancient hardware (budget constraints or corporate IT)
4. **Technical Savviness**: Custom-built PC with unusual core counts (like 24 cores) = power user
5. **Mobile vs Desktop**: 2-8 cores + mobile screen = phone/tablet, 4-16+ cores + large screen = computer

### Cross-Site Tracking

Imagine this scenario:

- You visit SiteA (shopping) with 8 cores
- You visit SiteB (social media) with 8 cores
- Third-party tracker on both sites: "Hey, that's probably the same 8-core device!"

Combined with screen resolution (3024×1964), timezone (PST), and language (en-US), your **uniqueness skyrockets to 99.5%+**. You're basically carrying a tracking beacon.

## Privacy Browser Protection

Here's how privacy-focused browsers try to fight back:

### Tor Browser: The Nuclear Option

**Strategy**: Always report **2 cores**, no matter what you actually have.

```javascript
// On Tor Browser, even if you have 32 cores:
navigator.hardwareConcurrency; // Always returns 2
```

**Why 2?** Because historically (pre-2024), 70% of users had 2 cores. Tor tries to make everyone look like the majority.

**The Problem**: Now that 8-core is becoming dominant (24.7%), reporting 2 cores is starting to look **suspicious** in 2025. It's like everyone at a party has smartphones and you pull out a flip phone – you stand out.

### Firefox Resist Fingerprinting Mode

**Strategy**: Also spoofs to **2 cores** when `privacy.resistFingerprinting = true`

```javascript
// about:config → privacy.resistFingerprinting = true
// Your 8-core laptop now reports 2 cores
```

According to **Mozilla Bugzilla #1360039**, Firefox chose 2 cores because it's "common enough to provide cover" while not breaking web apps that use this API for performance optimization (like video encoding or multithreaded tasks).

**Adoption Rate**: Only **0.48% of Firefox users** enable this setting (it's off by default and buried in advanced configs).

### Brave Browser: Randomization

Brave takes a different approach. **As of version 1.39+**, Brave applies **slight randomization** to hardware info, but it's minimal:

- 8 cores might report as 8, 7, or 9
- Not enough to break web apps
- Just enough to add noise

**Effectiveness**: Debatable. Reduces precision but doesn't eliminate the fingerprint entirely.

## The Web Worker Angle

Here's something sneaky: even if you block navigator.hardwareConcurrency, websites can **estimate** your core count by spawning Web Workers and measuring performance:

```javascript
// Sneaky core count estimation
async function estimateCores() {
  const start = performance.now();

  // Spawn 32 Web Workers doing heavy computation
  const workers = [];
  for (let i = 0; i < 32; i++) {
    workers.push(new Worker('heavy-task.js'));
  }

  // Measure throughput
  const results = await Promise.all(workers.map((w) => w.execute()));
  const duration = performance.now() - start;

  // Math: If duration scales linearly, few cores. If parallel, many cores.
  const estimatedCores = Math.round((32 * idealTime) / duration);

  return estimatedCores;
}
```

**Accuracy**: 70-85% accurate at guessing core count ranges (2-4 vs 6-8 vs 12+).

According to **Browser-Based CPU Fingerprinting** research from CISPA (2023), this technique can even estimate CPU architecture (Intel vs AMD vs ARM) based on instruction timing differences. Wild.

## The Academic Research

Let's look at what security researchers have found:

### IEEE Conference Publication (2017): "Estimating CPU Features by Browser Fingerprinting"

This landmark paper showed you can fingerprint CPUs down to **specific models** using:

1. navigator.hardwareConcurrency (core count)
2. Performance timing of JavaScript operations
3. Float precision quirks
4. Cache timing attacks via timing APIs

**Result**: **94.6% accuracy** at identifying CPU families (Intel i5 vs i7 vs AMD Ryzen, etc.).

### NDSS Symposium (2017): "Browser Fingerprinting via OS and Hardware Level Features"

Found that hardware concurrency combined with other hardware APIs creates **"super cookies"** that survive:

- Private/incognito mode
- Cookie clearing
- VPN usage
- Even OS reinstallation (if you keep the same hardware)

**Persistence**: Average hardware fingerprint lasts **3.8 years** before device upgrade.

## Real-World Usage Statistics

From **FP-tracer's 2024 study** analyzing 911 domains:

- **7.2% of websites** check navigator.hardwareConcurrency
- Of those, **68% are tracking scripts** (ads, analytics)
- **32% are legitimate** (video streaming quality, WebAssembly optimization)

From **Slido's analysis of 500,000 browser fingerprints** (Medium blog):

- Hardware concurrency was **stable across sessions** for 99.7% of users
- Combined with screen resolution + user agent → **92.3% unique** fingerprints
- Users with unusual core counts (3, 5, 20+) were **100% unique**

## Protection Strategies

### What Actually Works:

1. **Tor Browser** (spoofs to 2 cores)
   ✅ Anonymity within Tor user pool
   ⚠️ Breaks performance-dependent web apps
   ⚠️ Increasingly unusual as 8-core becomes standard

2. **Firefox + privacy.resistFingerprinting**
   ✅ Spoofs to 2 cores
   ⚠️ Must manually enable (only 0.48% do)
   ⚠️ Some site breakage

3. **Accept the Fingerprint + Use Tracker Blockers**
   ✅ Normal browsing experience
   ✅ Blocks third-party tracking scripts
   ⚠️ First-party fingerprinting still works

### What Doesn't Work:

1. **User Agent Spoofing Only** → They check way more than just UA
2. **VPN Only** → Hides IP but not hardware fingerprint
3. **Private/Incognito Mode** → navigator.hardwareConcurrency still works normally
4. **Clearing Cookies** → Hardware fingerprints don't care about cookies

## The Legitimate Use Cases

To be fair, not all uses of navigator.hardwareConcurrency are evil:

**✅ Good Reasons:**

- **Video encoding/streaming**: YouTube adjusts quality and encoding threads based on CPU cores
- **WebAssembly apps**: Games and CAD software optimize thread count
- **Web Workers**: React, Angular, Vue use this to parallelize rendering
- **Performance monitoring**: Developers use this to understand user device capabilities

**❌ Problematic Reasons:**

- **Cross-site tracking**: Building persistent device IDs
- **Price discrimination**: Showing higher prices to users with expensive hardware
- **Ad targeting**: "This person has a Mac Studio (16 cores) → show luxury ads"
- **Paywall decisions**: "Budget device detected → show more aggressive upsells"

## The Bottom Line

Navigator.hardwareConcurrency is a **double-edged sword**. It helps websites optimize performance but also enables precise hardware fingerprinting. Here's my honest take:

**The Reality Check:**

- Your CPU core count is public information to every website
- It's stable for 3-5 years (your device lifespan)
- Combined with 2-3 other metrics, you're 90%+ unique
- Privacy browsers help but introduce tradeoffs

**My Recommendations:**

**For Privacy Paranoid**: Use Tor Browser or Firefox Resist Fingerprinting mode. Accept that some sites will break.

**For Normal Users**: Use a tracker blocker (uBlock Origin, Privacy Badger) and accept that first-party sites can fingerprint you. Focus energy on blocking third-party trackers.

**For Developers**: If you're using hardwareConcurrency for performance, that's cool. If you're using it for tracking, you're part of the problem. Choose wisely.

The web doesn't have to be a surveillance nightmare, but right now, every site knows if you're rocking a $400 laptop or a $4,000 workstation – and they're using that information in ways you'd probably hate if you knew the details.

---

**Sources:**

- [Firefox Hardware Report](https://data.firefox.com/dashboard/hardware) - Historical CPU core distribution data
- [CPU-Z Q1 2025 Statistics](https://www.techpowerup.com/335055/eight-core-cpus-become-the-most-popular-choice-of-pc-users-cpu-z-stats-show) - 8-core CPUs now 24.7% market share
- [Mozilla Bugzilla #1360039](https://bugzilla.mozilla.org/show_bug.cgi?id=1360039) - Firefox spoofing to 2 cores discussion
- [IEEE: Estimating CPU Features by Browser Fingerprinting](https://ieeexplore.ieee.org/document/7794537/) - 94.6% CPU family detection accuracy
- [NDSS 2017: Browser Fingerprinting via OS and Hardware](https://www.ndss-symposium.org/wp-content/uploads/2017/09/ndss2017_02B-3_Cao_paper.pdf) - Hardware-level fingerprinting research
- [CISPA: Browser-Based CPU Fingerprinting](https://publications.cispa.saarland/3745/1/paper.pdf) - CPU architecture estimation techniques
- [MDN: navigator.hardwareConcurrency](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency) - Technical documentation
- [Slido: 500,000 Browser Fingerprints Analysis](https://medium.com/slido-dev-blog/we-collected-500-000-browser-fingerprints-here-is-what-we-found-82c319464dc9) - 92.3% uniqueness with hardware data

**Last Updated**: January 2025 | **Word Count**: 2,200+ words | **Research-Backed**: 8 authoritative sources
