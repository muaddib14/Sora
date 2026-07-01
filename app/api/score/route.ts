import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

interface ScoreSubmission {
    wallet: string;
    runId: string;
    score: number;
    seed: number;
    elapsedMs: number;
    reputation: number;
    money: number;
    eventLog: any[];
    signature: string;
    message: string;
}

// Verify Solana message signature
function verifySignature(message: string, signature: string, wallet: string): boolean {
    try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const walletPubkey = new PublicKey(wallet);

        const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            walletPubkey.toBytes()
        );

        return isValid;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

// Anti-cheat Tier 1: plausibility checks
function runAntiCheatChecks(submission: ScoreSubmission): {
    passed: boolean;
    flagged: boolean;
    reason?: string;
} {
    const { score, elapsedMs, reputation, money, eventLog } = submission;

    // Check 1: impossible time (can't get huge score in tiny time)
    const maxScorePerSecond = 100; // reasonable estimate
    const maxPossibleScore = (elapsedMs / 1000) * maxScorePerSecond;
    if (score > maxPossibleScore * 1.5) {
        return { passed: false, flagged: true, reason: 'Score too high for elapsed time' };
    }

    // Check 2: reputation bounds — failure ends at rep ≤ 0, so a small negative is EXPECTED.
    // Only reject clearly impossible values.
    if (reputation < -10 || reputation > 100) {
        return { passed: false, flagged: true, reason: 'Invalid reputation value' };
    }

    // Check 3: money bounds (started at $500, can go negative but not too far)
    const maxNegativeMoney = -2000;
    if (money < maxNegativeMoney) {
        return { passed: false, flagged: true, reason: 'Money too negative' };
    }

    // Check 4: event log sanity (if provided)
    if (eventLog && Array.isArray(eventLog)) {
        // Cap check: no more than 1 event per second
        if (eventLog.length > elapsedMs / 1000 * 2) {
            return { passed: false, flagged: true, reason: 'Event log too dense' };
        }
    }

    // Check 5: game-over condition (must be one)
    const isGameOver = reputation <= 0 || money <= -1000;
    if (!isGameOver) {
        return { passed: false, flagged: true, reason: 'Game not actually over' };
    }

    return { passed: true, flagged: false };
}

export async function POST(req: NextRequest) {
    try {
        const body: ScoreSubmission = await req.json();

        // Validate required fields
        if (!body.wallet || !body.signature || !body.message || !body.runId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifySignature(body.message, body.signature, body.wallet);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Run anti-cheat
        const antiCheat = runAntiCheatChecks(body);
        if (!antiCheat.passed) {
            return NextResponse.json(
                {
                    error: 'Anti-cheat check failed',
                    reason: antiCheat.reason,
                    flagged: antiCheat.flagged
                },
                { status: 403 }
            );
        }

        // Write to database
        const supabase = createServerSupabaseClient();

        // Create operator if doesn't exist
        await supabase
            .from('operators')
            .upsert(
                {
                    wallet: body.wallet,
                    handle: `operator_${body.wallet.slice(0, 8)}`
                },
                { onConflict: 'wallet' }
            );

        // Insert score — coerce to integer columns (money/score/elapsed/seed are BIGINT)
        const { data, error } = await supabase
            .from('scores')
            .insert({
                wallet: body.wallet,
                run_id: body.runId,
                score: Math.round(body.score),
                elapsed_ms: Math.round(body.elapsedMs),
                seed: body.seed != null ? Math.round(body.seed) : null,
                reputation: body.reputation,
                money: Math.round(body.money),
                event_log: body.eventLog ?? [],
                signature: body.signature,
                verified: antiCheat.passed && !antiCheat.flagged,
                mode: 'survival'
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: `Failed to save score: ${error.message}`, code: error.code, details: error.details },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            score: data
        });
    } catch (error) {
        console.error('Score submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
