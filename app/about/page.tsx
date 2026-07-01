'use client';

import Link from 'next/link';

const col = { label: '#5d6678', pink: '#ff5c8a', fg: '#e9edf4', sub: '#9aa3b4' };

export default function AboutPage() {
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
                    <h1 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(32px,6vw,48px)',
                        fontWeight: 700, color: col.fg, letterSpacing: '-0.03em', margin: 0, marginBottom: 12,
                    }}>About SORA</h1>
                    <p style={{ fontSize: 16, color: col.sub, margin: 0 }}>Infrastructure &amp; game built for web3</p>
                </div>

                {/* game origin */}
                <div style={{
                    background: '#141822', border: '1px solid rgba(255,92,138,.12)',
                    borderRadius: 16, padding: '32px', marginBottom: 32,
                }}>
                    <h2 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700,
                        color: col.fg, marginBottom: 16, letterSpacing: '-0.01em',
                    }}>Game Origin</h2>
                    <p style={{ fontSize: 14, color: col.sub, lineHeight: 1.8, marginBottom: 16 }}>
                        SORA is built on the{' '}
                        <a
                            href="https://github.com/pshenok/server-survival"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: col.pink, textDecoration: 'none', borderBottom: `1px solid ${col.pink}` }}
                        >
                            Server Survival
                        </a>
                        {' '}game by{' '}
                        <a
                            href="https://github.com/pshenok"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: col.pink, textDecoration: 'none', borderBottom: `1px solid ${col.pink}` }}
                        >
                            pshenok
                        </a>
                        , released under the MIT license. We extend the original game with on-chain leaderboards, wallet integration, and governance tokenomics.
                    </p>
                    <div style={{ padding: '16px', background: 'rgba(255,92,138,.05)', border: `1px solid rgba(255,92,138,.15)`, borderRadius: 8, fontSize: 13, color: col.sub, fontFamily: 'monospace' }}>
                        Open-source infrastructure simulation game. Route requests. Defend DDoS. Manage costs. Climb the leaderboard.
                    </div>
                </div>

                {/* mission */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                    {[
                        {
                            title: 'Game Design',
                            desc: 'Strategic simulation teaching real infrastructure concepts through engaging gameplay.',
                        },
                        {
                            title: 'Web3 Integration',
                            desc: 'Wallet-native play, on-chain leaderboards, and token-based governance for community-driven development.',
                        },
                        {
                            title: 'Fair Launch',
                            desc: 'No team allocation. No pre-sale. Community rewards and governance from day one.',
                        },
                        {
                            title: 'Open Source',
                            desc: 'Built on MIT-licensed code. Extensible, auditable, community-owned.',
                        },
                    ].map(({ title, desc }) => (
                        <div key={title} style={{
                            background: '#141822', border: '1px solid rgba(255,92,138,.12)',
                            borderRadius: 12, padding: '24px',
                        }}>
                            <div style={{
                                fontSize: 15, fontWeight: 700, color: col.fg, marginBottom: 10,
                                fontFamily: "'Clash Display',sans-serif", letterSpacing: '-0.01em',
                            }}>{title}</div>
                            <div style={{ fontSize: 13, color: col.sub, lineHeight: 1.6 }}>{desc}</div>
                        </div>
                    ))}
                </div>

                {/* license */}
                <div style={{
                    background: '#141822', border: '1px solid rgba(255,92,138,.12)',
                    borderRadius: 16, padding: '32px',
                }}>
                    <h2 style={{
                        fontFamily: "'Clash Display',sans-serif", fontSize: 18, fontWeight: 700,
                        color: col.fg, marginBottom: 16, letterSpacing: '-0.01em',
                    }}>MIT License</h2>
                    <p style={{ fontSize: 13, color: col.sub, lineHeight: 1.8, marginBottom: 16 }}>
                        Server Survival is released under the MIT License. This means you can freely use, modify, and distribute the code, provided you include the original copyright notice.
                    </p>
                    <div style={{
                        background: 'rgba(255,92,138,.05)', border: `1px solid rgba(255,92,138,.15)`,
                        borderRadius: 8, padding: '20px', fontSize: 12, color: col.sub, fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
{`Copyright (c) pshenok

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`}
                    </div>
                </div>
            </div>
        </div>
    );
}
