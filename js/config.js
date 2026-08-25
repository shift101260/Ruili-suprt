// js/config.js
export const SUPABASE_URL = 'https://cksoeikllbzdihlesraa.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_V9QZLQBKv2SGrthA814LAg_x167CTRD';

// 判斷是否為瀏覽器環境並取得 Supabase SDK
const getSupabaseClient = () => {
  if (typeof window !== 'undefined' && window.supabase) {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return null;
};

export const supabaseClient = getSupabaseClient();
export const STORAGE_KEY = 'RUILI_SYSTEM_CASES_2026';
