# SessionStorage Fingerprinting

Detects sessionStorage availability, similar to localStorage but session-scoped.

## API

```javascript
const hasSessionStorage = 'sessionStorage' in window;
try {
  sessionStorage.setItem('test', '1');
  const works = true;
} catch (e) {
  const works = false;
}
```

## Characteristics

- **Session-scoped**: Cleared when tab closes
- **Same-origin**: Not shared across domains
- **Quota**: Usually same as localStorage (~5-10MB)

**Entropy**: <0.2 bits (99%+ support, rarely disabled)

## Use Cases

**Legitimate**: Temporary state storage (shopping cart, form data)
**Fingerprinting**: Rarely used alone (too common)

## Privacy

Lower risk than localStorage (auto-clears), but can still track within session.
