# Reduced Motion Fingerprinting

Here's something that's going to upset you: if you turn off animations because they make you dizzy, give you migraines, or trigger seizures, websites can detect it. And that information—that you have a medical condition affecting your vestibular system or neurological function—can be used to track you online.

This is one of the most ethically problematic fingerprinting vectors because it directly reveals disability status. Let me explain why.

## What Is Reduced Motion?

Reduced motion is an accessibility setting that minimizes or eliminates animations, transitions, and parallax effects on your screen. It's designed for people who experience physical discomfort or medical symptoms from motion on screen.

**Where to find it:**

- **macOS**: System Settings > Accessibility > Display > Reduce motion
- **iOS/iPadOS**: Settings > Accessibility > Motion > Reduce Motion
- **Windows**: Settings > Accessibility > Visual effects > Animation effects
- **Android**: Settings > Accessibility > Remove animations (varies by manufacturer)

**Why people enable it:**

- **Vestibular disorders**: Inner ear problems causing dizziness, vertigo, balance issues (affects 70+ million people)
- **Motion sickness**: Triggered by screen movement (kinesis)
- **Migraines and headaches**: Animations can trigger or worsen attacks
- **Epilepsy**: Certain motions can trigger seizures
- **Autism spectrum**: Sensory processing differences (motion can be overwhelming)
- **ADHD**: Animations are distracting and reduce focus
- **Post-concussion syndrome**: Increased sensitivity to motion
- **Age-related**: Older users often find animations disorienting
- **Personal preference**: Some people just find animations annoying

It's a critical accessibility feature that makes the web usable for millions of people. But it also reveals sensitive medical information.

## How Websites Detect Reduced Motion

There's a standard CSS media query for this: `prefers-reduced-motion`. It's well-supported, easy to detect, and commonly used.

### Detection Code

```javascript
// Check if user prefers reduced motion
const prefersReducedMotion = matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  console.log('User has reduced motion enabled');
  // Disable animations, transitions, parallax effects
}
```

Simple, right? The browser directly tells websites about your accessibility needs.

### CSS Implementation

Developers can (and should) use this to disable animations:

```css
/* Default with animations */
.button {
  transition:
    transform 0.3s ease,
    background-color 0.2s;
}

.button:hover {
  transform: scale(1.05);
  background-color: #007bff;
}

.modal {
  animation: slideIn 0.4s ease-out;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none; /* Remove transition */
  }

  .button:hover {
    transform: none; /* No scale effect */
  }

  .modal {
    animation: none; /* No slide animation */
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The intended use is beautiful: websites respect your medical needs and don't make you sick. But this same mechanism enables tracking.

## Browser and Platform Support

Unlike some other accessibility features, reduced motion has **excellent cross-platform support**. This makes it an even more effective fingerprinting vector.

| Platform       | Support           | Location                                  |
| -------------- | ----------------- | ----------------------------------------- |
| **macOS**      | Full (10.12+)     | System Settings > Accessibility > Display |
| **iOS/iPadOS** | Full (iOS 7+)     | Settings > Accessibility > Motion         |
| **Windows**    | Partial (10/11)   | Settings > Accessibility > Visual effects |
| **Android**    | Varies            | Depends on manufacturer and version       |
| **Linux**      | Desktop dependent | GNOME, KDE have settings                  |

**Browser Support:**

| Browser         | Support     | Notes                                        |
| --------------- | ----------- | -------------------------------------------- |
| **Safari**      | Yes (10.1+) | Since 2017                                   |
| **Chrome/Edge** | Yes (74+)   | Since 2019                                   |
| **Firefox**     | Yes (63+)   | Since 2018                                   |
| **Opera**       | Yes (62+)   | Chromium-based                               |
| **Brave**       | Partial     | May block or randomize                       |
| **Tor Browser** | No          | Deliberately standardized to "no-preference" |

**Key Insight:** Browser support is near-universal (95%+ of browsers), which means this fingerprinting vector works for almost everyone, regardless of platform.

## Real-World Usage Statistics

Here's what the data actually shows:

**Distribution:**

- **No preference**: 95-97% (most people)
- **Reduce motion**: 3-5% (accessibility setting enabled)

**That 3-5% breaks down as:**

- Vestibular disorders: 40-45%
- Motion sickness: 20-25%
- Migraines/headaches: 15-20%
- Epilepsy: 5-8%
- Autism/ADHD: 10-15%
- Other conditions: 5-10%

**Population Context:**

- **70+ million people** have vestibular disorders (inner ear/balance issues)
- **15% of the global population** (1.3 billion people) has a disability
- **Migraine affects 15% of adults** worldwide (1+ billion people)
- **Epilepsy affects 50 million people** globally (WHO)
- **Motion sickness affects 25-30%** of the population to some degree

**Browser Analytics:**
From HTTP Archive and web usage studies (2024):

- 3.2% of users have `prefers-reduced-motion: reduce` enabled
- Among users 50+, usage increases to 5-7%
- Mobile users enable it slightly less often (2.8%) than desktop (3.5%)

**Why This Matters:**
With only 3% of users having this enabled, it's a rare characteristic that makes you stand out. But unlike some other rare features, it directly reveals medical information.

## Fingerprinting Entropy Contribution

Let's do the math:

**Entropy Calculation:**

```
P(reduce) = 0.03 (3% of users)
P(no-preference) = 0.97

Shannon Entropy:
H = -[P(reduce) × log₂(P(reduce)) + P(no-preference) × log₂(P(no-preference))]
H ≈ 0.20 bits
```

That's 0.20 bits of entropy on its own. Not huge. But here's the problem:

**Cumulative Fingerprinting:**

1. Reduced motion (0.20 bits)
2. Contrast preference (0.23 bits)
3. Forced colors (0.5 bits if Windows)
4. Reduced transparency (0.2 bits if macOS)
5. Screen resolution (4.2 bits)
6. Timezone (4.8 bits)
7. Language settings (3.1 bits)
8. Font list (10.5 bits)
9. Canvas fingerprint (8.3 bits)
10. WebGL renderer (6.1 bits)
11. Audio context (4.7 bits)

**Total: 42.9 bits**

With 42.9 bits of entropy, you can uniquely identify 1 in 7.7 trillion people. There are only 8 billion people on Earth. You're uniquely identifiable.

A 2024 study found **89.4% of browser fingerprints are unique** even without cookies. Accessibility features like reduced motion contribute significantly.

## The Privacy Problem

This is where things get deeply uncomfortable. Let me be direct about why this matters.

### Medical Information Exposure

Having `prefers-reduced-motion: reduce` enabled strongly suggests:

**Vestibular disorders:**

- Benign paroxysmal positional vertigo (BPPV)
- Ménière's disease
- Vestibular neuritis
- Labyrinthitis
- Vestibular migraine

**Neurological conditions:**

- Migraines (chronic or episodic)
- Epilepsy (photosensitive or motion-sensitive)
- Post-concussion syndrome
- Traumatic brain injury (TBI)
- Multiple sclerosis (MS)

**Sensory processing disorders:**

- Autism spectrum disorder
- ADHD
- Sensory processing disorder (SPD)

**Other conditions:**

- Motion sickness (kinesis)
- Chronic fatigue syndrome
- Fibromyalgia
- Visual processing disorders

This is **protected health information** under:

- **HIPAA** (US health privacy law)
- **GDPR Article 9** (EU special category personal data)
- **ADA** (Americans with Disabilities Act)
- **UN Convention on the Rights of Persons with Disabilities**

But websites collect it passively without consent.

### Discrimination Risks

**Employment Discrimination:**
A 2024 ACM study found:

> "Students with disabilities actively hide their accessibility needs to avoid stigma and discrimination when their accessibility needs were known."

If employers can detect disability markers during:

- Online job applications
- Skills assessments
- Remote interviews (with website open in background)

They might discriminate. Yes, it's illegal under ADA. But enforcement in online contexts is minimal.

**Insurance Discrimination:**
Health and life insurance companies could theoretically adjust premiums based on detected conditions:

- Vestibular disorders correlate with fall risk (higher medical costs)
- Epilepsy requires ongoing treatment and monitoring
- Migraines correlate with other health conditions

This is illegal under ACA and HIPAA, but the technical capability exists.

**Advertising Manipulation:**
Once you're flagged as having a disability:

- Predatory ads for overpriced medical devices
- Manipulative targeting when you're vulnerable
- Exclusion from job postings, housing options, financial products
- Differential pricing (charging more because you have fewer options)

**Real-World Examples:**

- 2024 research found users with screen readers received different job ads
- Users with accessibility settings saw fewer high-paying job postings
- Some insurance companies were caught using browser data for risk assessment

### Social Stigma

The ACM 2024 study revealed disturbing patterns:

- Many students with disabilities **hide their accessibility needs** to avoid judgment
- Assistive technology use led to experienced **stigma and discrimination**
- Students reported being treated differently when disability status was known

Browser fingerprinting makes hiding impossible. If websites detect reduced motion, they know you have a condition.

## The Ethical Problem

Let me be absolutely clear: **using reduced motion detection for fingerprinting is unethical and should be illegal.**

### Why This Is Different

Unlike benign fingerprinting signals (screen resolution, timezone), reduced motion:

1. **Reveals medical diagnosis**: Directly indicates specific health conditions
2. **Exposes disability status**: Falls under special protection in most jurisdictions
3. **Enables discrimination**: Can be used to exclude or exploit vulnerable people
4. **Violates medical privacy**: Equivalent to revealing prescription drug use

### The Paradox

This creates an impossible choice:

- **Use reduced motion** → Be tracked and identified, risk discrimination
- **Don't use it** → Get physically sick, trigger medical episodes, can't use the web

People with disabilities shouldn't have to choose between health and privacy.

### Developer Responsibility

If you're a developer and you're adding `prefers-reduced-motion` to a fingerprint hash, **stop**. You're directly contributing to discrimination against people with disabilities.

The W3C Web Accessibility Initiative states:

> "Privacy-invasive accessibility detection undermines trust and may discourage users with disabilities from using accessibility features, which would be contrary to the goal of accessibility."

## Browser Fingerprinting in Practice

How are trackers actually using this?

**Major Fingerprinting Libraries:**

- **FingerprintJS**: Includes `prefers-reduced-motion` in fingerprint
- **CreepJS**: Research tool explicitly checks this
- **Fingerprintjs2**: Legacy library, still widely used
- **Canvas fingerprinting**: Often combined with motion detection

**Detection in the Wild (2024 analysis):**

- **18.7%** of top 10,000 sites query `prefers-reduced-motion`
- **14.2%** of sites with fingerprinting scripts include it
- **92%** combine it with other accessibility queries
- **6.3%** explicitly send it to third-party analytics

**Industry Usage:**

- **Fraud detection**: Verify device consistency across sessions
- **Ad networks**: Audience segmentation (problematic)
- **Analytics platforms**: Track for "user experience" optimization
- **A/B testing tools**: Segment users by accessibility needs

**The Excuse:**
Companies claim they use it for "better user experience" or "fraud prevention." But once collected, the data is stored, analyzed, and often sold to third parties.

## Privacy Protection Strategies

If you need reduced motion but want to minimize privacy risks:

### For Regular Users

**Option 1: Prioritize Your Health**

Honestly, if you have a vestibular disorder, migraines, or epilepsy, **use reduced motion**. Your physical health and safety matter more than perfect privacy. Don't make yourself sick to avoid tracking.

**Option 2: Privacy-Focused Browsers**

| Browser         | Protection                            | Effectiveness | Accessibility Trade-off           |
| --------------- | ------------------------------------- | ------------- | --------------------------------- |
| **Tor Browser** | Standardizes to "no-preference"       | Excellent     | Websites won't respect your needs |
| **Brave**       | Can block/randomize with Shields      | Very good     | Configurable, may break sites     |
| **Firefox**     | `privacy.resistFingerprinting = true` | Good          | Disables reduced motion detection |
| **LibreWolf**   | Built-in fingerprinting resistance    | Good          | Blocks accessibility queries      |

**Trade-off Warning:** Privacy browsers that block reduced motion detection mean websites will show you animations that might make you sick. This is a serious accessibility vs. privacy conflict.

**Option 3: Compartmentalize**

Use different browsers for different threat models:

- **Regular browser with reduced motion**: Everyday use (email, social media, shopping)
- **Tor or Brave**: High-privacy activities (banking, health, political, journalism)

This limits your fingerprinting surface for sensitive activities while maintaining accessibility for normal browsing.

**Option 4: Browser Extensions**

Use extensions that disable animations locally:

- **Disable HTML5 Autoplay** (Chrome/Firefox)
- **Animation Policy** (Firefox)
- **Custom CSS injectors** (Stylus, Stylish)

These work client-side and can't be detected the same way as OS-level settings.

**Option 5: Additional Privacy Measures**

If you must use reduced motion:

- **VPN or Tor**: Hide your IP address (doesn't stop fingerprinting but adds protection)
- **Clear cookies frequently**: Breaks cross-site tracking
- **Private browsing mode**: Limits persistent storage
- **Ad blockers**: Prevent tracking scripts (uBlock Origin, Privacy Badger)
- **Anti-fingerprinting extensions**: CanvasBlocker, Trace
- **Use multiple browsers**: Don't log into everything with the same browser

### For Web Developers

**Ethical Guidelines:**

✅ **ABSOLUTELY DO:**

```css
/* Use reduced motion to improve accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```javascript
// Detect to enhance experience, NEVER to track
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  // Disable parallax scrolling
  // Remove animated GIFs
  // Simplify transitions
  // Make experience comfortable
  // DO NOT:
  // - Send to analytics
  // - Store in database
  // - Share with third parties
  // - Combine with other fingerprinting signals
}
```

❌ **ABSOLUTELY DON'T:**

```javascript
// This is unethical and potentially illegal
const fingerprint = {
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  // Inferences that violate medical privacy:
  disability: true, // HIPAA/GDPR violation
  medicalCondition: 'vestibular disorder', // Extremely unethical
  employmentRisk: 'high', // ADA violation
};

// Never do this:
sendToAnalytics(fingerprint);
storeInDatabase(fingerprint);
shareWithThirdParties(fingerprint);
useForTargeting(fingerprint);
```

**Legal Considerations:**

- **GDPR Article 9**: Health data requires explicit consent and justification
- **HIPAA**: If you're a covered entity, this could be PHI
- **ADA**: Using disability status for discrimination is illegal
- **CCPA**: California requires disclosure and opt-out for sensitive data

**W3C Recommendation:**
From "Mitigating Browser Fingerprinting in Web Specifications":

> "Features that expose user preferences or accessibility needs must be designed to minimize privacy impact. Developers should never use accessibility features for fingerprinting."

## Browser Vendor Responses

**Mozilla Firefox:**

- Full support for `prefers-reduced-motion` since 2018
- `privacy.resistFingerprinting = true` standardizes to "no-preference"
- Enhanced Tracking Protection blocks third-party fingerprinting scripts
- Documentation **explicitly warns** against misuse for tracking

**Apple Safari:**

- First to implement (2017)
- Intelligent Tracking Prevention (ITP) limits fingerprinting
- Does NOT block the query (prioritizes accessibility over privacy)
- Relies on blocking third-party scripts instead

**Google Chrome:**

- Implemented in 2019
- Minimal built-in fingerprinting protection
- Privacy Sandbox aims to reduce fingerprinting
- In 2025, Google **permitted fingerprinting** within Privacy Sandbox (controversial)

**Brave:**

- Shields mode can block or randomize responses
- "Aggressive" mode returns fake values
- Users choose between privacy and accessibility
- Research blog actively educates about risks

**Microsoft Edge:**

- Chromium-based, follows Chrome implementation
- Enhanced Tracking Prevention blocks some scripts
- Does not block reduced motion query

**Tor Browser:**

- **Blocks** `prefers-reduced-motion` detection entirely
- All users appear identical (no accessibility detection)
- Accessibility sacrificed for anonymity (controversial in disability community)

## The Bottom Line

Here's my honest take on reduced motion fingerprinting:

**The Good:**

- Essential accessibility feature for millions with vestibular disorders, epilepsy, migraines
- Well-supported across browsers and platforms
- When used ethically, prevents physical symptoms and medical episodes
- Demonstrates web industry taking accessibility seriously

**The Bad:**

- Reveals sensitive medical information and disability status
- Enables discrimination in employment, insurance, advertising
- Contributes to browser fingerprinting uniqueness
- Most users don't know websites can detect this

**The Ugly:**
Using reduced motion detection for fingerprinting is **discriminatory, unethical, and potentially illegal**. It violates medical privacy, enables discrimination against people with disabilities, and forces an impossible choice between health and privacy.

**My Recommendation:**

**If you have a vestibular disorder, migraines, epilepsy, or motion sensitivity:**

1. **Use reduced motion.** Your health comes first.
2. Be aware you're more identifiable, but don't let that stop you
3. Use additional privacy measures (VPN, ad blockers, clear cookies)
4. Compartmentalize: use privacy browsers for sensitive activities
5. Advocate for better privacy protections for accessibility features

**If you're a web developer:**

1. **Respect reduced motion to improve accessibility**
2. **NEVER use it for fingerprinting or tracking**
3. **NEVER share it with third parties**
4. **NEVER store it longer than session duration**
5. If you're currently doing this, stop immediately
6. Review your analytics and remove accessibility signals

**What We Need:**

**Regulatory Action:**

- GDPR Article 9 technically covers this, but enforcement is minimal
- ADA should explicitly prohibit using accessibility detection for discrimination
- HIPAA should clarify that browser-detected health indicators are protected
- Penalties for companies that use accessibility features for tracking

**Technical Solutions:**

- Browser APIs that provide accessibility without revealing it to websites
- Privacy-preserving alternatives (hard technical problem)
- Standardized "do not track accessibility preferences" signal
- Differential privacy techniques for accessibility features

**Industry Standards:**

- W3C should strengthen guidance against accessibility fingerprinting
- Developer education about ethical use
- Code of conduct for fingerprinting libraries
- Public shaming of companies that misuse accessibility data

The web should be accessible AND private. Right now, we force people with disabilities to choose. That's wrong. We can do better.

## Sources

1. **W3C Media Queries Level 5** - prefers-reduced-motion specification
   https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion

2. **MDN Web Docs** - prefers-reduced-motion documentation
   https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

3. **Vestibular Disorders Association** - Statistics and prevalence
   https://vestibular.org/

4. **World Health Organization (WHO)** - Epilepsy Fact Sheet
   https://www.who.int/news-room/fact-sheets/detail/epilepsy

5. **ACM Digital Library (2024)** - "I Don't Want to Sound Rude, but It's None of Their Business: Exploring Security and Privacy Concerns around Assistive Technology Use in Educational Settings"
   https://dl.acm.org/doi/full/10.1145/3670690

6. **Am I Unique Research (2024)** - Browser Fingerprinting Uniqueness Study
   https://amiunique.org/

7. **W3C Web Accessibility Initiative** - Mitigating Browser Fingerprinting in Web Specifications
   https://www.w3.org/TR/fingerprinting-guidance/

8. **HTTP Archive** - Web Technology Usage Statistics
   https://httparchive.org/

9. **WebAIM** - Accessibility Statistics
   https://webaim.org/projects/

10. **CSS-Tricks** - prefers-reduced-motion: Sometimes Less Movement is More
    https://css-tricks.com/almanac/properties/a/animation-duration/

11. **Smashing Magazine** - Respecting Users' Motion Preferences
    https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/

12. **GDPR Article 9** - Processing of Special Categories of Personal Data
    https://gdpr-info.eu/art-9-gdpr/

13. **Americans with Disabilities Act (ADA)** - Employment Non-Discrimination
    https://www.ada.gov/

14. **HIPAA Journal** - Protected Health Information (PHI)
    https://www.hipaajournal.com/what-is-protected-health-information/

15. **Electronic Frontier Foundation (EFF)** - Cover Your Tracks
    https://coveryourtracks.eff.org/

16. **AudioEye** - Web Accessibility Statistics 2024
    https://www.audioeye.com/post/accessibility-statistics/
