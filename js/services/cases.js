// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

// 1. 同步全量案件（逐筆 upsert 到 Supabase）
export async function syncToSupabase(casesArray) {
  if (!Array.isArray(casesArray) || casesArray.length === 0) return;

  try {
    const rowsToUpsert = casesArray.map(c => ({
      id: String(c.id),
      client_name: c.clientName || c.client_name || '',
      status: c.status || '',
      work_progress: c.workProgress || c.work_progress || '',
      contract_amount: parseFloat(c.contractAmount || c.contract_amount || 0),
      data: c
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

// 2. 單筆刪除案件同步
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

// 3. 從 Supabase 載入（加強版防覆蓋保護）
export async function loadFromSupabase(callback) {
  try {
    const { data, error } = await supabaseClient
      .from('cases')
      .select('*');

    if (error) throw error;

    // 💡 安全防護：只有當雲端有資料 (長度 > 0) 時才覆蓋本機；如果雲端是空的，自動把本機資料同步上去！
    if (data && data.length > 0) {
      const parsedCases = data.map(row => row.data || row);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedCases));
      
      if (typeof callback === 'function') callback(parsedCases);
      console.log('已成功從雲端載入全量案件清單！');
    } else {
      // 雲端是空的，檢查本機有沒有資料，如果有就幫忙同步上雲端
      const localDataStr = localStorage.getItem(STORAGE_KEY);
      if (localDataStr) {
        const localCases = JSON.parse(localDataStr);
        if (Array.isArray(localCases) && localCases.length > 0) {
          console.log('偵測到雲端為空，自動將本機資料同步至雲端...');
          await syncToSupabase(localCases);
          if (typeof callback === 'function') callback(localCases);
        }
      }
    }
  } catch (err) {
    console.error('載入雲端失敗，使用本地資料：', err.message || err);
  }
}
