import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhpzcjnctsjntvpkcwya.supabase.co';
const supabasePublishableKey = 'sb_publishable_FDeDbRwfdmDNHuH4lZCnaA_e6leIE3d';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
