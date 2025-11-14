'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCw, Code, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// Metadata for each fingerprint type
const fingerprintMeta: Record<
  string,
  {
    name: string;
    description: string;
    category: string;
    longDescription: string;
    useCases: string[];
  }
> = {
  canvas: {
    name: 'Canvas Fingerprint',
    description: 'Canvas rendering fingerprint',
    category: 'Graphics',
    longDescription: `Canvas fingerprinting is one of the most powerful and widely-used browser fingerprinting techniques. It leverages the HTML5 Canvas API to render text and shapes, then analyzes subtle pixel-level differences that result from variations in graphics hardware, drivers, operating systems, and browser implementations. Different combinations of GPU, graphics drivers, font rendering engines, and anti-aliasing algorithms produce unique rendering signatures that remain remarkably consistent across sessions. The technique works by drawing specific text strings and geometric patterns to an invisible canvas element, converting the rendered output to a Base64-encoded image data URL, and hashing the result to create a unique identifier. Even tiny differences in how a single pixel is anti-aliased can distinguish one system from another, making canvas fingerprinting highly effective for device identification. While privacy-conscious browsers like Tor and Brave implement canvas noise injection to combat this technique, most mainstream browsers remain vulnerable, with canvas fingerprints providing uniqueness scores often exceeding 90%.`,
    useCases: [
      'Bot detection',
      'Fraud prevention',
      'Device identification',
      'Analytics',
    ],
  },
  webgl: {
    name: 'WebGL Fingerprint',
    description: 'WebGL GPU information',
    category: 'Graphics',
    longDescription: `WebGL fingerprinting extracts detailed information about your graphics card and 3D rendering capabilities by querying the WebGL API. This technique reveals the GPU vendor (NVIDIA, AMD, Intel, Apple), specific graphics card model, driver version, supported extensions, rendering capabilities, and shader precision. The WebGL renderer and vendor strings often contain specific hardware identifiers that uniquely distinguish different systems. Additionally, WebGL fingerprinting can analyze rendering performance characteristics, maximum texture sizes, supported compressed texture formats, and floating-point precision capabilities. Modern browsers expose over 50 WebGL parameters and dozens of extensions that collectively create a highly distinctive fingerprint. Graphics drivers introduce subtle implementation differences in how WebGL functions execute, making this fingerprint extremely stable and difficult to spoof. Anti-fingerprinting measures like returning generic values for UNMASKED_VENDOR_WEBGL and UNMASKED_RENDERER_WEBGL can partially mitigate this technique, but many other WebGL parameters remain exposed.`,
    useCases: [
      'Graphics detection',
      'Device ID',
      '3D optimization',
      'Security',
    ],
  },
  navigator: {
    name: 'Navigator Information',
    description: 'Browser properties',
    category: 'Browser',
    longDescription: `The Navigator API exposes comprehensive information about your browser, operating system, and device capabilities through the window.navigator object. This includes the user agent string (containing browser name, version, and OS details), platform identifier, language preferences, hardware concurrency (CPU cores), device memory, maximum touch points, cookie enablement status, do-not-track preference, and dozens of other properties. Modern browsers also expose connection type, battery status, media capabilities, Bluetooth availability, USB device access, and VR capabilities through navigator extensions. While user agent strings are commonly spoofed, the combination of all navigator properties creates a distinctive fingerprint that's difficult to fake consistently. For example, a browser claiming to be Chrome on Windows but reporting navigator.platform as 'MacIntel' reveals an inconsistency. The Navigator API also exposes feature detection capabilities through methods like navigator.getBattery(), navigator.credentials, and navigator.storage, which vary significantly across browsers and operating systems. Privacy-focused browsers randomize or restrict some navigator properties, but maintaining consistency across all properties while appearing legitimate remains challenging.`,
    useCases: [
      'Browser detection',
      'Locale customization',
      'Feature enablement',
    ],
  },
  screen: {
    name: 'Screen Information',
    description: 'Screen characteristics',
    category: 'Hardware',
    longDescription: `Screen fingerprinting collects detailed display characteristics including screen resolution (width and height), available screen space (excluding taskbars/docks), color depth (bits per pixel), pixel density ratio (devicePixelRatio for high-DPI displays), and orientation (portrait/landscape). These parameters collectively create a surprisingly distinctive fingerprint, as the combination of specific screen dimensions, color depth, and pixel ratio is often unique, especially for less common display configurations. High-resolution monitors, ultra-wide displays, and multi-monitor setups produce particularly distinctive fingerprints. The devicePixelRatio is especially revealing, with values like 1.25, 1.5, 2, or 3 corresponding to specific device models (Apple Retina displays, Windows scaling settings, etc.). Additional parameters like screen.availWidth vs. screen.width can reveal OS-level taskbar configurations. Modern devices also expose orientation information through screen.orientation, which changes when users rotate mobile devices or tablets. While screen fingerprinting alone provides moderate uniqueness, it becomes highly effective when combined with other fingerprinting techniques, particularly canvas and WebGL, which also depend on display characteristics.`,
    useCases: ['Responsive design', 'Device type ID', 'Display quality'],
  },
  fonts: {
    name: 'Font Detection',
    description: 'System fonts',
    category: 'System',
    longDescription: `Font fingerprinting identifies installed system fonts by measuring text rendering dimensions. The technique works by creating invisible DOM elements with specific fonts applied, measuring their rendered width and height, and comparing against known dimensions for different fonts. Since text renders differently depending on which fonts are available, measuring the same text string with different font-family declarations reveals which fonts are installed. Operating systems ship with different default font sets (Arial, Helvetica, Times New Roman, etc.), and users often install additional fonts for professional work, games, or design applications. The combination of installed fonts creates a highly distinctive fingerprint. For example, Adobe Creative Cloud users typically have hundreds of Adobe-branded fonts, programmers install coding fonts like Fira Code or JetBrains Mono, and gamers may have game-specific fonts. Font fingerprinting can distinguish between Windows, macOS, and Linux systems based on default fonts, identify specific OS versions (Windows 11 vs. Windows 10), detect language packs, and even infer user professions based on specialized fonts. Privacy browsers attempt to restrict font enumeration by limiting font access or returning standard font sets, but this makes users more identifiable by their unusual font configuration.`,
    useCases: ['OS detection', 'Typography', 'Device fingerprinting'],
  },
  timezone: {
    name: 'Timezone',
    description: 'Timezone and locale',
    category: 'System',
    longDescription: `Timezone fingerprinting collects geographic and localization data including timezone offset from UTC, timezone name, locale preferences, calendar system, number formatting conventions, currency settings, date/time formatting patterns, and internationalization (i18n) capabilities. The JavaScript Date object and Intl API expose comprehensive localization information that varies significantly across regions and language preferences. Timezone offset alone provides coarse geographic location (e.g., UTC-8 suggests Pacific time zone), but timezone name reveals precise location (America/Los_Angeles vs. America/Vancouver). Locale preferences (navigator.languages) expose user language rankings, which combined with timezone create distinctive patterns. For example, a user with timezone 'America/New_York' and languages ['en-US', 'es-419'] suggests a Spanish-speaking user in New York. The Intl API exposes detailed formatting preferences: number grouping characters, decimal separators, currency symbols, calendar types (Gregorian vs. Buddhist vs. Islamic), and day-of-week conventions. These preferences reflect cultural and regional settings that are difficult to fake consistently. Even if users employ VPNs to mask IP geolocation, timezone and locale fingerprints often reveal actual geographic location. Modern privacy browsers randomize timezone to UTC to prevent location tracking, but this makes users highly identifiable by their unusual timezone configuration.`,
    useCases: ['Geo detection', 'Localization', 'Time features'],
  },
  audio: {
    name: 'Audio Fingerprint',
    description: 'Audio processing',
    category: 'Audio',
    longDescription: `Audio fingerprinting leverages the Web Audio API to detect subtle differences in how browsers and hardware process audio signals. The technique creates an AudioContext, generates oscillator tones at specific frequencies, processes them through various audio nodes (compressors, filters, analyzers), and measures the resulting waveform data. Different combinations of audio hardware, drivers, digital signal processing (DSP) implementations, and browser audio stacks produce measurably different results even when processing identical input signals. The fingerprint captures sample rate capabilities, number of audio channels, latency characteristics, supported audio context types, and most importantly, the precise numeric output of processed audio signals. Even variations in floating-point arithmetic implementations between browser engines cause tiny differences in audio processing that create distinctive signatures. Audio fingerprints are particularly effective because audio hardware and drivers vary significantly across devices, manufacturers implement proprietary DSP algorithms, and browser engines have different audio rendering paths. Unlike canvas fingerprinting which can be visually inspected, audio fingerprinting operates invisibly, making it difficult for users to detect. Privacy browsers attempt to normalize audio output by adding noise or returning standardized values, but this defense mechanism itself becomes a fingerprinting signal, as normalized audio signatures are rare among general users.`,
    useCases: ['Hardware detection', 'Device ID', 'Security'],
  },
  'media-devices': {
    name: 'Media Devices',
    description: 'Cameras and microphones',
    category: 'Hardware',
    longDescription: `Media devices fingerprinting enumerates available cameras, microphones, and speakers using the MediaDevices API (navigator.mediaDevices.enumerateDevices()). This reveals the number, type, and capabilities of connected media hardware without actually accessing the devices or requesting permissions. Device labels, group IDs, and capabilities create distinctive fingerprints, especially for users with professional audio equipment, multiple monitors with built-in webcams, USB microphones, or Bluetooth headsets. The mere presence and count of devices is highly revealing: most laptops have 1-2 cameras (front and optional IR camera for Windows Hello) and 1-2 microphones, while desktop setups vary widely. Professional creators may have 3-4 cameras, multiple microphones, and several audio outputs connected simultaneously. Even when device labels are restricted before permission is granted, the number and types of devices (audioinput, videoinput, audiooutput) provide fingerprinting signals. Device IDs, while randomized per session in some browsers, remain consistent within a session and across same-origin contexts. Media capabilities (resolution support, frame rates, audio sampling rates) further distinguish devices. While permission-gating prevents detailed device access without user consent, enumeration alone provides sufficient entropy for fingerprinting, and users who grant camera/microphone permissions expose complete hardware configurations including specific model names and capabilities.`,
    useCases: ['Device availability', 'Hardware config', 'A/V optimization'],
  },
  'emoji-rendering': {
    name: 'Emoji Rendering',
    description: 'Emoji characteristics',
    category: 'Graphics',
    longDescription: `Emoji rendering fingerprinting exploits OS and font-specific differences in how emoji characters are rendered and measured. Different operating systems ship with different emoji fonts (Apple Color Emoji, Segoe UI Emoji on Windows, Noto Color Emoji on Android/Linux), and these fonts render emoji at different sizes and with different visual styles. The technique measures the rendered dimensions of specific emoji characters using DOM measurement APIs (getBoundingClientRect), detecting pixel-perfect differences that reveal the underlying OS and emoji font version. For example, the 👨‍👩‍👧‍👦 family emoji might render as 48x32 pixels on macOS, 45x30 pixels on Windows 11, and 42x28 pixels on Android. Emoji sequences with zero-width joiners (ZWJ) are particularly revealing because OS support varies: newer systems render complex emoji sequences as single glyphs, while older systems display them as separate characters. Emoji skin tone modifiers (🏻, 🏼, 🏽, 🏾, 🏿) and gender variants also render differently across platforms. By testing dozens of emoji, including recently-added Unicode emoji that older systems don't support, the technique can determine OS, OS version, emoji font version, and even specific update levels. Users on Windows 10 might render 💾 (floppy disk) differently than Windows 11 users due to emoji font updates. This fingerprinting method is extremely stable because emoji fonts are system-level components that users rarely modify manually.`,
    useCases: ['Font detection', 'OS ID', 'Typography'],
  },
  'speech-voices': {
    name: 'Speech Voices',
    description: 'TTS voices',
    category: 'Audio',
    longDescription: `Speech synthesis voice fingerprinting enumerates text-to-speech (TTS) voices available through the SpeechSynthesis API (window.speechSynthesis.getVoices()). Operating systems ship with different default voice sets: macOS includes dozens of high-quality voices in multiple languages, Windows provides Microsoft's Speech Platform voices, Android includes Google TTS voices, and Linux typically has minimal or no preinstalled voices. Users who install additional language packs, accessibility features, or third-party TTS engines expose even more distinctive voice configurations. Each voice object reveals the voice name, language (BCP 47 code), whether it's local or remote, URI, and whether it's the default voice. The combination of available voices, their languages, and their order creates a highly distinctive fingerprint. For example, a system with voices in English, Mandarin, and Spanish suggests a trilingual user or organization, while extensive language coverage might indicate a developer or translator. Voice availability also correlates strongly with OS and OS version: macOS Monterey includes voices that macOS Big Sur lacks, Windows 11 adds natural neural voices absent in Windows 10. The technique requires no permissions and executes silently, making it difficult for users to detect. Privacy browsers typically return an empty or normalized voice list, but this itself becomes a fingerprinting signal since most browsers expose numerous voices by default.`,
    useCases: ['TTS capability', 'Language support', 'OS detection'],
  },
  'svg-rendering': {
    name: 'SVG Rendering',
    description: 'SVG characteristics',
    category: 'Graphics',
    longDescription: `SVG rendering fingerprinting analyzes how browsers render and measure Scalable Vector Graphics elements to detect browser engine and platform differences. Unlike canvas fingerprinting which focuses on raster graphics, SVG fingerprinting exploits vector graphics rendering variations. The technique creates SVG elements with specific shapes, text, filters, and effects, then measures their rendered bounding boxes, path lengths, and geometric properties using DOM measurement APIs. Different browser rendering engines (Blink, Gecko, WebKit) implement SVG specifications differently, resulting in measurable discrepancies in path lengths, text positioning, filter effects, and transformation matrices. For example, measuring the length of a complex SVG path might yield 1234.56789 in Chrome but 1234.56792 in Firefox due to floating-point arithmetic differences. SVG text rendering is particularly revealing because it combines font rendering (like regular font fingerprinting) with vector graphics precision. Advanced SVG features like clip-paths, masks, blend modes, and filter primitives (feGaussianBlur, feColorMatrix) render with subtle differences across browsers. GPU-accelerated SVG rendering on some platforms introduces additional variations. OS-level graphics libraries (CoreGraphics on macOS, DirectWrite on Windows, FreeType on Linux) influence SVG rendering, making this technique effective for OS detection. Even SVG animations and SMIL timing can be measured to detect browser differences. The fingerprint remains stable because SVG rendering engines are deeply integrated into browser codebases and rarely change significantly between versions.`,
    useCases: ['Vector support', 'Rendering engine', 'Graphics capability'],
  },
  'math-precision': {
    name: 'Math Precision',
    description: 'Math operations',
    category: 'System',
    longDescription: `Math precision fingerprinting tests the accuracy and consistency of JavaScript mathematical operations across different browsers, platforms, and CPU architectures. Despite JavaScript's specification of IEEE 754 double-precision floating-point arithmetic, actual implementations exhibit subtle differences due to compiler optimizations, CPU instruction sets (x86 vs. ARM vs. RISC-V), JIT compiler behavior, and math library implementations. The technique performs complex mathematical operations (trigonometric functions, logarithms, exponentials, hyperbolic functions) with specific inputs, then captures results to extreme precision (15-17 significant digits). For example, Math.tan(Math.PI) should theoretically return 0, but actual implementations return tiny non-zero values that vary by platform: some return 1.2246467991473532e-16, others return -1.2246467991473532e-16. Testing Math.sin, Math.cos, Math.tan, Math.asin, Math.acos, Math.atan with edge-case inputs reveals implementation differences. Math constants like Math.PI, Math.E, Math.LN2 are computed differently by different math libraries. Advanced operations like Math.pow, Math.sqrt, Math.cbrt with specific inputs expose CPU instruction set differences: x86 processors with x87 FPU exhibit different rounding behavior than ARM processors with NEON. JavaScript engines (V8, SpiderMonkey, JavaScriptCore) optimize math operations differently, producing measurably different results. While differences are tiny (typically in the 15th decimal place), they're consistent and provide reliable fingerprinting entropy. This technique is impossible to fake without perfectly emulating another system's entire math stack.`,
    useCases: ['Engine detection', 'Precision testing', 'Platform ID'],
  },
  'css-styles': {
    name: 'CSS Styles',
    description: 'Computed styles',
    category: 'Browser',
    longDescription: `CSS styles fingerprinting analyzes browser default stylesheets, computed styles, and CSS implementation differences to identify browsers and platforms. Each browser ships with a default stylesheet (user agent stylesheet) that applies baseline styles to HTML elements, and these defaults vary significantly across browsers. For example, default font families differ: Chrome uses '-webkit-standard', Firefox uses '-moz-default', Safari uses '-apple-system'. The technique creates DOM elements and queries their computed styles using window.getComputedStyle(), revealing default values for hundreds of CSS properties including fonts, colors, spacing, borders, backgrounds, and animations. System font stacks are particularly revealing: CSS font-family:'system-ui' resolves to 'Segoe UI' on Windows, 'San Francisco' on macOS, 'Roboto' on Android, and 'Ubuntu' on Linux. Color space support, color() function implementations, and default color values vary across browsers. CSS custom property (CSS variable) implementations differ in how they handle inheritance and fallbacks. Modern CSS features like container queries, cascade layers, :has() selector, and subgrid have varying support levels that precisely identify browser versions. Vendor-prefixed properties (-webkit-, -moz-, -ms-) reveal rendering engines. CSS animation and transition timing functions use different easing algorithms. Even measuring default form control styles (buttons, inputs, selects) exposes OS-level theming: macOS form controls look distinct from Windows controls even in the same browser. Privacy browsers attempt to normalize CSS but maintaining consistency across thousands of CSS properties while appearing legitimate is nearly impossible.`,
    useCases: ['Browser defaults', 'System fonts', 'Platform detection'],
  },
  'text-metrics': {
    name: 'Text Metrics',
    description: 'Text rendering',
    category: 'Graphics',
    longDescription: `Text metrics fingerprinting measures precise dimensions of rendered text using Canvas TextMetrics API and DOM measurement techniques to detect font rendering engine differences. When text is rendered, different combinations of operating system, browser, font rendering library (DirectWrite, CoreText, FreeType), and anti-aliasing settings produce measurably different text dimensions. The technique uses Canvas measureText() to obtain detailed metrics including width, actualBoundingBoxLeft, actualBoundingBoxRight, actualBoundingBoxAscent, actualBoundingBoxDescent, fontBoundingBoxAscent, fontBoundingBoxDescent, emHeightAscent, emHeightDescent, hangingBaseline, alphabeticBaseline, and ideographicBaseline. These measurements are captured to sub-pixel precision (often 10+ decimal places) revealing tiny differences in how text is measured. For example, the text 'Hello World' in 'Arial 16px' might measure exactly 87.37890625 pixels wide on Windows but 87.40234375 pixels on macOS. Different fonts, sizes, and text strings amplify these differences. Unicode text with diacritics, ligatures, combining characters, and bidirectional text (Hebrew, Arabic) expose additional rendering variations. CJK characters (Chinese, Japanese, Korean) are particularly revealing due to significant font differences across platforms. The fingerprint captures metrics for dozens of test strings across multiple fonts and sizes. Text rendering also varies based on canvas rendering context settings like textRendering, fontKerning, and fontVariantCaps. This technique is extremely stable because font rendering is a core OS component that rarely changes between sessions.`,
    useCases: ['Font detection', 'Typography', 'Engine ID'],
  },
  'html-element': {
    name: 'HTML Element',
    description: 'Element features',
    category: 'Browser',
    longDescription: `HTML element fingerprinting analyzes the DOM API surface area by inspecting properties and methods available on HTML element prototypes. JavaScript provides full introspection capabilities, allowing enumeration of all properties, methods, getters, setters, and symbols defined on HTMLElement and its descendants (HTMLDivElement, HTMLImageElement, etc.). Different browsers implement different sets of DOM APIs: Chrome exposes Chrome-specific APIs, Firefox has Gecko-specific extensions, Safari includes WebKit proprietary APIs. Even standardized APIs have implementation differences in property ordering, method signatures, and default values. The technique enumerates Object.getOwnPropertyNames(), Object.getOwnPropertySymbols(), and walks the prototype chain for element types, counting properties and detecting specific API presence. For example, checking for webkitRequestFullscreen vs. mozRequestFullscreen vs. requestFullscreen reveals rendering engines. Proprietary properties like element.offsetParent, element.clientRects, or specific dataset properties vary. Modern APIs like element.attachShadow, element.animate, element.getAnimations, and Intersection Observer have varying support levels corresponding to browser versions. Checking for deprecated APIs (document.all, element.align) helps identify older browsers. The order of properties in enumeration is browser-specific due to different object layout strategies in JavaScript engines. This technique also detects polyfills and JavaScript libraries that extend element prototypes, revealing the website's technology stack. Privacy browsers can't easily normalize DOM APIs without breaking legitimate feature detection code, making this fingerprinting technique highly effective and stable.`,
    useCases: ['Feature detection', 'API testing', 'Browser version'],
  },
  'console-errors': {
    name: 'Console Errors',
    description: 'Error patterns',
    category: 'System',
    longDescription: `Console errors fingerprinting analyzes JavaScript error messages, stack trace formats, and console API implementations to identify JavaScript engines and platforms. Different JavaScript engines (V8 in Chrome/Edge, SpiderMonkey in Firefox, JavaScriptCore in Safari) generate distinctly formatted error messages and stack traces. Error messages for the same error type vary: a TypeError might say "Cannot read property 'x' of null" in Chrome but "null has no properties" in Firefox. Stack trace formats differ significantly: V8 uses indented multi-line traces with "at function (file:line:col)", SpiderMonkey uses "@file:line:col" format, JavaScriptCore has its own format. The technique intentionally triggers various error types (TypeError, ReferenceError, RangeError, SyntaxError) and captures their string representations and stack traces. Even the depth of captured stack traces varies by browser and recursion limits differ. Console API methods (console.log, console.error, console.table) have different implementations: some browsers stringify objects differently, array display formats vary, and custom formatters are engine-specific. Checking for non-standard console methods (console.memory in Chrome, console.exception in old Firefox) reveals browser types. Error.captureStackTrace availability (V8-specific) is a strong signal. The global Error object's properties (fileName, lineNumber, columnNumber, stack) are implemented inconsistently. This fingerprinting technique is particularly effective against headless browsers and automation tools (Puppeteer, Selenium) which often have distinctive error patterns or missing console implementations. Privacy browsers cannot easily normalize error behavior without potentially breaking error handling code.`,
    useCases: ['Engine ID', 'Error handling', 'Browser implementation'],
  },
  'dom-rect': {
    name: 'DOM Rectangle',
    description: 'Measurement precision',
    category: 'Browser',
    longDescription: `DOM rectangle fingerprinting measures the precision and behavior of element geometry measurement APIs including getBoundingClientRect(), getClientRects(), offsetWidth, offsetHeight, clientWidth, clientHeight, scrollWidth, and scrollHeight. Different browser layout engines (Blink, Gecko, WebKit) calculate element dimensions with varying levels of precision and rounding behavior. The technique creates elements with specific CSS properties (fractional pixel dimensions, transforms, scaling) and measures their reported dimensions to many decimal places. For example, an element with width:'100.5px' might report exactly 100.5, 100.49999..., or 101 depending on browser rounding. Sub-pixel rendering implementations differ: some browsers use floating-point precision throughout the layout engine, others round at certain stages. CSS transforms (scale, rotate, skew) combined with measurements expose browser-specific matrix calculations. The DOMRect object's properties (x, y, width, height, top, right, bottom, left) are computed through different code paths in different engines. Testing elements at various zoom levels (browser zoom, devicePixelRatio) reveals rounding and scaling algorithms. Elements with CSS box-sizing, borders, padding, and margins have slightly different measurement behaviors across browsers. iframe dimensions, SVG element measurements, and ::before/::after pseudo-element dimensions add more measurement variations. The fingerprint captures hundreds of measurements across different element types and CSS configurations. Since layout engine code is deeply integrated into browser cores and optimized for performance, this fingerprint is extremely stable and nearly impossible to spoof without reimplementing entire layout engines.`,
    useCases: ['Layout engine', 'Precision testing', 'Rendering differences'],
  },
  'mime-types': {
    name: 'MIME Types',
    description: 'Supported types',
    category: 'Browser',
    longDescription: `MIME types fingerprinting enumerates browser-supported media types and codecs through multiple APIs including navigator.mimeTypes (deprecated but still exposed), HTMLMediaElement.canPlayType(), MediaSource.isTypeSupported(), and MediaRecorder.isTypeSupported(). Different browsers, browser versions, operating systems, and installed codecs produce vastly different lists of supported media formats. For example, Safari natively supports H.265/HEVC video while Chrome requires special builds, Firefox supports Ogg Theora/Vorbis while Chrome dropped support, and Microsoft Edge includes Windows Media codecs that other browsers lack. The technique tests hundreds of MIME type strings including video codecs (H.264, VP9, AV1, HEVC), audio codecs (AAC, Opus, FLAC, MP3), image formats (WebP, AVIF, JPEG XL), and container formats (MP4, WebM, MKV, OGG). Results include 'probably', 'maybe', or '' (not supported), providing graded confidence levels. Codec parameters like profile levels (avc1.42E01E, avc1.64001F) reveal hardware decoding capabilities and OS codecs. Media Source Extensions (MSE) support varies: some browsers support MSE for certain formats but not others. MediaRecorder API support indicates recording capabilities. Proprietary formats (Windows Media, RealMedia, QuickTime) are OS-specific. DRM support (Encrypted Media Extensions) varies significantly: Widevine on Chrome/Firefox, FairPlay on Safari, PlayReady on Edge. Audio context support for different sample rates and channel configurations adds entropy. The combination of codec support creates a highly distinctive fingerprint that correlates strongly with browser, OS, OS version, and installed media frameworks. This fingerprint also evolves as browsers add/remove codec support, potentially enabling browser version detection.`,
    useCases: ['Format support', 'Plugin availability', 'Capability testing'],
  },
  'anti-fingerprint': {
    name: 'Anti-Fingerprinting',
    description: 'Privacy tools',
    category: 'Privacy',
    longDescription: `Anti-fingerprinting detection identifies browser privacy features, extensions, and tools designed to prevent or mitigate fingerprinting. This meta-fingerprinting technique detects the very defenses users employ to avoid fingerprinting, ironically making them more identifiable. The technique checks for indicators of privacy browsers (Tor Browser, Brave), anti-fingerprinting extensions (Canvas Defender, Privacy Badger, uBlock Origin), VPNs, and browser modifications. Detection methods include: checking for injected canvas noise (drawing a canvas and checking if pixel values fluctuate between renders), detecting blocked or spoofed APIs (checking if certain properties return null or generic values), measuring timing inconsistencies (privacy tools introduce delays or noise in performance.now()), detecting user agent spoofing (checking for inconsistencies between navigator.userAgent and actual API availability), and identifying generic or rounded fingerprint values. For example, Tor Browser returns 'America/New_York' timezone for all users regardless of actual location, makes all screens appear 1000x900, limits canvas to 8-bit color depth, and disables WebGL entirely - these uniform values paradoxically make Tor users highly identifiable as a group. Brave's fingerprinting randomization adds subtle noise to canvas and audio, but the presence of this noise pattern itself is detectable. Extensions that block navigator.getBattery() or navigator.mediaDevices create API unavailability that's suspicious in modern browsers. Headless browsers (used for automation) often have missing window.chrome object, webdriver flags set to true, or unusual console properties. The technique compiles a 'lies' score indicating detected inconsistencies or anti-fingerprinting measures, ironically providing additional entropy that makes privacy-conscious users more trackable within their privacy-tool cohort.`,
    useCases: ['Privacy detection', 'Bot detection', 'Headless browsers'],
  },
  'content-window': {
    name: 'Content Window',
    description: 'iframe features',
    category: 'Browser',
    longDescription: `ContentWindow fingerprinting analyzes iframe contentWindow objects and cross-origin communication capabilities to detect browser implementation details and security policies. iframes create separate browsing contexts with their own window objects, and how browsers implement these contexts varies significantly. The technique creates same-origin and cross-origin iframes, then enumerates properties and methods on their contentWindow objects, tests property accessibility, measures timing of cross-origin operations, and analyzes security error messages. Different browsers implement Content Security Policy (CSP), Cross-Origin Resource Sharing (CORS), and Same-Origin Policy with subtle variations. For example, Firefox throws specific NS_ERROR_DOM_SECURITY_ERR exceptions while Chrome throws DOMException with different messages. The sandboxed iframe implementation varies: checking for properties blocked by sandbox='allow-scripts' reveals browser security models. Testing window.parent, window.top, window.frames relationships across iframe boundaries exposes browser security enforcement. MessageChannel and postMessage() implementations have timing and serialization differences. Checking for iframe-specific properties like window.frameElement, checking for blocked operations in cross-origin scenarios, and testing navigation between about:blank and data: URIs reveal browser behaviors. Some browsers expose different sets of properties on cross-origin windows versus same-origin windows. The technique also tests for frame busting defenses, X-Frame-Options enforcement, and CSP frame-ancestors implementation. Automated browsers and privacy browsers often have unusual iframe implementations: missing frameElement, altered postMessage behavior, or modified same-origin checks. This fingerprint is stable because security policies are core browser features that rarely change within versions.`,
    useCases: ['Iframe capability', 'Sandbox testing', 'API differences'],
  },
  'css-media': {
    name: 'CSS Media Queries',
    description: 'Media queries',
    category: 'Browser',
    longDescription: `CSS media queries fingerprinting tests browser support for and responses to media queries and system preference queries. Modern CSS provides extensive media features for responsive design and accessibility, but support and behavior vary across browsers and platforms. The technique tests dozens of media queries including: prefers-color-scheme (light/dark mode), prefers-reduced-motion (accessibility), prefers-contrast, forced-colors (high contrast mode), prefers-reduced-transparency, prefers-reduced-data (data saver mode), color-gamut (display color capabilities), dynamic-range (HDR support), screen color depth, aspect ratio ranges, and device orientation. Each query reveals system settings and capabilities: a user with prefers-color-scheme:dark likely has OS-level dark mode enabled, prefers-reduced-motion:reduce suggests accessibility settings or motion sensitivity. Display capabilities like color-gamut:p3 indicate wide-gamut displays (often Apple devices), dynamic-range:high indicates HDR screens. Browser support for newer media queries correlates strongly with browser version: older browsers don't recognize prefers-contrast or forced-colors. The technique also tests deprecated or browser-specific media features: -webkit-min-device-pixel-ratio, -moz-device-pixel-ratio, -ms-high-contrast. Interaction media features (hover, pointer, any-hover, any-pointer) distinguish touch devices from mouse-driven systems: pointer:coarse indicates touchscreens while pointer:fine indicates mice. Testing all combinations creates a rich fingerprint capturing display technology, user preferences, accessibility settings, and browser capabilities. This data is particularly stable because it reflects both hardware capabilities and deliberate user preference choices, both of which change infrequently. The fingerprint also correlates strongly with user demographics and device types.`,
    useCases: [
      'Dark mode detection',
      'Motion preferences',
      'Display capabilities',
      'Accessibility',
    ],
  },
  lies: {
    name: 'Lies Detection',
    description: 'Inconsistency analysis',
    category: 'Privacy',
    longDescription: `Lies detection fingerprinting identifies inconsistencies and contradictions in browser fingerprint data that indicate spoofing, privacy tools, or automation. This advanced meta-analysis technique cross-references hundreds of browser properties to detect when reported values don't match expected relationships. The fundamental principle is that authentic browsers exhibit consistent correlations between properties: if navigator.userAgent claims "Windows", then navigator.platform should be "Win32", navigator.appVersion should contain "Windows", and OS-specific APIs like navigator.msSaveBlob should exist. Privacy tools and browser spoofers often modify individual properties without updating all related properties, creating detectable inconsistencies. The technique performs extensive cross-validation: checking if navigator.languages matches Accept-Language headers, verifying Intl.DateTimeFormat().resolvedOptions().timeZone aligns with timezone offset, confirming screen dimensions match CSS media queries, validating WebGL vendor/renderer strings correspond to claimed GPU, ensuring audio/canvas fingerprints align with claimed hardware, and detecting when plugins list contradicts navigator.plugins. Advanced checks identify timing anomalies (operations completing too fast or too slow), mathematical impossibilities (screen dimensions larger than maximum supported resolution), and feature mismatches (claiming to be mobile Safari but missing Mobile Safari-specific APIs). Headless browsers (Puppeteer, Playwright) often have characteristic lies: missing or unusual navigator.webdriver, absent chrome.runtime despite claiming to be Chrome, or window.outerWidth/outerHeight being zero. The technique assigns a "trust score" based on detected inconsistencies. Ironically, users attempting to avoid fingerprinting by spoofing browser properties often make themselves more identifiable through the unique pattern of lies their tools create. Privacy browsers like Tor Browser avoid lies by consistently modifying all related properties, but their uniform fingerprint becomes its own identifying characteristic.`,
    useCases: [
      'Spoof detection',
      'Bot identification',
      'Automation detection',
      'Privacy tool identification',
    ],
  },
  webrtc: {
    name: 'WebRTC Fingerprint',
    description: 'Real-time communication',
    category: 'Network',
    longDescription: `WebRTC fingerprinting exploits the Real-Time Communication API to gather network information, including local IP addresses, network interfaces, media capabilities, and connection characteristics that uniquely identify devices and network configurations. WebRTC's RTCPeerConnection creates peer-to-peer connections for audio/video communication, but in doing so, necessarily exposes network details. The technique creates RTCPeerConnection objects, uses createOffer() to generate Session Description Protocol (SDP) offers, and parses the resulting SDP strings to extract ICE (Interactive Connectivity Establishment) candidates containing local IP addresses, including IPv4 and IPv6 addresses for all network interfaces (WiFi, Ethernet, VPN, virtual adapters). Even behind NAT and firewalls, WebRTC reveals internal private network addresses (192.168.x.x, 10.x.x.x) that provide fingerprinting entropy. The technique also enumerates media devices, codecs, and capabilities through RTCRtpSender.getCapabilities() and RTCRtpReceiver.getCapabilities(), revealing supported video codecs (H.264, VP8, VP9, AV1), audio codecs (Opus, G.711, iSAC), RTP header extensions, and RTCP feedback mechanisms. Different browsers, browser versions, and operating systems support different codec configurations, profile levels, and extension parameters. Hardware acceleration capabilities affect codec support: devices with hardware H.265 decoding report different capabilities than software-only systems. Additional fingerprinting comes from STUN/TURN server connectivity tests, mDNS hostname leakage, and timing characteristics of connection establishment. VPN users attempting to hide their real IP address often fail because WebRTC bypasses VPN tunnels and reveals the actual local network configuration. Modern browsers implement privacy protections like mDNS masking and ICE candidate filtering, but these protections themselves become fingerprinting signals. Privacy-conscious users disable WebRTC entirely, but WebRTC unavailability is a strong signal distinguishing privacy-focused users from mainstream users.`,
    useCases: [
      'IP detection',
      'Network analysis',
      'VPN detection',
      'Peer-to-peer capability',
    ],
  },
  'service-worker': {
    name: 'Service Worker',
    description: 'Worker capabilities',
    category: 'Browser',
    longDescription: `Service Worker fingerprinting analyzes the availability, capabilities, and behavior of Service Worker API, which provides offline functionality, background sync, and push notifications for Progressive Web Apps. Service Worker support varies significantly across browsers and contexts: desktop browsers generally support Service Workers, while some mobile browsers (especially older versions or privacy-focused browsers) have limited or no support. The technique checks navigator.serviceWorker availability, tests registration capabilities in different scopes, enumerates supported events (install, activate, fetch, push, sync, message), and measures Service Worker lifecycle timing. Different browsers implement Service Worker specifications with varying levels of completeness: some support Background Sync, others don't; Push API support varies; Cache API implementations differ; and postMessage serialization capabilities vary. The technique creates test Service Workers and measures their execution characteristics: script evaluation time, cache API performance, fetch event interception capabilities, and message passing overhead. Service Workers run in a separate thread/process, and their isolation characteristics differ by browser: V8 Isolates in Chrome, separate processes in Firefox, different sandboxing in Safari. Testing which Service Worker features are available reveals browser version precisely: newer APIs like Background Fetch, Periodic Background Sync, or Content Index are only available in recent browser versions. The technique also detects unusual Service Worker implementations in headless browsers or automation tools: missing Service Worker support despite claiming modern browser version, unusual timing characteristics, or API availability mismatches. Corporate environments often disable Service Workers through Content Security Policy, creating distinctive fingerprints. Privacy browsers may restrict Service Worker capabilities to prevent tracking via persistent cache. Checking whether Service Workers persist across private/incognito mode reveals browser privacy implementations. The combination of Service Worker availability, supported features, timing characteristics, and integration with other APIs creates a distinctive fingerprint that correlates strongly with browser type, version, and deployment environment.`,
    useCases: [
      'PWA capability',
      'Offline support',
      'Background sync',
      'Browser version detection',
    ],
  },
  'screen-frame': {
    name: 'Screen Frame Detection',
    description: 'Screen frame and taskbar',
    category: 'Hardware',
    longDescription: `Screen frame fingerprinting detects the presence and size of operating system UI elements like taskbars, docks, menu bars, and window chrome by comparing screen.width/height with screen.availWidth/availHeight. This reveals OS-specific interface configurations that are highly stable per user. Windows users with taskbars, macOS users with menu bars and docks, and Linux users with various window managers create distinctive patterns. The technique can identify dual-monitor setups, vertical vs horizontal taskbar placement, taskbar auto-hide settings, and even taskbar size customizations. Combined with screen resolution, this creates a powerful fingerprinting signal that's difficult to spoof without full OS emulation.`,
    useCases: [
      'OS detection',
      'Interface layout',
      'Multi-monitor setup',
      'User preferences',
    ],
  },
  'screen-resolution': {
    name: 'Screen Resolution',
    description: 'Detailed display metrics',
    category: 'Hardware',
    longDescription: `Screen resolution fingerprinting captures precise display dimensions including width, height, pixel density (devicePixelRatio), orientation, and available screen space. Specific resolution combinations often map to exact device models: 1920×1080 suggests standard monitors, 2560×1440 indicates QHD displays, 3024×1964 precisely identifies MacBook Pro 14", and 2532×1170 maps to iPhone 12/13 Pro. The devicePixelRatio is particularly revealing: 2.0 for Retina displays, 1.5 for Windows scaling, 3.0 for high-end mobile devices. Unusual resolutions like ultra-wide monitors (3440×1440, 5120×1440) or portrait displays create highly unique fingerprints. This data correlates strongly with socioeconomic status and professional use cases.`,
    useCases: [
      'Device model inference',
      'Responsive design',
      'Display quality tier',
      'Hardware profiling',
    ],
  },
  'color-depth': {
    name: 'Color Depth',
    description: 'Display color bits',
    category: 'Hardware',
    longDescription: `Color depth fingerprinting detects bits-per-pixel color representation capabilities via screen.colorDepth and screen.pixelDepth. Modern displays typically report 24-bit (16.7M colors) or 30-bit (1.07B colors, HDR displays), while older or low-end displays may report 16-bit (65K colors). Tor Browser standardizes this to 8-bit for anonymity, making 8-bit color depth a strong privacy browser indicator. Professional displays with 10-bit color depth (30-bit total) indicate high-end hardware used by photographers, video editors, and designers. This metric rarely changes without hardware replacement, providing stable fingerprinting entropy.`,
    useCases: [
      'Display quality',
      'Professional hardware detection',
      'Privacy browser identification',
      'HDR capability',
    ],
  },
  'hardware-concurrency': {
    name: 'Hardware Concurrency',
    description: 'CPU core count',
    category: 'Hardware',
    longDescription: `Hardware concurrency fingerprinting detects the number of logical CPU cores via navigator.hardwareConcurrency. This reveals device performance tier: 2 cores indicate budget laptops or older devices, 4 cores represent mainstream consumer hardware, 8 cores suggest high-end consumer or entry-level workstation devices, 12-16 cores indicate professional workstations, and 24+ cores point to servers or high-end workstations. This value correlates strongly with device purchase price and user demographics. Professional users (developers, video editors, 3D artists) typically have higher core counts. Mobile devices report 6-8 cores (efficiency + performance cores on ARM). This metric is extremely stable unless hardware is upgraded.`,
    useCases: [
      'Device tier identification',
      'Performance profiling',
      'User demographics',
      'Professional vs consumer',
    ],
  },
  'device-memory': {
    name: 'Device Memory',
    description: 'RAM amount detection',
    category: 'Hardware',
    longDescription: `Device memory fingerprinting detects approximate RAM amount via navigator.deviceMemory (in GB). Browsers round and cap this value for privacy: mobile devices report 1-8 GB, consumer laptops report 4-16 GB, workstations report 32+ GB. Low values (1-2 GB) indicate budget mobile devices or old hardware, 4-8 GB represents mainstream devices, 16-32 GB suggests power users or professionals, 64+ GB indicates workstations or servers. This correlates strongly with device price, purchase date, and user needs. Professional users in fields like video editing, machine learning, or software development typically have higher RAM. The value is stable unless hardware is upgraded.`,
    useCases: [
      'Hardware capability',
      'Device price tier',
      'User profiling',
      'Performance estimation',
    ],
  },
  languages: {
    name: 'Language Preferences',
    description: 'User language settings',
    category: 'System',
    longDescription: `Language preferences fingerprinting enumerates navigator.languages array revealing user language rankings and locale preferences. The order of languages is highly distinctive: primary language indicates user's native language or primary region, secondary languages reveal bilingual capabilities or regions lived in, and rare language combinations create unique fingerprints. For example, ['en-US', 'zh-CN', 'ja-JP'] suggests a multilingual user in tech, ['es-419', 'en-US'] indicates Hispanic American, ['ar-SA', 'en-GB'] suggests Middle Eastern user educated in UK. This data correlates with timezone, keyboard layout, and system fonts to create geographic and cultural profiles. Corporate or institutional language settings can be detected. The array order is stable per user.`,
    useCases: [
      'Locale detection',
      'Content personalization',
      'Geographic profiling',
      'Cultural background inference',
    ],
  },
  platform: {
    name: 'Platform Detection',
    description: 'OS platform string',
    category: 'System',
    longDescription: `Platform fingerprinting reads navigator.platform to detect the operating system and architecture. Common values include 'Win32' (Windows), 'MacIntel' (macOS x86_64), 'Linux x86_64', 'iPhone', 'iPad', 'Android'. Despite being deprecated in favor of User-Agent Client Hints, navigator.platform remains widely available and is difficult to spoof consistently. Mismatches between platform and other OS indicators (like screen resolution, fonts, or WebGL vendor strings) reveal spoofing attempts. Some browsers return generic values ('Linux x86_64' for privacy), but this consistency itself becomes a fingerprinting signal. The value is extremely stable and only changes with OS reinstallation or hardware changes.`,
    useCases: [
      'OS detection',
      'Architecture identification',
      'Spoofing detection',
      'Cross-platform compatibility',
    ],
  },
  vendor: {
    name: 'Browser Vendor',
    description: 'Vendor identification',
    category: 'Browser',
    longDescription: `Browser vendor fingerprinting reads navigator.vendor to identify browser manufacturer. Common values: 'Google Inc.' (Chrome/Edge), 'Apple Computer, Inc.' (Safari), '' (Firefox leaves this empty). This simple property helps distinguish Chromium-based browsers from Firefox and Safari. When combined with other navigator properties, it creates a reliable browser family detection mechanism. Spoofed user agents that claim to be one browser while navigator.vendor indicates another reveal inconsistencies. The value is stable across browser sessions and rarely changes without browser reinstallation.`,
    useCases: [
      'Browser identification',
      'Chromium vs others',
      'Vendor-specific features',
      'Consistency validation',
    ],
  },
  plugins: {
    name: 'Browser Plugins',
    description: 'Installed plugin enumeration',
    category: 'Browser',
    longDescription: `Plugin fingerprinting enumerates installed browser plugins via navigator.plugins (deprecated but still exposed in many browsers). Historically revealed Flash, Java, PDF readers, and multimedia codecs. Modern browsers return empty or minimal plugin arrays, but enterprise environments or users with legacy software may expose plugins. Plugin presence, order, and versions create distinctive fingerprints. Chrome extensions may expose themselves as plugins. The technique also checks navigator.mimeTypes for associated MIME type handlers. Most privacy-conscious browsers return empty plugin arrays, making plugin presence itself a signal. Legacy enterprise browsers with Java or Silverlight are easily identified.`,
    useCases: [
      'Legacy software detection',
      'Enterprise environment',
      'Plugin availability',
      'Browser age estimation',
    ],
  },
  'touch-support': {
    name: 'Touch Support',
    description: 'Touch input detection',
    category: 'Hardware',
    longDescription: `Touch support fingerprinting detects touchscreen capabilities via navigator.maxTouchPoints and CSS media query (pointer: coarse). Desktop computers typically report 0 touch points, tablets report 5-10, and smartphones report 5. Windows touchscreen laptops report 10 touch points, creating a distinctive signature. Combined with screen size, this reliably distinguishes device types: large screen + no touch = desktop, small screen + touch = mobile, large screen + touch = touchscreen laptop/tablet. Some desktop users with touchscreen monitors create unique fingerprints. The value is stable per device.`,
    useCases: [
      'Device type detection',
      'Mobile vs desktop',
      'Input method optimization',
      'UI adaptation',
    ],
  },
  'pdf-viewer': {
    name: 'PDF Viewer Support',
    description: 'Native PDF rendering',
    category: 'Browser',
    longDescription: `PDF viewer fingerprinting detects native PDF rendering capability by checking navigator.plugins for PDF viewers or testing MIME type support. Chrome and Edge have built-in PDF.js viewers, Firefox includes PDF.js, Safari has native PDF rendering, while some browsers require external PDF readers. The presence, version, and capabilities of PDF viewers create fingerprinting entropy. Enterprise browsers may have PDF viewers disabled or use specific PDF readers. Mobile browsers typically support PDF viewing natively. The technique tests application/pdf MIME type support and rendering capabilities.`,
    useCases: [
      'PDF rendering capability',
      'Browser feature detection',
      'Enterprise policy',
      'Viewer availability',
    ],
  },
  'cookies-enabled': {
    name: 'Cookies Enabled',
    description: 'Cookie support status',
    category: 'Browser',
    longDescription: `Cookie support fingerprinting checks navigator.cookieEnabled to detect if cookies are allowed. Most modern browsers enable cookies by default (returns true), but privacy-conscious users, corporate policies, or privacy browsers may disable cookies (returns false). This creates a binary signal that, while low entropy alone, becomes significant when combined with other privacy indicators. Users with cookies disabled often have other privacy settings enabled, creating a privacy-conscious user cluster. The value can change if users modify browser settings but is generally stable.`,
    useCases: [
      'Storage capability',
      'Privacy settings',
      'Browser configuration',
      'Tracking prevention detection',
    ],
  },
  'color-gamut': {
    name: 'Color Gamut',
    description: 'Display color space',
    category: 'Hardware',
    longDescription: `Color gamut fingerprinting detects display color space capabilities via CSS media queries: (color-gamut: srgb), (color-gamut: p3), (color-gamut: rec2020). Most displays support sRGB (standard), Apple displays and high-end monitors support P3 (wide gamut), and cutting-edge displays support Rec.2020 (ultra-wide gamut). P3 support strongly indicates Apple hardware (MacBook Pro, iMac, Pro Display XDR, iPhone 12+) or high-end professional displays ($1000+). This reveals device price tier, brand, and professional use cases (photography, video editing, color-critical work). The value is extremely stable per device.`,
    useCases: [
      'Display quality tier',
      'Apple device detection',
      'Professional display',
      'Color accuracy needs',
    ],
  },
  'indexed-db': {
    name: 'IndexedDB Support',
    description: 'IndexedDB availability',
    category: 'Browser',
    longDescription: `IndexedDB fingerprinting detects browser database API support via window.indexedDB. Modern browsers universally support IndexedDB, but privacy browsers may disable it, older browsers lack it, and some corporate policies block it. IndexedDB absence in a modern browser context suggests privacy extensions, incognito mode restrictions, or security policies. The technique can also test IndexedDB capabilities: storage quotas, transaction modes, and versioning support, which vary by browser. Detecting IndexedDB availability helps identify browser age and privacy settings.`,
    useCases: [
      'Storage API detection',
      'Browser capability',
      'Privacy mode detection',
      'Offline app support',
    ],
  },
  'local-storage': {
    name: 'Local Storage',
    description: 'LocalStorage availability',
    category: 'Browser',
    longDescription: `LocalStorage fingerprinting checks window.localStorage availability and capabilities. While nearly universal in modern browsers, LocalStorage may be disabled in private/incognito mode, blocked by privacy extensions, or restricted by corporate policies. The technique tests not just availability but also quota limits, which vary by browser and mode. Safari in private mode disables LocalStorage, Chrome allows it with restrictions. Testing storage persistence across sessions reveals private browsing mode. LocalStorage absence in modern browsers is a strong privacy signal.`,
    useCases: [
      'Storage capability',
      'Private mode detection',
      'Browser storage policy',
      'Data persistence',
    ],
  },
  'session-storage': {
    name: 'Session Storage',
    description: 'SessionStorage availability',
    category: 'Browser',
    longDescription: `SessionStorage fingerprinting checks window.sessionStorage availability and behavior. Similar to LocalStorage but session-scoped, SessionStorage may be disabled in privacy modes or restricted environments. The technique tests storage limits, persistence behavior, and cross-tab isolation. SessionStorage typically has similar availability to LocalStorage but different persistence semantics. Testing both storage APIs together reveals browser storage policies and privacy modes. Unavailability suggests strict privacy settings or restricted environments.`,
    useCases: [
      'Session persistence',
      'Browser storage',
      'Privacy detection',
      'Temporary data capability',
    ],
  },
  'open-database': {
    name: 'Open Database',
    description: 'WebSQL/OpenDatabase API',
    category: 'Browser',
    longDescription: `OpenDatabase fingerprinting detects deprecated WebSQL API via window.openDatabase. While removed from modern browsers, Safari and older Chrome/Android browsers still support it. Presence indicates Safari (most likely) or older browser versions. WebSQL was deprecated in 2010 but Safari continues supporting it for legacy compatibility. This makes it a strong Safari identifier and mobile Safari detector. Testing openDatabase availability alongside other deprecated APIs creates a browser vintage profile. Modern browsers return undefined, creating a binary signal.`,
    useCases: [
      'Safari detection',
      'Legacy API support',
      'Browser age',
      'Mobile Safari identification',
    ],
  },
  'date-time-locale': {
    name: 'Date/Time Locale',
    description: 'Formatting preferences',
    category: 'System',
    longDescription: `Date/time locale fingerprinting analyzes Intl.DateTimeFormat().resolvedOptions() to extract detailed locale preferences including timezone, calendar system, numbering system, hour cycle (12h vs 24h), date/time formatting patterns, and regional preferences. The combination of these settings is highly distinctive: timezone reveals geographic location, calendar system indicates cultural background (Gregorian, Buddhist, Islamic, Hebrew), hour cycle shows regional preferences (US uses 12h, most of world uses 24h), and numbering system reveals language preferences. This data correlates with navigator.languages and timezone to create precise geographic and cultural profiles. The settings are stable and reflect user's deliberate configuration choices.`,
    useCases: [
      'Locale detection',
      'Time formatting',
      'Calendar system',
      'Regional preferences',
    ],
  },
  architecture: {
    name: 'CPU Architecture',
    description: 'Processor architecture',
    category: 'System',
    longDescription: `CPU architecture fingerprinting attempts to detect processor architecture (x86, x86_64, ARM, ARM64) through various navigator properties, platform strings, and capability detection. While not directly exposed in modern browsers due to privacy concerns, architecture can be inferred from platform string ('Win32' vs 'Win64'), feature detection (WebAssembly SIMD extensions), performance characteristics, and WebGL renderer strings. ARM-based Macs report specific patterns, Windows on ARM has distinctive characteristics, and x86_64 is standard on most desktops. This reveals device type and is particularly useful for detecting Apple Silicon Macs vs Intel Macs.`,
    useCases: [
      'Processor type',
      'Apple Silicon detection',
      'Architecture-specific features',
      'Performance profiling',
    ],
  },
  'cpu-class': {
    name: 'CPU Class',
    description: 'Legacy IE property',
    category: 'System',
    longDescription: `CPU class fingerprinting checks the deprecated navigator.cpuClass property, which was specific to Internet Explorer and returned values like 'x86', 'x64', 'ARM', 'PPC'. Modern browsers don't implement this property, so its presence indicates IE or very old browser versions. This creates a strong signal for legacy browser detection. Testing for cpuClass alongside other IE-specific properties (like navigator.browserLanguage, navigator.systemLanguage) creates an IE detection profile. Modern browsers return undefined.`,
    useCases: [
      'IE detection',
      'Legacy browser',
      'Old version identification',
      'Enterprise environment',
    ],
  },
  'os-cpu': {
    name: 'OS CPU',
    description: 'Operating system CPU info',
    category: 'System',
    longDescription: `OS CPU fingerprinting reads navigator.oscpu (Firefox-specific) or constructs similar info from other properties. Firefox returns strings like 'Windows NT 10.0; Win64; x64' or 'Intel Mac OS X 10.15'. This property is Firefox-specific, making its presence a Firefox identifier. The string reveals OS version, architecture, and sometimes processor details. Chrome and Safari don't expose oscpu, so its presence/absence helps distinguish browsers. The technique also checks for inconsistencies between oscpu and other OS indicators to detect spoofing.`,
    useCases: [
      'Firefox detection',
      'OS version',
      'Architecture info',
      'Browser consistency validation',
    ],
  },
  'vendor-flavors': {
    name: 'Vendor Flavors',
    description: 'Browser-specific features',
    category: 'Browser',
    longDescription: `Vendor flavors fingerprinting detects browser-specific objects, prefixes, and proprietary APIs that distinguish browsers. Chrome has window.chrome, Safari has window.safari and window.ApplePaySession, Firefox has window.InstallTrigger (older versions), Edge has window.Windows (older versions). The technique checks for vendor-prefixed APIs: -webkit- (Safari, Chrome), -moz- (Firefox), -ms- (IE/old Edge), -o- (Opera). Testing these creates a browser fingerprint that reveals not just browser family but specific versions and forks. Some privacy tools remove vendor objects, creating inconsistencies detectable as spoofing.`,
    useCases: [
      'Browser identification',
      'Vendor detection',
      'Fork identification',
      'Spoofing detection',
    ],
  },
  'reduced-motion': {
    name: 'Reduced Motion',
    description: 'Motion sensitivity preference',
    category: 'Accessibility',
    longDescription: `Reduced motion fingerprinting detects prefers-reduced-motion CSS media query, indicating user preference to minimize non-essential motion and animations. Enabled by users with motion sensitivity, vestibular disorders, or general preference for reduced animation. While intended for accessibility, this setting has low adoption (1-2% of users) making it a distinctive fingerprint. The setting reveals medical information and should be used for accessibility purposes only, not tracking. Privacy-conscious users sometimes enable this for battery saving or performance. The value is stable per user unless they change accessibility settings.`,
    useCases: [
      'Accessibility accommodation',
      'Animation control',
      'Medical indication',
      'Performance preference',
    ],
  },
  'reduced-transparency': {
    name: 'Reduced Transparency',
    description: 'Transparency preference',
    category: 'Accessibility',
    longDescription: `Reduced transparency fingerprinting detects prefers-reduced-transparency media query, indicating user preference for reduced transparency effects in UI elements. This accessibility feature is available on macOS and iOS, where users can enable "Reduce Transparency" in accessibility settings to improve readability and reduce visual distraction. This setting has very low adoption (<1% of users), making it highly distinctive. It reveals Apple device usage, accessibility needs, and user preferences. Should be used for UI adaptation, not tracking. The value is stable per user.`,
    useCases: [
      'Accessibility',
      'UI adaptation',
      'Readability enhancement',
      'Apple device detection',
    ],
  },
  'inverted-colors': {
    name: 'Inverted Colors',
    description: 'Color inversion preference',
    category: 'Accessibility',
    longDescription: `Inverted colors fingerprinting detects inverted-colors media query, indicating OS-level color inversion for accessibility. This feature is used by users with light sensitivity, specific visual impairments, or preference for inverted color schemes. Available on macOS, iOS, and some accessibility-focused platforms. This setting has extremely low adoption (<0.5%), making it very distinctive. It reveals medical/accessibility information and should only be used for UI accommodation. The presence of this setting often correlates with other accessibility features. Highly stable per user.`,
    useCases: [
      'Accessibility accommodation',
      'Visual impairment support',
      'Medical indication',
      'UI inversion',
    ],
  },
  monochrome: {
    name: 'Monochrome Display',
    description: 'Grayscale display detection',
    category: 'Hardware',
    longDescription: `Monochrome fingerprinting detects grayscale display capability via (monochrome) media query. True monochrome displays are extremely rare in modern computing, so this typically indicates e-ink displays (e-readers like Kindle), specialized accessibility devices, or grayscale mode enabled in accessibility settings. Some users enable grayscale mode to reduce eye strain, limit distractions, or save battery on mobile devices. Detection of monochrome mode creates a highly distinctive fingerprint due to rarity. The value changes if users toggle grayscale mode in accessibility settings.`,
    useCases: [
      'E-ink device detection',
      'Accessibility mode',
      'Grayscale preference',
      'Rare display type',
    ],
  },
  'forced-colors': {
    name: 'Forced Colors',
    description: 'High contrast mode',
    category: 'Accessibility',
    longDescription: `Forced colors fingerprinting detects Windows High Contrast mode via (forced-colors: active) media query. This Windows-specific accessibility feature replaces website colors with system colors for better visibility. Used by users with visual impairments, light sensitivity, or preference for high contrast. Adoption is 1-2% (Windows accessibility users), making it distinctive. The setting strongly indicates Windows OS and accessibility needs. It reveals medical information and should be used for accessibility, not tracking. The value is stable per user and very OS-specific.`,
    useCases: [
      'Windows detection',
      'High contrast support',
      'Visual impairment',
      'Accessibility accommodation',
    ],
  },
  hdr: {
    name: 'HDR Support',
    description: 'High dynamic range',
    category: 'Hardware',
    longDescription: `HDR fingerprinting detects High Dynamic Range display support via (dynamic-range: high) media query. HDR displays include MacBook Pro 14"/16" (2021+), Pro Display XDR, high-end gaming monitors ($800+), flagship smartphones (iPhone 12+, Galaxy S21+), and professional video editing displays. HDR support is rare (5-8% of users), making it distinctive. It reveals premium device ownership ($2000+), professional use cases (video editing, photography, gaming), high income, and recent purchase. This enables socioeconomic profiling. The value is stable per device and hardware-dependent.`,
    useCases: [
      'Premium device detection',
      'Professional display',
      'Display quality',
      'Socioeconomic indicator',
    ],
  },
  contrast: {
    name: 'Contrast Preference',
    description: 'Contrast level preference',
    category: 'Accessibility',
    longDescription: `Contrast preference fingerprinting detects prefers-contrast media query values: no-preference (98%), more (1.5%), less (0.3%), custom (0.2%). Users with visual impairments or light sensitivity increase contrast, while users with photophobia decrease contrast. This accessibility setting has low adoption, making it distinctive. It reveals medical/accessibility information and should be used for UI adaptation only. The setting correlates with other accessibility preferences. Highly stable per user and indicates deliberate accessibility configuration.`,
    useCases: [
      'Accessibility',
      'Contrast adjustment',
      'Visual impairment support',
      'UI adaptation',
    ],
  },
  'private-click-measurement': {
    name: 'Private Click Measurement',
    description: 'Apple PCM API',
    category: 'Privacy',
    longDescription: `Private Click Measurement (PCM) fingerprinting detects Apple's privacy-preserving ad attribution API via checking for HTMLAnchorElement.prototype.attributionSourceId. This API is Safari/WebKit-exclusive (iOS 14.1+, macOS Safari 14.1+), making it a strong Safari and Apple ecosystem indicator. The API provides ad attribution without third-party cookies, replacing traditional cookie-based tracking. PCM support indicates Safari browser, Apple device, and relatively recent OS version. Adoption matches Safari's market share (15-20% globally, higher on mobile). This creates a binary signal with moderate entropy but strong platform indication.`,
    useCases: [
      'Safari detection',
      'Apple device identification',
      'Privacy-preserving attribution',
      'WebKit indicator',
    ],
  },
  'font-preferences': {
    name: 'Font Preferences',
    description: 'System default fonts',
    category: 'System',
    longDescription: `Font preferences fingerprinting detects system default fonts for generic families (serif, sans-serif, monospace, cursive, fantasy) by rendering text and measuring dimensions. Different operating systems ship with different defaults: Windows uses Times New Roman/Arial/Consolas, macOS uses Times/Helvetica/Courier, Linux uses Liberation/Ubuntu fonts. These defaults provide OS detection with 70-80% accuracy. User customization of default fonts is rare but creates highly unique fingerprints. Professional users may customize fonts: developers install coding fonts (Fira Code, JetBrains Mono), designers have Adobe fonts. This reveals OS, OS version, language packs, professional software, and user customization. Highly stable per system.`,
    useCases: [
      'OS detection',
      'OS version identification',
      'Font customization',
      'Professional software detection',
    ],
  },
};

interface ScanStep {
  name: string;
  status: 'pending' | 'scanning' | 'completed';
}

export default function FingerprintPlayground({ type }: { type: string }) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const [progress, setProgress] = useState(0);

  const meta = fingerprintMeta[type];

  // Define scan steps for different fingerprint types
  const getScanSteps = (fingerprintType: string): string[] => {
    const commonSteps = [
      'Initializing browser APIs',
      'Collecting data',
      'Analyzing results',
      'Generating fingerprint',
    ];

    const typeSpecificSteps: Record<string, string[]> = {
      canvas: [
        'Creating canvas context',
        'Rendering text patterns',
        'Drawing geometric shapes',
        'Extracting pixel data',
        'Hashing canvas output',
      ],
      webgl: [
        'Initializing WebGL context',
        'Querying GPU vendor',
        'Testing extensions',
        'Measuring rendering capabilities',
        'Analyzing shader precision',
      ],
      navigator: [
        'Reading user agent',
        'Checking platform info',
        'Analyzing language preferences',
        'Testing hardware capabilities',
        'Collecting system properties',
      ],
      audio: [
        'Creating audio context',
        'Generating oscillator signals',
        'Processing audio nodes',
        'Measuring output characteristics',
        'Computing audio fingerprint',
      ],
      fonts: [
        'Measuring baseline fonts',
        'Testing system fonts',
        'Checking custom fonts',
        'Analyzing render dimensions',
        'Building font signature',
      ],
      lies: [
        'Collecting all browser data',
        'Cross-referencing properties',
        'Detecting inconsistencies',
        'Analyzing tampering patterns',
        'Computing trust score',
      ],
      webrtc: [
        'Creating peer connection',
        'Gathering ICE candidates',
        'Extracting IP addresses',
        'Testing STUN servers',
        'Analyzing network topology',
      ],
      'service-worker': [
        'Testing SW support',
        'Checking feature availability',
        'Measuring registration timing',
        'Testing cache performance',
        'Analyzing SW capabilities',
      ],
    };

    return typeSpecificSteps[fingerprintType] || commonSteps;
  };

  const updateProgress = (stepIndex: number, totalSteps: number) => {
    const progressPercent = ((stepIndex + 1) / totalSteps) * 100;
    setProgress(progressPercent);
  };

  const loadFingerprint = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const steps = getScanSteps(type);
    const initialSteps: ScanStep[] = steps.map((name) => ({
      name,
      status: 'pending',
    }));
    setScanSteps(initialSteps);

    try {
      // Import the collector dynamically to run in browser
      const collectors = await import('@creepjs/core');

      // Simulate step-by-step progress
      for (let i = 0; i < steps.length; i++) {
        // Update current step to 'scanning'
        setScanSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: 'scanning' } : step
          )
        );

        // Simulate processing time for better UX
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Update progress
        updateProgress(i, steps.length);

        // On the last step, actually collect the fingerprint
        if (i === steps.length - 1) {
          const collectorMap: Record<string, () => unknown | Promise<unknown>> =
            {
              canvas: collectors.collectCanvasFingerprint,
              webgl: collectors.collectWebGLFingerprint,
              navigator: collectors.collectNavigatorFingerprint,
              screen: collectors.collectScreenFingerprint,
              fonts: collectors.collectFontsFingerprint,
              timezone: collectors.collectTimezoneFingerprint,
              audio: collectors.collectAudioFingerprint,
              'media-devices': collectors.collectMediaDevicesFingerprint,
              'emoji-rendering': collectors.collectClientRectsFingerprint,
              'speech-voices': collectors.collectVoicesFingerprint,
              'svg-rendering': collectors.collectSVGFingerprint,
              'math-precision': collectors.collectMathFingerprint,
              'css-styles': collectors.collectCSSFingerprint,
              'text-metrics': collectors.collectTextMetricsFingerprint,
              'html-element': collectors.collectHTMLElementFingerprint,
              'console-errors': collectors.collectConsoleErrorsFingerprint,
              'dom-rect': collectors.collectDomRectFingerprint,
              'mime-types': collectors.collectMimeTypesFingerprint,
              'anti-fingerprint': collectors.collectResistanceFingerprint,
              'content-window': collectors.collectContentWindowFingerprint,
              'css-media': collectors.collectCSSMediaFingerprint,
              lies: async () => {
                const fingerprintData = await collectors.collectFingerprint();
                return collectors.collectLiesFingerprint(fingerprintData.data);
              },
              webrtc: collectors.collectWebRTCFingerprint,
              'service-worker': collectors.collectServiceWorkerFingerprint,
            };

          const collector = collectorMap[type];
          if (!collector) {
            setError('Invalid fingerprint type');
            return;
          }

          const result = await collector();
          setData(result);
        }

        // Mark step as completed
        setScanSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: 'completed' } : step
          )
        );
      }
    } catch {
      setError('Failed to collect fingerprint. Please try again.');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const loadMarkdownContent = async () => {
    try {
      const response = await fetch(`/content/fingerprints/${type}.md`);
      if (response.ok) {
        const text = await response.text();
        setMarkdownContent(text);
      }
    } catch {
      // Silent fail - markdown content is optional
    }
  };

  useEffect(() => {
    if (type && fingerprintMeta[type]) {
      void loadFingerprint();
      void loadMarkdownContent();
    } else {
      setError('Invalid fingerprint type');
      setLoading(false);
    }
  }, [type]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExample = `// JavaScript
fetch('https://creepjs.org/api/fingerprint/${type}')
  .then(r => r.json())
  .then(d => console.log(d));

// cURL
curl https://creepjs.org/api/fingerprint/${type}`;

  if (!meta) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="text-muted-foreground mb-2 text-sm">
            {meta.category}
          </div>
          <h1 className="mb-3 text-4xl font-bold">{meta.name}</h1>
          <p className="text-muted-foreground text-lg">{meta.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Live Playground
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadFingerprint()}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="space-y-4 py-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">
                          Analyzing your browser...
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="bg-secondary h-2 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Scan Steps */}
                    <div className="mt-6 space-y-2">
                      {scanSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                            step.status === 'scanning'
                              ? 'bg-primary/10 text-primary'
                              : step.status === 'completed'
                                ? 'text-muted-foreground'
                                : 'text-muted-foreground/50'
                          }`}
                        >
                          {/* Status Icon */}
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                            {step.status === 'completed' && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            {step.status === 'scanning' && (
                              <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                            )}
                            {step.status === 'pending' && (
                              <div className="bg-muted-foreground/30 h-2 w-2 rounded-full" />
                            )}
                          </div>

                          {/* Step Name */}
                          <span
                            className={`text-sm ${
                              step.status === 'scanning' ? 'font-medium' : ''
                            }`}
                          >
                            {step.name}
                          </span>

                          {/* Scanning Animation */}
                          {step.status === 'scanning' && (
                            <div className="ml-auto flex gap-1">
                              <div
                                className="bg-primary h-1 w-1 animate-pulse rounded-full"
                                style={{ animationDelay: '0ms' }}
                              />
                              <div
                                className="bg-primary h-1 w-1 animate-pulse rounded-full"
                                style={{ animationDelay: '150ms' }}
                              />
                              <div
                                className="bg-primary h-1 w-1 animate-pulse rounded-full"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-lg p-4">
                    {error}
                  </div>
                )}
                {!loading && !error && data !== null && (
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  API Docs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Endpoint</h3>
                  <code className="bg-muted block rounded p-3 text-sm">
                    GET /api/fingerprint/{type}
                  </code>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">Examples</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                    >
                      {showCode ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showCode && (
                    <div className="relative">
                      <pre className="bg-muted rounded p-4 text-xs">
                        {codeExample}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => void copyToClipboard(codeExample)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {meta.longDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {meta.useCases.map((useCase, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Fingerprints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(fingerprintMeta)
                    .filter((k) => k !== type)
                    .slice(0, 10)
                    .map((k) => (
                      <Link key={k} href={`/fingerprint/${k}`}>
                        <Button variant="outline" size="sm">
                          {fingerprintMeta[k].name}
                        </Button>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Content Section */}
        {markdownContent && (
          <div className="mt-8">
            <Card>
              <CardContent className="prose prose-invert prose-slate max-w-none pt-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Style tables
                    table: ({ children }) => (
                      <div className="my-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                          {children}
                        </table>
                      </div>
                    ),
                    // Style code blocks
                    code: ({
                      inline,
                      className,
                      children,
                      ...props
                    }: {
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                    }) => {
                      if (inline) {
                        return (
                          <code
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-slate-200"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Style links
                    a: ({ href, children }) => {
                      if (!href) {
                        return <span className="text-primary">{children}</span>;
                      }
                      const isInternal = href.startsWith('/');
                      if (isInternal) {
                        return (
                          <Link
                            href={href}
                            className="text-primary hover:underline"
                          >
                            {children}
                          </Link>
                        );
                      }
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
