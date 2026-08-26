// js/config.js
export const SUPABASE_URL = 'https://cksoeikllbzdihlesraa.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_V9QZLQBKv2SGrthA814LAg_x167CTRD';
export const STORAGE_KEY = 'RUILI_SYSTEM_CASES_2026';

// 使用 index.html 載入的全域 Supabase 套件建立連線
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
