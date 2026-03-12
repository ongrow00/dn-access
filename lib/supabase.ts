import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url =
      getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
      getEnv('SUPABASE_URL');
    const key =
      getEnv('SERVICE_ROLE_KEY') ||
      getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const missing: string[] = [];
    if (!url || url.trim() === '') missing.push('NEXT_PUBLIC_SUPABASE_URL (ou SUPABASE_URL)');
    if (!key || key.trim() === '') missing.push('SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_ROLE_KEY)');
    if (missing.length > 0) {
      throw new Error('Missing Supabase env: ' + missing.join(', '));
    }
    _client = createClient(url!.trim(), key!.trim());
  }
  return _client;
}
