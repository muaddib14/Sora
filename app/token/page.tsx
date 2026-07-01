'use client';

import Link from 'next/link';

const col = { label: '#5d6678', pink: '#ff5c8a', fg: '#e9edf4', sub: '#9aa3b4' };

export default function TokenPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0c0e13', color: col.fg, fontFamily: "'Switzer','Inter',sans-serif", position: 'relative' }}>
            {/* grid bg */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(255,92,138,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,92,138,.04) 1px,transparent 1px)',
                backgroundSize: '46px 46px',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>

                {/* header */}
                <header style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 0', borderBottom: '1px solid rgba(255,92,138,.15)', marginBottom: 48,
                    position: 'sticky', top: 0, background: '#0c0e13', zIndex: 10, backdropFilter: 'blur(4px)',
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill={col.pink} />
                            <path d="M8 24 L16 8 L24 24" stroke="#0c0e13" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <line x1="11" y1="19" x2="21" y2="19" stroke="#0c0e13" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 18, color: col.fg, letterSpacing: '-0.02em' }}>SORA</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: 8 }}>
                        <Link href="/play" style={{ padding: '8px 16px', color: col.sub, fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Play</Link>
                        <Link href="/leaderboard" style={{ padding: '8px 16px', color: col.sub, fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Leaderboard</Link>
                    </nav>
                </header>

                {/* title */}
                <div style={{ marginBottom: 48 }}>
                    <div style={{ marginBottom: 10 }}>
                        <span style={{
                            display: 'inline-block', padding: '4px 12px', background: 'rgba(255,92,138,.1)', border: '1px solid rgba(255,92,138,.3)',
                            borderRadius: 20, fontSize: 12, color: col.pink, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>Tokenomics</span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(32px,6vw,48px)',
                        fontWeight: 700, color: col.fg, letterSpacing: '-0.03em', margin: 0, marginBottom: 8,
                    }}>$SORA Token</h1>
                    <p style={{ fontSize: 16, color: col.sub, margin: 0 }}>Governance &amp; access layer for the SORA ecosystem</p>
                </div>

                {/* utility section */}
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700,
                        color: col.fg, marginBottom: 20, letterSpacing: '-0.01em',
                    }}>Utility</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                            { title: 'Tournament Entry', desc: 'Pay entry fees for ranked seasons and special events' },
                            { title: 'Season Pass', desc: 'Unlock exclusive cosmetics, skins, and rewards' },
                            { title: 'Governance', desc: 'Vote on protocol changes and feature priorities' },
                            { title: 'Cosmetics', desc: 'Customize your operator with unique skins' },
                        ].map(({ title, desc }) => (
                            <div key={title} style={{
                                background: '#141822', border: '1px solid rgba(255,92,138,.12)',
                                borderRadius: 12, padding: '24px',
                            }}>
                                <div style={{
                                    fontSize: 15, fontWeight: 700, color: col.fg, marginBottom: 8,
                                    fontFamily: "'Clash Display',sans-serif", letterSpacing: '-0.01em',
                                }}>{title}</div>
                                <div style={{ fontSize: 13, color: col.sub, lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* spec section */}
                <div style={{ background: '#141822', border: '1px solid rgba(255,92,138,.12)', borderRadius: 16, padding: '32px', marginBottom: 40 }}>
                    <h2 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 18, fontWeight: 700,
                        color: col.fg, marginBottom: 24, letterSpacing: '-0.01em',
                    }}>Token Specification</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {[
                            { label: 'Network', value: 'Solana' },
                            { label: 'Type', value: 'SPL Token' },
                            { label: 'Launch', value: 'Fair Launch (pump.fun)' },
                            { label: 'Contract', value: 'TBA' },
                            { label: 'Supply', value: 'To Be Announced' },
                            { label: 'Distribution', value: 'Community Rewards & Airdrop' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div style={{ fontSize: 11, color: col.label, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{label}</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: col.pink, fontFamily: 'monospace' }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* disclaimer */}
                <div style={{
                    background: 'rgba(255,92,138,.05)', border: '1px solid rgba(255,92,138,.25)',
                    borderRadius: 12, padding: '24px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={col.pink} strokeWidth="2" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <div>
                            <div style={{ fontWeight: 700, color: col.pink, marginBottom: 8, fontFamily: "'Clash Display',sans-serif" }}>Legal Disclaimer</div>
                            <p style={{ fontSize: 13, color: col.sub, margin: 0, lineHeight: 1.7 }}>
                                $SORA is a cosmetic and access token with no expectation of profit or financial yield. The token is for in-game utility and governance only. Not a security or investment contract. Fair launch means no private sale, no team allocation, and equal distribution. Purchase at your own risk. See terms for full disclosure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
