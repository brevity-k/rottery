import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'My Lotto Stats - AI-Powered Lottery Number Insights & Statistics';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563EB 0%, #7E22CE 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Slot machine icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.15)',
            marginBottom: 32,
            fontSize: 64,
          }}
        >
          🎰
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          My Lotto Stats
        </div>

        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.85)',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          AI-Powered Lottery Number Insights & Statistics
        </div>

        {/* Decorative balls */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {[7, 14, 21, 35, 42].map((num) => (
            <div
              key={num}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                color: '#2563EB',
              }}
            >
              {num}
            </div>
          ))}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#1f2937',
            }}
          >
            8
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
