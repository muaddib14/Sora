'use client';

import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

interface WalletContextState {
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    disconnecting: boolean;
}

function isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Phantom's own in-app browser injects window.solana; a bare mobile
 * Chrome/Safari tab never will. Redirect there instead of failing. */
function redirectToPhantomBrowser(): void {
    const url = encodeURIComponent(window.location.href);
    const ref = encodeURIComponent(window.location.origin);
    window.location.href = `https://phantom.app/ul/browse/${url}?ref=${ref}`;
}

export async function signMessage(message: string): Promise<{ signature: string; message: string } | null> {
    try {
        // Try to access Phantom or other Solana wallet
        const provider = (window as any).solana;
        if (!provider) {
            if (isMobileDevice()) {
                redirectToPhantomBrowser();
                return null;
            }
            alert('Solana wallet not found. Install Phantom wallet.');
            return null;
        }

        if (!provider.isConnected) {
            await provider.connect();
        }

        const messageBuffer = new TextEncoder().encode(message);
        const signedMessage = await provider.signMessage(messageBuffer, 'utf8');

        // Phantom returns signature as Uint8Array → encode bs58 so server can bs58.decode
        const sigBytes: Uint8Array = signedMessage.signature ?? signedMessage;
        return {
            signature: bs58.encode(sigBytes),
            message: message
        };
    } catch (error) {
        console.error('Wallet sign error:', error);
        return null;
    }
}

export async function connectWallet(): Promise<string | null> {
    try {
        const provider = (window as any).solana;
        if (!provider) {
            if (isMobileDevice()) {
                redirectToPhantomBrowser();
                return null;
            }
            alert('Solana wallet not found. Install Phantom wallet.');
            return null;
        }

        const response = await provider.connect();
        return response.publicKey.toString();
    } catch (error) {
        console.error('Wallet connect error:', error);
        return null;
    }
}

export async function disconnectWallet(): Promise<void> {
    try {
        const provider = (window as any).solana;
        if (provider) {
            await provider.disconnect();
        }
    } catch (error) {
        console.error('Wallet disconnect error:', error);
    }
}

export function getWalletAddress(): string | null {
    try {
        const provider = (window as any).solana;
        if (provider?.isConnected && provider?.publicKey) {
            return provider.publicKey.toString();
        }
    } catch (error) {
        console.error('Get wallet address error:', error);
    }
    return null;
}

/* ── Wallet store (useSyncExternalStore) ──
   Single source of truth for the persisted wallet address. Avoids SSR
   hydration mismatch: getServerSnapshot returns null, client reads localStorage. */
const STORAGE_KEY = 'sora_wallet';
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

export function subscribeWallet(callback: () => void): () => void {
    listeners.add(callback);
    // cross-tab sync
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) callback(); };
    window.addEventListener('storage', onStorage);
    return () => {
        listeners.delete(callback);
        window.removeEventListener('storage', onStorage);
    };
}

export function getWalletSnapshot(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
}

export function getWalletServerSnapshot(): string | null {
    return null;
}

export function setStoredWallet(addr: string | null) {
    if (addr) localStorage.setItem(STORAGE_KEY, addr);
    else localStorage.removeItem(STORAGE_KEY);
    emit();
}
