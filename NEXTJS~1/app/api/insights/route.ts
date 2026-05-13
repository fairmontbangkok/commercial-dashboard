import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const querySchema = z.object({
  status: z.enum(['open', 'acknowledged', 'actioned', 'dismissed']).optional().default('open'),
  severity: z.enum(['action', 'attention', 'watch', 'opportunity']).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

  // RLS will scope to user's property automatically
  let query = supabase
    .from('insights')
    .select('*')
    .eq('status', params.status)
    .order('detected_at', { ascending: false })
    .limit(params.limit);

  if (params.severity) query = query.eq('severity', params.severity);
  if (params.category) query = query.eq('category', params.category);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    insights: data,
    count: data?.length ?? 0,
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { insightId, status } = z
    .object({
      insightId: z.string().uuid(),
      status: z.enum(['acknowledged', 'actioned', 'dismissed']),
    })
    .parse(body);

  const { error } = await supabase
    .from('insights')
    .update({
      status,
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', insightId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
