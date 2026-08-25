// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

export async function syncToSupabase(data) {
  if (!data || !supabaseClient) return;
  try {
    // 直接 insert 最新資料陣列，讓 Supabase 自動生成 id
    const { error } = await supabaseClient
      .from('cases')
      .insert([{ data: data }]);

    if (error) throw error;
    console.log('雲端同步成功！');
  } catch (err) {
    console.error('雲端同步失敗：', err);
  }
}

export async function loadFromSupabase() {
  if (!supabaseClient) return;
  try {
    // 永遠讀取流水號 id 最大（最新）的那一筆
    const { data, error } = await supabaseClient
      .from('cases')
      .select('data')
      .order('id', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0 && data[0].data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data[0].data));
      if (typeof window.loadCasesFromStorage === 'function') {
        window.loadCasesFromStorage();
      }
    }
  } catch (err) {
    console.error('載入雲端資料失敗：', err);
  }
}
