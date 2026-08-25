// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

export async function syncToSupabase(data) {
  if (!data) return;
  try {
    await supabaseClient.from('cases').insert([{ data: data }]);
    console.log('雲端同步成功！');
  } catch (err) {
    console.error('雲端同步失敗：', err);
  }
}

export async function loadFromSupabase(casesDataRef, callback) {
  try {
    const { data, error } = await supabaseClient
      .from('cases')
      .select('data')
      .order('id', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      let cloudData = data[0].data;
      let parsedData = typeof cloudData === 'string' ? JSON.parse(cloudData) : cloudData;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      if (typeof callback === 'function') callback(parsedData);
      console.log('已自動同步雲端最新案件！');
    }
  } catch (err) {
    console.error('載入雲端失敗，使用本地資料：', err);
  }
}
