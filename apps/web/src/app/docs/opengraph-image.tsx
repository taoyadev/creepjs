import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'CreepJS Documentation - API & Integration Guide';
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
            'radial-gradient(circle at 25px 25px, rgba(168, 85, 247, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(168, 85, 247, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            borderRadius: 9999,
            fontSize: 18,
            color: 'rgba(168, 85, 247, 1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            marginBottom: 30,
          }}
        >
          Documentation
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
          Developer Documentation
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
          Complete API reference, integration guides, and code examples for
          implementing browser fingerprinting
        </div>

        {/* Documentation Topics */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
            }}
          >
            {['RESTful API', 'JavaScript SDK', 'Authentication'].map((topic) => (
              <div
                key={topic}
                style={{
                  padding: '12px 28px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  fontSize: 20,
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {topic}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
            }}
          >
            {['Rate Limiting', 'Code Examples', 'Best Practices'].map((topic) => (
              <div
                key={topic}
                style={{
                  padding: '12px 28px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  fontSize: 20,
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {topic}
              </div>
            ))}
          </div>
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
            Open Source • MIT License
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
