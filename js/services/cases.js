// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

// 1. 同步全量案件（逐筆 upsert 到 Supabase）
export async function syncToSupabase(casesArray) {
  if (!Array.isArray(casesArray) || casesArray.length === 0) return;

  try {
    // 將前端格式轉換為 Supabase 資料表欄位格式
    const rowsToUpsert = casesArray.map(c => ({
      id: c.id,
      client_name: c.clientName || '',
      status: c.status || '',
      work_progress: c.workProgress || '',
      contract_amount: parseFloat(c.contractAmount || 0),
      data: c // 將整筆案件詳細資料存入 data 欄位備份
    }));

    const { error } = await supabaseClient
      .from('cases')
      .upsert(rowsToUpsert, { onConflict: 'id' });

    if (error) throw error;
    console.log('方案 B：單筆案件數據已成功同步至雲端！');
  } catch (err) {
    console.error('雲端同步失敗：', err.message || err);
  }
}

// 2. 從 Supabase 載入所有案件列並組裝回陣列
export async function loadFromSupabase(callback) {
  try {
    const { data, error } = await supabaseClient
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      // 從每一列的 data 欄位或獨立欄位還原前端陣列
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
