// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

// 1. 同步全量案件（逐筆 upsert 到 Supabase）
export async function syncToSupabase(casesArray) {
  if (!Array.isArray(casesArray)) return;

  try {
    // 若前端案件清單為空，代表資料被清空，免執行 upsert
    if (casesArray.length === 0) return;

    // 將前端格式轉換為 Supabase 資料表欄位格式
    const rowsToUpsert = casesArray.map(c => ({
      id: String(c.id),
      client_name: c.clientName || c.client_name || '',
      status: c.status || '',
      work_progress: c.workProgress || c.work_progress || '',
      contract_amount: parseFloat(c.contractAmount || c.contract_amount || 0),
      data: c // 將整筆案件詳細資料存入 data 欄位備份
    }));

    const { error } = await supabaseClient
      .from('cases')
      .upsert(rowsToUpsert, { onConflict: 'id' });

    if (error) throw error;
    console.log('方案 B：案件數據已成功逐筆同步至雲端！');
  } catch (err) {
    console.error('雲端同步失敗：', err.message || err);
  }
}

// 2. 單筆刪除案件同步（確保前端刪除時，雲端也同步移除）
export async function deleteFromSupabase(caseId) {
  if (!caseId) return;
  try {
    const { error } = await supabaseClient
      .from('cases')
      .delete()
      .eq('id', String(caseId));

    if (error) throw error;
    console.log(`雲端已成功刪除案件：${caseId}`);
  } catch (err) {
    console.error('雲端刪除失敗：', err.message || err);
  }
}

// 3. 從 Supabase 載入所有案件列並組裝回陣列
export async function loadFromSupabase(callback) {
  try {
    const { data, error } = await supabaseClient
      .from('cases')
      .select('*');

    if (error) throw error;

    if (data) {
      // 優先取用 data 欄位內的完整 JSON，確保細節資料不遺失
      const parsedCases = data.map(row => row.data || row);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedCases));
      
      if (typeof callback === 'function') {
        callback(parsedCases);
      }
      console.log('已成功從雲端載入全量案件清單！');
    }
  } catch (err) {
    console.error('載入雲端失敗，使用本地資料：', err.message || err);
  }
}
