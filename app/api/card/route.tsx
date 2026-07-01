import { ImageResponse } from '@vercel/og';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const score = searchParams.get('score') || '0';
    const seed = searchParams.get('seed') || 'daily';
    const rank = searchParams.get('r');
    const time = searchParams.get('time');

    const scoreNum = parseInt(score).toLocaleString();
    const rankText = rank ? `Rank #${rank}` : 'Daily Challenge';
    const timeText = time ? `${Math.floor(parseInt(time) / 60)}m ${parseInt(time) % 60}s` : '—';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#0c0e13',
            color: '#e9edf4',
            fontFamily: 'Arial, sans-serif',
            padding: '60px',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#ff5c8a',
                letterSpacing: '-0.02em',
              }}
            >
              SORA
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Score */}
            <div
              style={{
                fontSize: '92px',
                fontWeight: '700',
                color: '#ff5c8a',
                letterSpacing: '-0.03em',
                lineHeight: '1',
                display: 'block',
              }}
            >
              {scoreNum}
            </div>

            {/* Metadata row */}
            <div
              style={{
                fontSize: '28px',
                color: '#9aa3b4',
                fontWeight: '400',
                display: 'flex',
                gap: '24px',
              }}
            >
              <span style={{ color: '#ff5c8a', fontWeight: '600', display: 'inline' }}>{rankText}</span>
              <span style={{ display: 'inline' }}>•</span>
              <span style={{ display: 'inline' }}>{timeText}</span>
            </div>

            {/* Seed info */}
            <div
              style={{
                fontSize: '18px',
                color: '#5d6678',
                marginTop: '12px',
                display: 'block',
              }}
            >
              Daily {seed}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255,92,138,.2)',
              paddingTop: '40px',
              gap: '40px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#e9edf4', display: 'block' }}>
                playsora.xyz
              </div>
              <div style={{ fontSize: '16px', color: '#9aa3b4', display: 'block' }}>Keep the servers alive</div>
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#ff5c8a',
                fontWeight: '700',
                display: 'block',
              }}
            >
              $SORA
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('OG card generation error:', error);
    return new Response('Failed to generate card', { status: 500 });
  }
}
