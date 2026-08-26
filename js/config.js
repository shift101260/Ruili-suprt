// js/config.js
export const SUPABASE_URL = 'https://cksoeikllbzdihlesraa.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_V9QZLQBkv2SGrthA814LAg_x167CTRD';
export const STORAGE_KEY = 'RUILI_SYSTEM_CASES_2026';

// 使用官方 CDN 建立 Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
