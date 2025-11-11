import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'CreepJS Playground - Test API in Real-Time';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

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
            'radial-gradient(circle at 25px 25px, rgba(34, 197, 94, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(34, 197, 94, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderRadius: 9999,
            fontSize: 18,
            color: 'rgba(34, 197, 94, 1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginBottom: 30,
          }}
        >
          Interactive Playground
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          API Playground
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          Test CreepJS API endpoints interactively with live responses and
          syntax-highlighted JSON
        </div>

        {/* Code Snippet Mockup */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'monospace',
            marginTop: 20,
          }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                backgroundColor: 'rgba(251, 191, 36, 0.5)',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
              }}
            />
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.8)' }}>
            <span style={{ color: 'rgba(251, 191, 36, 1)' }}>POST</span>{' '}
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              /v1/fingerprint
            </span>
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }}>
            {`{ "fingerprintId": "abc123...", "confidence": 0.95 }`}
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 30,
          }}
        >
          {['Live Testing', 'JSON Preview', 'No Setup'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '10px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 9999,
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20 }}>
            CreepJS.org
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20 }}>
            RESTful API • Edge Computing
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
