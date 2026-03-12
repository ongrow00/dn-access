import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL;
    const key =
      process.env.SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;
    const missing: string[] = [];
    if (!url || url.trim() === '') missing.push('NEXT_PUBLIC_SUPABASE_URL (ou SUPABASE_URL)');
    if (!key || key.trim() === '') missing.push('SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_ROLE_KEY)');
    if (missing.length > 0) {
      throw new Error('Missing Supabase env: ' + missing.join(', '));
    }
    _client = createClient(url.trim(), key.trim());
  }
  return _client;
}
