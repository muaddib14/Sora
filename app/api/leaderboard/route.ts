import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
            return NextResponse.json({ success: true, scores: [], total: 0, limit: 100, offset: 0 });
        }

        const searchParams = req.nextUrl.searchParams;
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
        const season = searchParams.get('season') ? parseInt(searchParams.get('season')!) : null;
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = createServerSupabaseClient();

        let query = supabase
            .from('scores')
            .select(
                `
                id,
                wallet,
                score,
                elapsed_ms,
                reputation,
                season,
                created_at,
                operators(handle)
                `
            )
            .eq('verified', true)
            .order('score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (season) {
            query = query.eq('season', season);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Leaderboard query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch leaderboard' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            scores: data,
            total: count,
            limit,
            offset
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
