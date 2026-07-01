'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import '../landing.css';

interface LeaderboardScore {
    id: number;
    wallet: string;
    score: number;
    elapsed_ms: number;
    reputation: number;
    created_at: string;
    operators: { handle: string } | null;
}

const col = { label: 'var(--ink-faint)', pink: 'var(--pink)', fg: 'var(--ink)', sub: 'var(--ink-dim)' };

export default function LeaderboardPage() {
    const [scores, setScores] = useState<LeaderboardScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/leaderboard?limit=100')
            .then(r => r.json())
            .then(d => { if (d.error) throw new Error(d.error); setScores(d.scores || []); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const repColor = (r: number) => r > 50 ? '#4ade80' : r > 0 ? '#facc15' : '#f87171';

    const rankBadge = (i: number) => {
        if (i === 0) return { bg: 'rgba(250,204,21,.12)', border: 'rgba(250,204,21,.3)', color: '#facc15' };
        if (i === 1) return { bg: 'rgba(148,163,184,.1)', border: 'rgba(148,163,184,.3)', color: '#94a3b8' };
        if (i === 2) return { bg: 'rgba(251,146,60,.1)', border: 'rgba(251,146,60,.3)', color: '#fb923c' };
        return { bg: 'transparent', border: 'transparent', color: col.sub };
    };

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

            {/* header — identical to landing */}
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
                    <Link className="btn btn-pink" href="/play">Play Now</Link>
                </div>
            </header>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* title */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{
                            padding: '4px 12px', background: 'rgba(255,92,138,.1)', border: '1px solid rgba(255,92,138,.3)',
                            borderRadius: 20, fontSize: 12, color: col.pink, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>Season 1</span>
                        <span style={{ fontSize: 12, color: col.label, fontFamily: 'monospace' }}>
                            {loading ? 'FETCHING…' : `${scores.length} OPERATORS`}
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(28px,5vw,42px)',
                        fontWeight: 700, color: col.fg, letterSpacing: '-0.03em', margin: 0,
                    }}>Global Leaderboard</h1>
                </div>

                {/* loading */}
                {loading && (
                    <div style={{
                        background: 'var(--panel)', border: '1px solid var(--line)',
                        borderRadius: 12, padding: '48px', textAlign: 'center',
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col.pink} strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
                            <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                            <path d="M12 2a10 10 0 0 1 10 10"/>
                        </svg>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        <span style={{ color: col.sub, fontSize: 14 }}>Loading leaderboard…</span>
                    </div>
                )}

                {/* error */}
                {error && (
                    <div style={{
                        background: 'rgba(248,113,113,.06)', border: '1px solid rgba(248,113,113,.25)',
                        borderRadius: 10, padding: '14px 20px', color: '#f87171', fontSize: 14,
                        fontFamily: 'monospace', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                    </div>
                )}

                {/* empty */}
                {!loading && scores.length === 0 && !error && (
                    <div style={{
                        background: 'var(--panel)', border: '1px solid var(--line)',
                        borderRadius: 12, padding: '64px 48px', textAlign: 'center',
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,92,138,.3)" strokeWidth="1.5" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 16px' }}>
                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                        </svg>
                        <div style={{ color: col.sub, fontSize: 16, marginBottom: 8 }}>No scores yet</div>
                        <div style={{ color: col.label, fontSize: 13 }}>Be the first operator to survive.</div>
                        <Link href="/play" style={{
                            display: 'inline-block', marginTop: 24, padding: '10px 24px',
                            background: col.pink, borderRadius: 8, color: '#fff',
                            fontSize: 14, fontWeight: 700, textDecoration: 'none',
                            fontFamily: "'Clash Display',sans-serif",
                        }}>Play Now</Link>
                    </div>
                )}

                {/* table */}
                {!loading && scores.length > 0 && (
                    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                        {/* table header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '56px 1fr 120px 100px 100px 120px',
                            padding: '12px 24px', borderBottom: '1px solid var(--line)',
                            background: 'var(--panel-2)',
                        }}>
                            {['#', 'Operator', 'Score', 'Time', 'Rep', 'Date'].map(h => (
                                <div key={h} style={{ fontSize: 11, color: col.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
                            ))}
                        </div>

                        {scores.map((score, idx) => {
                            const badge = rankBadge(idx);
                            return (
                                <div key={score.id} style={{
                                    display: 'grid', gridTemplateColumns: '56px 1fr 120px 100px 100px 120px',
                                    padding: '16px 24px', borderBottom: '1px solid var(--line-soft)',
                                    alignItems: 'center',
                                    transition: 'background .15s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,92,138,.04)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    {/* rank */}
                                    <div>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            width: 28, height: 28, borderRadius: 6,
                                            background: badge.bg, border: `1px solid ${badge.border}`,
                                            color: badge.color, fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                                        }}>{idx + 1}</span>
                                    </div>

                                    {/* operator */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: `hsl(${(score.wallet.charCodeAt(2) * 137) % 360},45%,42%)`,
                                            border: '1px solid var(--line)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 700, color: '#fff',
                                        }}>
                                            {(score.operators?.handle || score.wallet).slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: col.fg }}>
                                                {score.operators?.handle || `${score.wallet.slice(0, 6)}…${score.wallet.slice(-4)}`}
                                            </div>
                                            {score.operators?.handle && (
                                                <div style={{ fontSize: 11, color: col.label, fontFamily: 'monospace' }}>
                                                    {score.wallet.slice(0, 6)}…{score.wallet.slice(-4)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* score */}
                                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: col.pink }}>{score.score.toLocaleString()}</div>

                                    {/* time */}
                                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: col.sub }}>{(score.elapsed_ms / 1000).toFixed(1)}s</div>

                                    {/* rep */}
                                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: repColor(score.reputation) }}>
                                        {score.reputation?.toFixed(1) ?? '—'}%
                                    </div>

                                    {/* date */}
                                    <div style={{ fontSize: 12, color: col.label }}>
                                        {new Date(score.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
