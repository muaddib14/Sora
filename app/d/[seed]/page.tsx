'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/lib/theme';
import '../../landing.css';

export default function ChallengePage({
  params,
}: {
  params: { seed: string };
}) {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const beatScore = searchParams.get('beat');
  const rank = searchParams.get('r');

  return (
    <div className="sora-landing" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* SORA mark symbol */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <g id="mark">
            <path d="M7 21h13.5a5.2 5.2 0 0 0 .8-10.34A6.6 6.6 0 0 0 8.4 9.2 4.8 4.8 0 0 0 7 21Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M5 16.2h3l1.6-3.4 2.3 6 1.7-3.1 1.3 1.5H21" fill="none" stroke="#ff5c8a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </defs>
      </svg>

      {/* header */}
      <header>
        <div className="wrap bar">
          <Link className="brand" href="/">
            <svg width="26" height="26" viewBox="0 0 26 26" style={{ color: 'var(--ink)' }}>
              <use href="#mark" />
            </svg>{' '}
            SORA
          </Link>
          <nav className="nav">
            <Link href="/play">PLAY</Link>
            <Link href="/#network">NETWORK</Link>
            <Link href="/leaderboard">LEADERBOARD</Link>
            <Link href="/#token">$SORA</Link>
          </nav>
          <div className="spacer"></div>
          <div className="status-chip">
            <span className="dot"></span> ALL SYSTEMS OPERATIONAL
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
        {beatScore && (
          <>
            {/* Challenge banner */}
            <div style={{
              background: 'rgba(255,92,138,.1)', border: '1px solid rgba(255,92,138,.3)',
              borderRadius: 16, padding: '32px 28px', marginBottom: 40, textAlign: 'center',
            }}>
              <div style={{
                fontSize: 14, color: 'var(--ink-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
              }}>Challenge Accepted</div>
              <div style={{
                fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, color: 'var(--pink)', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em', marginBottom: 8,
              }}>Beat {parseInt(beatScore).toLocaleString()} pts</div>
              <p style={{
                fontSize: 14, color: 'var(--ink-dim)', margin: '0 0 20px 0', lineHeight: 1.6,
              }}>Today's daily challenge from {rank ? `Rank #${rank}` : 'a player'}. Think you can keep the servers alive?</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/play" className="btn btn-pink" style={{ padding: '12px 28px', fontSize: 15 }}>
                  Accept Challenge →
                </Link>
                <Link href="/play" style={{
                  padding: '12px 28px', fontSize: 15, border: '1px solid var(--line)',
                  borderRadius: 8, color: 'var(--ink)', background: 'transparent',
                  textDecoration: 'none', cursor: 'pointer',
                }}>
                  Play Casual
                </Link>
              </div>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{
                background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Target Score</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: 'var(--pink)' }}>
                  {parseInt(beatScore).toLocaleString()}
                </div>
              </div>
              <div style={{
                background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Daily Seed</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: 'var(--ink)', wordBreak: 'break-all' }}>
                  {params.seed}
                </div>
              </div>
            </div>
          </>
        )}

        {!beatScore && (
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)',
            borderRadius: 16, padding: '48px 28px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: 24, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Clash Display', sans-serif", marginBottom: 12,
            }}>Daily Challenge</div>
            <p style={{ fontSize: 14, color: 'var(--ink-dim)', marginBottom: 24 }}>
              Share your score from today's daily and challenge your friends. The seed uniquely identifies today's challenge.
            </p>
            <Link href="/play" className="btn btn-pink" style={{ padding: '12px 28px', fontSize: 15, display: 'inline-block' }}>
              Play Daily →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
