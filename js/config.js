// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

// 設定固定的資料列 ID，確保資料永遠在同一個容器內覆蓋更新
const ROW_ID = 1;

/**
 * 將本地端的案件資料同步（更新）至 Supabase 雲端資料庫
 * @param {Array} data - 全站案件資料陣列
 */
export async function syncToSupabase(data) {
  if (!data || !supabaseClient) return;
  try {
    // 使用 upsert：若 id: 1 存在則更新，不存在則新增
    const { error } = await supabaseClient
      .from('cases')
      .upsert({ id: ROW_ID, data: data });

    if (error) throw error;
    console.log('雲端同步成功！');
  } catch (err) {
    console.error('雲端同步失敗：', err);
  }
}

/**
 * 從 Supabase 雲端資料庫讀取最新案件資料並寫回 localStorage
 */
export async function loadFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('cases')
      .select('data')
      .eq('id', ROW_ID)
      .single();

    // 若尚未建立第一筆資料 (PGRST116 錯誤) 可先忽視，其餘錯誤拋出
    if (error && error.code !== 'PGRST116') throw error;

    if (data && data.data) {
      // 寫入本地存儲並觸發主畫面的渲染
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
      if (typeof window.loadCasesFromStorage === 'function') {
        window.loadCasesFromStorage();
      }
    }
  } catch (err) {
    console.error('載入雲端資料失敗：', err);
  }
}
