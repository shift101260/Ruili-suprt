// js/config.js
export const SUPABASE_URL = 'https://cksoeikllbzdihlesraa.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_V9QZLQBKv2SGrthA814LAg_x167CTRD';

// 優先使用全局 window.supabase，若不存在則提示
const supabaseObj = typeof window !== 'undefined' && window.supabase ? window.supabase : null;

export const supabaseClient = supabaseObj 
  ? supabaseObj.createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const STORAGE_KEY = 'RUILI_SYSTEM_CASES_2026';
