// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

export async function syncToSupabase(data) {
  if (!data) return;
  try {
    // 1. 萃取出所有客戶名稱，方便在 Supabase 後台一眼識別
    const clientNames = Array.isArray(data) ? data.map(c => c.clientName).filter(Boolean) : [];

    // 2. 先檢查資料庫裡面有沒有已經存在的紀錄
    const { data: existingRows, error: fetchError } = await supabaseClient
      .from('cases')
      .select('id')
      .order('id', { ascending: true })
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingRows && existingRows.length > 0) {
      // 如果已經有紀錄，就「更新」第一筆（永遠只保留最新、最完整的 1 筆備份）
      const rowId = existingRows[0].id;
      const { error: updateError } = await supabaseClient
        .from('cases')
        .update({ 
          data: data,
          client_names: clientNames // 如果您在 Supabase 有加這個欄位，可以直觀看到客戶名
        })
        .eq('id', rowId);

      if (updateError) throw updateError;
      console.log('雲端備份更新成功（覆蓋舊檔，無重複堆疊）！');
    } else {
      // 如果完全沒有紀錄，才執行第一次新增
      const { error: insertError } = await supabaseClient
        .from('cases')
        .insert([{ 
          data: data,
          client_names: clientNames 
        }]);

      if (insertError) throw insertError;
      console.log('雲端首次備份成功！');
    }

  } catch (err) {
    console.error('雲端同步失敗：', err.message || err);
  }
}

export async function loadFromSupabase(callback) {
  try {
    const { data, error } = await supabaseClient
      .from('cases')
      .select('data')
      .order('id', { ascending: true })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      let cloudData = data[0].data;
      let parsedData = typeof cloudData === 'string' ? JSON.parse(cloudData) : cloudData;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      
      if (typeof callback === 'function') {
        callback(parsedData);
      }
      console.log('已成功從雲端載入最新備份資料！');
    }
  } catch (err) {
    console.error('載入雲端失敗，使用本地資料：', err.message || err);
  }
}
