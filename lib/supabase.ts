import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (supabaseClient) return supabaseClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(url, key);
    return supabaseClient;
}

export const supabase = {
    get client() {
        return getSupabaseClient();
    }
};

// Server-side client (for API routes)
export function createServerSupabaseClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!
    );
}

// Types
export interface Operator {
    wallet: string;
    handle: string;
    skin: string;
    season_pass: boolean;
    created_at: string;
}

export interface Season {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
    prize_pool: number;
    merkle_root?: string;
    created_at: string;
}

export interface Score {
    id: number;
    wallet: string;
    run_id: string;
    score: number;
    elapsed_ms: number;
    mode: string;
    season?: number;
    seed?: number;
    verified: boolean;
    signature?: string;
    event_log?: any;
    reputation?: number;
    money?: number;
    created_at: string;
}

// Helpers
export async function getLeaderboard(limit = 100, season?: number) {
    const client = getSupabaseClient();
    let query = client
        .from('scores')
        .select('*,operators(handle)')
        .eq('verified', true)
        .order('score', { ascending: false })
        .limit(limit);

    if (season) {
        query = query.eq('season', season);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getOperatorStats(wallet: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('scores')
        .select('*')
        .eq('wallet', wallet)
        .eq('verified', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createOperator(wallet: string, handle: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('operators')
        .upsert({ wallet, handle }, { onConflict: 'wallet' })
        .select()
        .single();

    if (error) throw error;
    return data;
}
