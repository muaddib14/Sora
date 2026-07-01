import { signMessage } from './wallet';

export interface GameOverData {
    runId: string;
    seed: number;
    score: number;
    elapsedMs: number;
    mode: string;
    reputation: number;
    money: number;
    eventLog: any[];
}

export async function submitScore(wallet: string, gameData: GameOverData) {
    try {
        // Create message to sign
        const message = JSON.stringify({
            runId: gameData.runId,
            score: gameData.score,
            elapsedMs: gameData.elapsedMs,
            seed: gameData.seed,
            timestamp: Date.now()
        });

        // Sign message with wallet
        const signResult = await signMessage(message);
        if (!signResult) {
            throw new Error('Failed to sign message');
        }

        // Submit to API
        const response = await fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wallet,
                runId: gameData.runId,
                score: gameData.score,
                seed: gameData.seed,
                elapsedMs: gameData.elapsedMs,
                reputation: gameData.reputation,
                money: gameData.money,
                eventLog: gameData.eventLog,
                signature: signResult.signature,
                message: signResult.message
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Score submission failed');
        }

        return {
            success: true,
            scoreId: result.score.id,
            verified: result.score.verified
        };
    } catch (error) {
        console.error('Score submission error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
