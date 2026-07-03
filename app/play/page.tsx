'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
    connectWallet,
    disconnectWallet,
    subscribeWallet,
    getWalletSnapshot,
    getWalletServerSnapshot,
    setStoredWallet,
} from '@/lib/wallet';
import { submitScore } from '@/lib/score-submit';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { useTheme } from '@/lib/theme';
import { shareScore } from '@/lib/share';
import '../landing.css';

interface GameEvent {
    type: string;
    t: number;
    [key: string]: unknown;
}

interface GameScore {
    runId: string;
    score: number;
    elapsedMs: number;
    seed: number;
    mode: string;
    reputation: number;
    money: number;
    eventLog: GameEvent[];
}

export default function PlayPage() {
    const themeContext = useTheme();
    const theme = themeContext?.theme ?? 'dark';
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [gameReady, setGameReady] = useState(false);
    const wallet = useSyncExternalStore(subscribeWallet, getWalletSnapshot, getWalletServerSnapshot);
    const [walletConnecting, setWalletConnecting] = useState(false);
    const [gameRunning, setGameRunning] = useState(false);
    const [currentScore, setCurrentScore] = useState<GameScore | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const runIdRef = useRef<string>(crypto.randomUUID());
    const gameDataRef = useRef<GameScore | null>(null);

    // Bind a fresh ranked run into the game (runId echoed back in game events)
    const bindRun = (addr: string) => {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;
        const target = window.location.origin; // iframe is same-origin (/game)
        runIdRef.current = crypto.randomUUID();
        win.postMessage({ type: 'host:config', data: { wallet: addr, season: 1, skin: 'default' } }, target);
        win.postMessage({ type: 'host:newRun', data: { runId: runIdRef.current, mode: 'survival' } }, target);
    };

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.source !== iframeRef.current?.contentWindow) return;
            if (e.origin !== window.location.origin) return; // reject cross-origin senders
            const { type, data } = e.data;
            switch (type) {
                case 'game:ready':
                    setGameReady(true);
                    // Auto-bind so any in-game start is wallet-attributed
                    if (wallet) bindRun(wallet);
                    break;
                case 'game:start':
                    setGameRunning(true);
                    setShowResult(false);
                    setSubmitStatus({ type: null, message: '' });
                    break;
                case 'game:score':
                    setCurrentScore(data);
                    break;
                case 'game:over':
                    setGameRunning(false);
                    gameDataRef.current = data;
                    setCurrentScore(data);
                    setShowResult(true);
                    // Pre-bind next run so a restart stays ranked
                    if (wallet) bindRun(wallet);
                    break;
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [wallet]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleConnectWallet = async () => {
        setWalletConnecting(true);
        try {
            const address = await connectWallet();
            if (address) {
                setStoredWallet(address);
                setSubmitStatus({ type: 'success', message: 'Wallet connected' });
                if (gameReady) bindRun(address);
            } else {
                setSubmitStatus({ type: 'error', message: 'Failed to connect wallet' });
            }
        } finally {
            setWalletConnecting(false);
        }
    };

    const handleDisconnectWallet = async () => {
        await disconnectWallet();
        setStoredWallet(null);
        setSubmitStatus({ type: null, message: '' });
    };

    const handleSubmitScore = async () => {
        if (!wallet || !gameDataRef.current) { setSubmitStatus({ type: 'error', message: 'Missing wallet or game data' }); return; }
        setSubmitting(true);
        try {
            const result = await submitScore(wallet, gameDataRef.current);
            if (result.success) {
                setSubmitStatus({ type: 'success', message: `Score submitted! ID: ${result.scoreId} (${result.verified ? 'Verified' : 'Pending'})` });
            } else {
                setSubmitStatus({ type: 'error', message: `Submission failed: ${result.error}` });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const stageRef = useRef<HTMLDivElement>(null);
    const [fakeFullscreen, setFakeFullscreen] = useState(false);
    const toggleFullscreen = () => {
        const el = stageRef.current;
        if (!el) return;
        // iOS Safari/WKWebView (incl. Phantom's in-app browser) never implemented
        // the Fullscreen API. Fall back to a fixed-position overlay instead.
        if (el.requestFullscreen || document.exitFullscreen) {
            if (document.fullscreenElement) document.exitFullscreen();
            else el.requestFullscreen?.();
        } else {
            setFakeFullscreen((v) => !v);
        }
    };

    const statusLabel = gameRunning ? 'RUNNING' : gameReady ? 'READY' : 'LOADING';
    const statusColor = gameRunning ? '#4ade80' : gameReady ? '#ff5c8a' : '#5d6678';

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

            {/* header — identical to landing; hidden during fake-fullscreen
                (iOS lacks the Fullscreen API, so our CSS overlay can't out-stack
                the header's own sticky z-index without escaping its stacking
                context — simplest fix is to just hide it while overlay is up) */}
            <header style={fakeFullscreen ? { display: 'none' } : undefined}>
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
                    {wallet ? (
                        <button className="btn btn-pink" type="button" onClick={handleDisconnectWallet} title="Click to disconnect">
                            {wallet.slice(0, 6)}…{wallet.slice(-4)}
                        </button>
                    ) : (
                        <button className="btn btn-pink" type="button" onClick={handleConnectWallet} disabled={walletConnecting}>
                            {walletConnecting ? 'Connecting…' : 'Connect wallet'}
                        </button>
                    )}
                    <MobileNav links={[
                        { href: '/play', label: 'PLAY' },
                        { href: '/#network', label: 'NETWORK' },
                        { href: '/leaderboard', label: 'LEADERBOARD' },
                        { href: '/#token', label: '$SORA' },
                    ]} />
                </div>
            </header>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1480, margin: '0 auto', padding: '20px 20px 48px' }}>

                {/* compact control bar above the stage */}
                <div className="game-control-bar" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '4px 12px', background: 'rgba(255,92,138,.1)', border: '1px solid rgba(255,92,138,.3)',
                        borderRadius: 20, fontSize: 12, color: 'var(--pink)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>Season 1 · Survival</span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: statusColor, fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
                        {gameRunning ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill={statusColor}><rect width="10" height="10" rx="2"/></svg>
                        ) : gameReady ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill={statusColor}><circle cx="5" cy="5" r="5"/></svg>
                        ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        )}
                        {statusLabel}
                    </span>

                    <span style={{ color: 'var(--ink-dim)', fontSize: 12.5, fontFamily: 'monospace' }}>
                        {wallet ? 'Start the run inside the game — score auto-binds to your wallet' : 'Connect wallet to record ranked scores'}
                    </span>

                    <div style={{ flex: 1 }} />

                    <button onClick={toggleFullscreen} disabled={!gameReady} title="Fullscreen" style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
                        background: theme === 'light' ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.05)',
                        border: `1px solid var(--line)`,
                        borderRadius: 8, color: gameReady ? 'var(--ink)' : 'var(--ink-dim)', fontSize: 13,
                        fontFamily: 'monospace', cursor: gameReady ? 'pointer' : 'not-allowed',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                        Fullscreen
                    </button>
                </div>

                {/* game stage — the product, big */}
                <div ref={stageRef} style={{
                    position: fakeFullscreen ? 'fixed' : 'relative',
                    inset: fakeFullscreen ? 0 : undefined,
                    zIndex: fakeFullscreen ? 9999 : undefined,
                    background: 'var(--panel)',
                    border: fakeFullscreen ? 'none' : '1px solid rgba(255,92,138,.15)',
                    borderRadius: fakeFullscreen ? 0 : 16, overflow: 'hidden',
                }}>
                    {fakeFullscreen && (
                        <button onClick={() => setFakeFullscreen(false)} title="Exit fullscreen" style={{
                            position: 'absolute', top: 12, right: 12, zIndex: 10000,
                            width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,.2)',
                            background: 'rgba(12,14,19,.8)', color: '#fff', fontSize: 16, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                    )}
                    <iframe
                        ref={iframeRef}
                        src="/game/index.html"
                        title="SERVER: Survival Protocol"
                        style={{ width: '100%', height: (isFullscreen || fakeFullscreen) ? '100vh' : '82vh', minHeight: 'min(560px, 70vh)', border: 'none', display: 'block' }}
                    />
                    {!wallet && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: theme === 'light' ? 'rgba(0,0,0,.5)' : 'rgba(12,14,19,.78)', backdropFilter: 'blur(3px)', zIndex: 5,
                        }}>
                            <div style={{ textAlign: 'center', maxWidth: 340 }}>
                                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
                                    Connect to play ranked
                                </div>
                                <p style={{ fontSize: 13.5, color: 'var(--ink-faint)', marginBottom: 18, lineHeight: 1.6 }}>
                                    You can watch, but ranked scores only record with a connected wallet.
                                </p>
                                <button className="btn btn-pink" type="button" onClick={handleConnectWallet} disabled={walletConnecting}>
                                    {walletConnecting ? 'Connecting…' : 'Connect wallet'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* game over modal — floats over the page, no scroll needed */}
            {currentScore && showResult && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: theme === 'light' ? 'rgba(0,0,0,.6)' : 'rgba(8,10,14,.72)', backdropFilter: 'blur(6px)', padding: 20,
                }}>
                    <div style={{
                        width: '100%', maxWidth: 460, background: 'var(--panel)',
                        border: '1px solid rgba(255,92,138,.25)', borderRadius: 16, padding: '28px',
                        boxShadow: '0 24px 60px -12px rgba(0,0,0,.6)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Clash Display', sans-serif", fontSize: 19, fontWeight: 700, color: 'var(--pink)', letterSpacing: '-0.01em' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                SYSTEM FAILURE
                            </div>
                            <button onClick={() => setShowResult(false)} title="Close" style={{
                                background: 'transparent', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer', padding: 4, lineHeight: 0,
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            {[
                                { label: 'Final Score', value: String(currentScore.score) },
                                { label: 'Reputation', value: `${currentScore.reputation.toFixed(1)}%` },
                                { label: 'Time Alive', value: `${(currentScore.elapsedMs / 1000).toFixed(1)}s` },
                                { label: 'Budget Left', value: `$${Math.round(currentScore.money)}` },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ background: theme === 'light' ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 16px' }}>
                                    <div style={{ fontSize: 11, color: 'var(--ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--ink)' }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {submitStatus.type && (
                            <div style={{
                                marginBottom: 14, padding: '12px 16px', borderRadius: 10,
                                background: submitStatus.type === 'success' ? 'rgba(74,222,128,.08)' : 'rgba(248,113,113,.08)',
                                border: `1px solid ${submitStatus.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)'}`,
                                color: submitStatus.type === 'success' ? '#4ade80' : '#f87171',
                                fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-word',
                            }}>
                                {submitStatus.message}
                            </div>
                        )}

                        <button
                            onClick={() => currentScore && shareScore({
                                score: currentScore.score,
                                timeSec: currentScore.elapsedMs / 1000,
                                rank: undefined, // TODO: get rank from leaderboard
                                seed: new Date().toISOString().split('T')[0],
                                wallet,
                            })}
                            style={{
                                width: '100%', padding: '14px', marginBottom: 12,
                                background: 'var(--pink)', border: '1px solid rgba(255,92,138,.4)',
                                borderRadius: 12, color: '#fff',
                                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                fontFamily: "'Clash Display', sans-serif", letterSpacing: '0.03em',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            Share Score
                        </button>

                        {wallet ? (
                            submitStatus.type === 'success' ? (
                                <Link href="/leaderboard" className="btn btn-pink" style={{ display: 'block', textAlign: 'center', padding: '14px', fontSize: 15 }}>
                                    View Leaderboard →
                                </Link>
                            ) : (
                                <button onClick={handleSubmitScore} disabled={submitting} style={{
                                    width: '100%', padding: '14px',
                                    background: submitting ? 'rgba(255,255,255,.04)' : '#ff5c8a',
                                    border: submitting ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,92,138,.4)',
                                    borderRadius: 12, color: submitting ? '#475569' : '#fff',
                                    fontSize: 15, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
                                    fontFamily: "'Clash Display', sans-serif", letterSpacing: '0.03em',
                                }}>
                                    {submitting ? 'Submitting…' : 'Submit Score to Leaderboard'}
                                </button>
                            )
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>Connect wallet to submit your score.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
