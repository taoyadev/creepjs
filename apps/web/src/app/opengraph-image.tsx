import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/lib/metadata';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = SITE_CONFIG.title;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

/**
 * Default Open Graph image for the site
 * Generated dynamically using Next.js ImageResponse API
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {/* Fingerprint Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
            }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="#fff"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            CreepJS.org
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Educational Browser Fingerprinting Platform
          </div>
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['Canvas', 'WebGL', 'Navigator', 'Audio', 'Fonts'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 9999,
                fontSize: 20,
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 20,
          }}
        >
          <span>Privacy-First</span>
          <span>•</span>
          <span>Open Source</span>
          <span>•</span>
          <span>RESTful API</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
