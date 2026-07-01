'use client';

export interface ShareScoreData {
  score: number;
  timeSec: number;
  rank?: number;
  seed: string;
  wallet?: string | null;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export function buildShareText(data: ShareScoreData): string {
  const { score, timeSec, rank } = data;
  const time = formatTime(timeSec);
  const s = score.toLocaleString();

  if (rank && rank <= 10) {
    return `🩷 RANK #${rank} on today's $SORA daily — ${s} pts, survived ${time}.\nThink you can keep the servers alive? ●`;
  }
  return `I survived ${time} and scored ${s} on today's $SORA daily 🩷\nCan you keep the servers alive? ●`;
}

export function shareScore(data: ShareScoreData): void {
  const { score, seed, timeSec } = data;
  const base = 'https://www.playsora.xyz';
  // cache-buster: forces X to re-crawl fresh OG card every share
  const cb = Date.now().toString(36);
  const url = `${base}/d/${seed}?beat=${score}${data.rank ? `&r=${data.rank}` : ''}&t=${Math.round(timeSec)}&v=${cb}`;
  const text = buildShareText(data);

  const intent =
    'https://twitter.com/intent/tweet' +
    `?text=${encodeURIComponent(text)}` +
    `&url=${encodeURIComponent(url)}`;

  window.open(intent, '_blank', 'noopener,width=560,height=640');
}
