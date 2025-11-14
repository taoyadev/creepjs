# Security & Privacy

## Core Principles

CreepJS.org is built on privacy-first principles, ensuring transparency and user control.

### 1. Transparency

- **Clear Disclosure**: Explicitly inform users about fingerprint data collection
- **Open Source**: Core engine code is open source and auditable
- **No Hidden Collection**: Only collect declared fingerprint data
- **Real-time Display**: Show collection process and results to users

### 2. Data Minimization

- **Necessary Only**: Only collect data needed for fingerprinting
- **No Sensitive Data**: Never collect geolocation, camera, microphone, or other sensitive permissions
- **Stateless API**: Don't persistently store raw fingerprint data
- **Short Retention**: If storage is needed, maximum 7 days retention

### 3. User Control

- **Respect DNT**: Honor Do Not Track settings
- **Opt-out Options**: Provide easy opt-out mechanisms
- **Data Deletion**: Provide data deletion API
- **User Consent**: Require explicit consent before collection

### 4. Security

- **HTTPS Only**: All API communications use HTTPS
- **Token Authentication**: Use secure API tokens
- **Rate Limiting**: Prevent API abuse
- **No Malicious Use**: Prohibit use for fraud, spam, or harassment

## GDPR Compliance

### Legal Basis

Browser fingerprinting may fall under GDPR requirements. We recommend:

1. **Legitimate Interest**: If for fraud prevention/security
2. **Consent**: If for marketing/analytics, obtain explicit consent
3. **Contractual Necessity**: If required for service delivery

### User Rights

Provide the following rights to users:

- **Right to Access**: Users can request their fingerprint data
- **Right to Deletion**: Provide deletion mechanisms
- **Right to Object**: Allow users to opt-out
- **Data Portability**: Provide data export functionality

### Implementation Recommendations

```javascript
// Check user consent before collection
if (await getUserConsent()) {
  const fp = await getFingerprint({ token: 'xxx' });
} else {
  console.log('User declined fingerprint collection');
}

// Respect DNT settings
if (navigator.doNotTrack === '1') {
  // Skip collection
}
```

## Data Security

### API Security

- **Token Authentication**: All requests require valid API tokens
- **Rate Limiting**: 1000 requests/day/token to prevent abuse
- **IP Blocking**: Automatically block suspicious IPs
- **HTTPS Only**: Encrypted transmission

### Data Storage

- **No Long-term Storage**: Don't persistently store raw fingerprint data
- **Hash Only**: Only store hashed fingerprint IDs
- **Encrypted Transmission**: All data transmitted over HTTPS
- **Access Control**: Strict access controls on servers

## Privacy Best Practices

### 1. Minimal Collection

```javascript
// ✅ Recommended: Only collect core data
const components = {
  canvas: collectCanvas(),
  webgl: collectWebGL(),
  navigator: {
    userAgent: navigator.userAgent,
    language: navigator.language,
  },
};

// ❌ Avoid: Collecting excessive data
const components = {
  // Don't collect geolocation, IP, email, etc.
};
```

### 2. User Notice

Clearly inform users:

- What data is being collected
- Why it's being collected
- How it will be used
- Who has access to it
- How long it's retained

### 3. Respect Privacy Settings

```javascript
// Check privacy settings
const respectPrivacy = () => {
  // Do Not Track
  if (navigator.doNotTrack === '1') return false;

  // Global Privacy Control
  if (navigator.globalPrivacyControl) return false;

  // Private browsing mode detection
  if (isPrivateMode()) return false;

  return true;
};
```

## Responsible Use

### Acceptable Use

✅ **Allowed**:

- Fraud detection and prevention
- Account security (detect multiple accounts)
- Bot detection
- User experience personalization
- Security research and education

### Prohibited Use

❌ **Not Allowed**:

- User tracking without consent
- Privacy invasion
- Discrimination
- Spam or harassment
- Bypass user privacy settings
- Sale of fingerprint data

## Incident Response

If a security incident occurs:

1. **Immediate Action**: Isolate affected systems
2. **User Notification**: Notify affected users within 72 hours
3. **Investigation**: Conduct thorough investigation
4. **Remediation**: Fix vulnerabilities
5. **Transparency**: Publish incident reports

## Compliance Checklist

- [ ] Provide clear privacy policy
- [ ] Obtain user consent (if required)
- [ ] Respect DNT settings
- [ ] Implement data deletion mechanisms
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting
- [ ] Don't store unnecessary data
- [ ] Provide opt-out options
- [ ] Regular security audits
- [ ] Incident response plan

## Contact

For security issues:

- **Email**: hello@creepjs.org
- **Bug Bounty**: (Coming soon)
