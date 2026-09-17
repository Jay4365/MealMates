import { createClient } from '@supabase/supabase-js';

// Get credentials from env or runtime localStorage override
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('mealmates_supabase_url') || '';
  const storedKey = localStorage.getItem('mealmates_supabase_anon_key') || '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
};

const config = getSupabaseConfig();

export const supabase = config.isConfigured
  ? createClient(config.url, config.anonKey)
  : null;

export const setCustomSupabaseConfig = (url: string, anonKey: string) => {
  if (url && anonKey) {
    localStorage.setItem('mealmates_supabase_url', url.trim());
    localStorage.setItem('mealmates_supabase_anon_key', anonKey.trim());
  } else {
    localStorage.removeItem('mealmates_supabase_url');
    localStorage.removeItem('mealmates_supabase_anon_key');
  }
  // Reload to re-initialize supabase client
  window.location.reload();
};
