# Media Devices Fingerprinting: Your Cameras and Microphones Are Telling Tales

Look, here's something creepy: Websites can enumerate all your cameras, microphones, and speakers **without asking for permission**. They don't need to access the actual video or audio—they just need to know the devices exist. And that information alone is enough to track you.

The `MediaDevices.enumerateDevices()` API was designed to help users select the right camera for video calls. But it's become a tracking goldmine. Your unique combination of devices creates a fingerprint that can identify you across websites.

Got a webcam, a Blue Yeti microphone, and AirPods? That's a pretty specific setup. Maybe 1 in 10,000 users have that exact combination. Congratulations, you're highly trackable.

## What Is Media Devices Fingerprinting?

Media devices fingerprinting collects information about your audio/video input and output devices using the MediaDevices API. This includes:

- **Device types**: Cameras (webcams), microphones, speakers
- **Device labels**: Product names (if permission granted)
- **Device IDs**: Unique identifiers (persistent or session-based)
- **Device counts**: How many of each type
- **Grouping**: Which devices belong together (e.g., webcam + built-in mic)

Even without camera/microphone permission, browsers expose:

- How many cameras you have
- How many microphones you have
- How many audio output devices you have
- Device grouping information

This creates surprisingly unique fingerprints.

## How It Works

```javascript
async function getMediaDevicesFingerprint() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const fingerprint = {
      // Device counts by type
      videoInput: devices.filter((d) => d.kind === 'videoinput').length,
      audioInput: devices.filter((d) => d.kind === 'audioinput').length,
      audioOutput: devices.filter((d) => d.kind === 'audiooutput').length,

      // Device IDs (hashed for privacy in docs, but sites get full IDs)
      deviceIds: devices.map((d) => ({
        kind: d.kind,
        groupId: d.groupId,
        // deviceId is available (unique identifier)
      })),

      // Labels (only if permission granted, otherwise empty)
      labels: devices.map((d) => d.label),
    };

    return fingerprint;
  } catch (error) {
    return { error: error.message };
  }
}
```

## The Statistics

| Metric                             | Value                                  | Notes                       |
| ---------------------------------- | -------------------------------------- | --------------------------- |
| **Permission required for labels** | No (counts visible without permission) | Critical privacy gap        |
| **Permission required for IDs**    | Partially (generic IDs always visible) | Varies by browser           |
| **Typical laptop**                 | 1 webcam, 1-2 mics, 1-2 speakers       | Common configuration        |
| **Desktop setups**                 | Highly variable                        | More unique                 |
| **Trackability**                   | Medium-High entropy                    | Combined with other signals |

### Device Configuration Examples

| Setup                                | Uniqueness     | Type        |
| ------------------------------------ | -------------- | ----------- |
| **Built-in laptop devices**          | Low            | Common      |
| **+ External webcam**                | Medium         | Less common |
| **+ Studio microphone**              | High           | Uncommon    |
| **+ Multiple displays with cameras** | Very High      | Rare        |
| **Complex streaming setup**          | Extremely High | Very rare   |

## What Nobody Tells You

### The Streamer/Content Creator Trap

If you're a streamer, YouTuber, or content creator with professional gear:

- Elgato capture cards
- Blue Yeti/Shure SM7B microphones
- Multiple cameras
- Audio mixers

You're broadcasting "I'm a content creator" to every website. This is:

- Highly unique (small percentage of users)
- Indicates higher technical literacy
- Often correlates with specific income brackets
- Creates targeted advertising opportunities

### Device IDs Persist (Sometimes)

Browser behavior varies:

- **Chrome**: Device IDs persist across sessions
- **Firefox**: Resets IDs on restart (better privacy)
- **Safari**: Limited device enumeration

This means Chrome users can be tracked long-term via device IDs, even without cookies.

### Permission Paradox

If you grant camera/microphone permission once, websites get:

- Full device labels (product names)
- Permanent device IDs
- Exact hardware information

This creates an even more unique fingerprint. The privacy-conscious choice (denying permission) actually helps by hiding labels, but device counts are still exposed.

## Browser Differences

| Browser     | Exposes Counts | Exposes Labels (No Permission) | Exposes IDs         |
| ----------- | -------------- | ------------------------------ | ------------------- |
| **Chrome**  | ✅ Yes         | ❌ No                          | ✅ Yes (persistent) |
| **Firefox** | ✅ Yes         | ❌ No                          | ⚠️ Session-only     |
| **Safari**  | ⚠️ Limited     | ❌ No                          | ⚠️ Limited          |
| **Brave**   | ⚠️ Randomized  | ❌ No                          | ⚠️ Randomized       |

## Protecting Your Privacy

### What Works

1. **Use Firefox or Brave**: Better privacy defaults
2. **Never grant media permissions unnecessarily**
3. **Disable unused devices** in Device Manager/System Preferences
4. **Use Tor Browser**: Blocks device enumeration entirely

### What Doesn't Work

- VPNs (devices stay the same)
- Private browsing (devices still visible)
- Clearing cookies (hardware-based tracking)

## Try It Now

Test your media devices exposure at [/fingerprint/media-devices](/fingerprint/media-devices).

---

**Last Updated**: November 2025 | **Word Count**: 1,020 words
