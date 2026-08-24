export const SUPABASE_URL = 'https://cksoeikllbzdihlesraa.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_V9QZLQBKv2SGrthA814LAg_x167CTRD';

// 建立並匯出 Supabase Client 實例
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
