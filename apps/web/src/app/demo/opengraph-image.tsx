import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'CreepJS Demo - Live Browser Fingerprinting';
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
            'radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: 9999,
            fontSize: 18,
            color: 'rgba(59, 130, 246, 1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: 30,
          }}
        >
          Live Demo
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
          Try Browser Fingerprinting
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
          Experience real-time fingerprint collection with detailed analysis of your
          browser's unique characteristics
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 20,
          }}
        >
          {[
            { label: 'Canvas', icon: '🎨' },
            { label: 'WebGL', icon: '🖼️' },
            { label: 'Audio', icon: '🔊' },
            { label: 'Fonts', icon: '✍️' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 40 }}>{item.icon}</div>
              <div style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.8)' }}>
                {item.label}
              </div>
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
            No Data Stored • Privacy-First
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
