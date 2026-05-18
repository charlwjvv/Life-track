import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { transport: WebSocket as any },
});
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: { transport: WebSocket as any },
});