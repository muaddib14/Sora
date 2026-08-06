'use client';

import Link from 'next/link';
import { useState, type CSSProperties, type ReactNode } from 'react';
import {
    FiShield, FiShare2, FiCpu, FiDatabase, FiHardDrive, FiGlobe,
    FiZap, FiList, FiKey, FiLayers, FiSearch, FiCopy, FiCloud,
} from 'react-icons/fi';

const col = { label: '#5d6678', pink: '#ff5c8a', fg: '#e9edf4', sub: '#9aa3b4', card: '#141822', line: 'rgba(255,92,138,.12)' };

const SECTIONS = [
    { id: 'start', label: 'Start Here' },
    { id: 'services', label: 'The Services' },
    { id: 'traffic', label: 'Traffic Types' },
    { id: 'survival', label: 'Survival Mechanics' },
    { id: 'scoring', label: 'Scoring & Leaderboard' },
    { id: 'tips', label: 'Tips' },
];

const SERVICES = [
    { name: 'Firewall', cost: 40, icon: FiShield, blurb: 'First line of defense. Blocks malicious traffic before it reaches anything else.' },
    { name: 'Load Balancer', cost: 50, icon: FiShare2, blurb: 'Spreads incoming requests across your Compute instances.' },
    { name: 'Compute', cost: 60, icon: FiCpu, blurb: 'Processes requests. Upgradeable through 3 tiers for more capacity.' },
    { name: 'Relational DB', cost: 150, icon: FiDatabase, blurb: 'Destination for reads, writes and searches. Expensive but essential.' },
    { name: 'File Storage', cost: 25, icon: FiHardDrive, blurb: 'Handles static content and uploads.' },
    { name: 'CDN', cost: 60, icon: FiGlobe, blurb: 'Caches static content at the edge — very high cache-hit rate.' },
    { name: 'Memory Cache', cost: 60, icon: FiZap, blurb: 'Cuts DB load by caching hot responses.' },
    { name: 'Message Queue', cost: 45, icon: FiList, blurb: 'Buffers bursts so spikes don’t drop requests.' },
    { name: 'API Gateway', cost: 70, icon: FiKey, blurb: 'Rate-limits traffic; throttled requests cost less reputation than failures.' },
    { name: 'NoSQL DB', cost: 80, icon: FiLayers, blurb: 'Fast reads/writes, but can’t serve search queries.' },
    { name: 'Search Engine', cost: 120, icon: FiSearch, blurb: 'Purpose-built for search — 3x faster than the SQL path.' },
    { name: 'Read Replica', cost: 100, icon: FiCopy, blurb: 'Offloads reads from your primary DB. Needs a DB to attach to.' },
    { name: 'Serverless', cost: 45, icon: FiCloud, blurb: 'Auto-scales, low upkeep, but pays per request — great for spiky traffic.' },
];

const TRAFFIC_TYPES = [
    { name: 'STATIC', desc: 'Cacheable GET requests. Route to CDN for the cheapest win.' },
    { name: 'READ', desc: 'Database reads. Cache hits save real money here.' },
    { name: 'WRITE', desc: 'Never cacheable — hits your DB directly every time.' },
    { name: 'UPLOAD', desc: 'File writes, destined for storage.' },
    { name: 'SEARCH', desc: 'Expensive to process; a Search Engine node pays for itself fast.' },
    { name: 'MALICIOUS', desc: 'Hides among the rest. Undetected, it bleeds reputation fast.' },
];

export default function HowToPlayPage() {
    const [active, setActive] = useState('start');

    return (
        <div style={{ minHeight: '100vh', background: '#0c0e13', color: col.fg, fontFamily: "'Switzer','Inter',sans-serif" }}>
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 24px', borderBottom: `1px solid ${col.line}`,
                position: 'sticky', top: 0, background: '#0c0e13', zIndex: 10, backdropFilter: 'blur(4px)',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>SORA</span>
                </Link>
                <nav style={{ display: 'flex', gap: 6 }}>
                    <Link href="/play" style={{ padding: '8px 14px', color: col.sub, fontSize: 13.5, textDecoration: 'none', fontWeight: 500 }}>Play</Link>
                    <Link href="/leaderboard" style={{ padding: '8px 14px', color: col.sub, fontSize: 13.5, textDecoration: 'none', fontWeight: 500 }}>Leaderboard</Link>
                </nav>
            </header>

            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 100px', display: 'flex', gap: 40 }}>

                {/* sidebar TOC */}
                <aside style={{ width: 200, flexShrink: 0, position: 'sticky', top: 90, alignSelf: 'flex-start', display: 'none' }} className="htp-sidebar">
                    <div style={{ fontSize: 11, letterSpacing: '0.1em', color: col.label, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase' }}>
                        How to Play
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {SECTIONS.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                onClick={() => setActive(s.id)}
                                style={{
                                    padding: '8px 10px', borderRadius: 8, fontSize: 13.5, textDecoration: 'none',
                                    color: active === s.id ? col.fg : col.sub,
                                    background: active === s.id ? 'rgba(255,92,138,.1)' : 'transparent',
                                    fontWeight: active === s.id ? 600 : 500,
                                }}
                            >
                                {s.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* content */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 36 }}>
                        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: col.pink, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Player guide</div>
                        <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(30px,5vw,44px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                            Keep the servers alive.
                        </h1>
                        <p style={{ fontSize: 15, color: col.sub, maxWidth: 640, lineHeight: 1.7, margin: '0 0 24px' }}>
                            Everything you need to survive your first run — what to place, what traffic wants, and how your score ends up on the leaderboard.
                        </p>

                        {/* icon strip — every placeable service at a glance */}
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: 0,
                            background: col.card, border: `1px solid ${col.line}`, borderRadius: 14, overflow: 'hidden',
                        }}>
                            {SERVICES.map((s) => (
                                <a key={s.name} href="#services" style={{
                                    flex: '1 1 84px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                    padding: '16px 8px', textDecoration: 'none', color: col.sub,
                                    borderRight: `1px solid ${col.line}`,
                                }}>
                                    <s.icon size={20} color={col.pink} />
                                    <span style={{ fontSize: 9.5, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>{s.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <Section id="start" title="Start Here">
                        <p style={p}>
                            Connect a Solana wallet (Phantom) from the header, then hit <b>Launch console</b> to open the game. The console runs in your browser — no download.
                        </p>
                        <p style={p}>
                            You start with a budget and one goal: keep serving requests as traffic ramps up forever. There&rsquo;s no win state — only how long you last, and how high your score climbs before you don&rsquo;t.
                        </p>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/game/assets/gameplay.gif"
                            alt="SORA gameplay — placing services on the isometric grid as traffic flows in"
                            style={{ width: '100%', maxWidth: 640, borderRadius: 12, border: `1px solid ${col.line}`, display: 'block', margin: '16px 0' }}
                        />

                        <div style={tip}>
                            <b style={{ color: col.pink }}>Tip:</b> place a Firewall and a Load Balancer first. Everything else builds on that base.
                        </div>
                    </Section>

                    <Section id="services" title="The Services">
                        <p style={p}>13 building blocks, same ones a real backend runs on. Place them, connect them, upgrade the ones under load.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 16 }}>
                            {SERVICES.map((s) => (
                                <div key={s.name} style={{ background: col.card, border: `1px solid ${col.line}`, borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,92,138,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <s.icon size={14} color={col.pink} />
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                                        </div>
                                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: col.pink }}>${s.cost}</span>
                                    </div>
                                    <p style={{ fontSize: 12.5, color: col.sub, lineHeight: 1.6, margin: 0 }}>{s.blurb}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section id="traffic" title="Traffic Types">
                        <p style={p}>Requests arrive in six flavors. Route the right ones to the right services, or watch reputation drain.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
                            {TRAFFIC_TYPES.map((t) => (
                                <div key={t.name} style={{ background: col.card, border: `1px solid ${col.line}`, borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: t.name === 'MALICIOUS' ? '#f87171' : col.fg, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                                        {t.name}
                                    </div>
                                    <p style={{ fontSize: 12.5, color: col.sub, lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section id="survival" title="Survival Mechanics">
                        <p style={p}>
                            Request rate climbs the longer you survive. On top of that, expect DDoS spikes, cost surges, and random service outages — services also degrade over time and need repair.
                        </p>
                        <p style={p}>
                            Every few minutes the traffic mix shifts (an API-heavy stretch, a storage surge, a search storm) — the base you built for last minute&rsquo;s traffic might not fit this minute&rsquo;s.
                        </p>
                        <div style={tip}>
                            <b style={{ color: col.pink }}>Tip:</b> watch the warning window before a shift or spike lands — that&rsquo;s your window to reroute or upgrade.
                        </div>
                    </Section>

                    <Section id="scoring" title="Scoring & Leaderboard">
                        <p style={p}>
                            Your run ends when reputation hits zero or your budget goes deep enough negative. When it does, your final score, survival time, and run data get signed with your wallet and submitted to the server.
                        </p>
                        <p style={p}>
                            The server verifies your signature, runs a plausibility check on the run (score-vs-time, event density, and a few other bounds), then writes it to the global leaderboard — no separate account needed, your wallet is your identity.
                        </p>
                    </Section>

                    <Section id="tips" title="Tips">
                        <ul style={{ ...p, paddingLeft: 18, margin: 0 }}>
                            <li style={{ marginBottom: 8 }}>Cache what you can — CDN and Memory Cache pay for themselves fast on STATIC/READ-heavy stretches.</li>
                            <li style={{ marginBottom: 8 }}>WRITE traffic always hits the DB. Size it before you need it, not after.</li>
                            <li style={{ marginBottom: 8 }}>Throttled requests (via API Gateway) cost less reputation than outright failures — rate limit before you drop.</li>
                            <li>Upkeep scales the longer you survive. A stack that was profitable at minute 2 can bankrupt you by minute 8.</li>
                        </ul>
                    </Section>

                    <div style={{ marginTop: 20 }}>
                        <Link href="/play" className="btn" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px',
                            background: col.pink, color: '#1a0710', borderRadius: 10, fontWeight: 700,
                            fontSize: 14, textDecoration: 'none',
                        }}>
                            ▶ Launch console
                        </Link>
                    </div>
                </main>
            </div>

            <style>{`
                @media (min-width: 860px) {
                    .htp-sidebar { display: block !important; }
                }
            `}</style>
        </div>
    );
}

const p: CSSProperties = { fontSize: 14, color: col.sub, lineHeight: 1.8, margin: '0 0 12px' };
const tip: CSSProperties = {
    marginTop: 8, padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,92,138,.06)', border: `1px solid ${col.line}`,
    fontSize: 13, color: col.sub, lineHeight: 1.6,
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section id={id} style={{ marginBottom: 40, scrollMarginTop: 90 }}>
            <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                {title}
            </h2>
            {children}
        </section>
    );
}
