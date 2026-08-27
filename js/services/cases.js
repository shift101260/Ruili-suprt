import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

// 預設表單/網頁使用的儲存 Key
const STORAGE_KEY = 'RUILI_SYSTEM_CASES_2026';

// 1. 【新增】從 Supabase 讀取最新案件資料並渲染畫面
window.fetchFromSupabase = async function() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/cases?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const remoteData = await response.json();

    if (Array.isArray(remoteData) && remoteData.length > 0) {
      // 解析 Supabase 儲存的完整 JSON 資料 (data 欄位)
      const parsedCases = remoteData.map(row => row.data || {
        id: row.id,
        clientName: row.client_name,
        status: row.status,
        workProgress: row.work_progress,
        contractAmount: row.contract_amount
      });

      // 更新全域變數與本地 localStorage 快取
      window.casesData = parsedCases;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedCases));

      // 重新渲染畫面與更新戰情室數據
      if (typeof window.loadCasesFromStorage === 'function') {
        window.loadCasesFromStorage();
      }

      console.log('✅ 成功從 Supabase 下載最新案件資料！');
    }
  } catch (error) {
    console.error('❌ 從 Supabase 讀取資料失敗：', error.message);
  }
};

// 2. 同步資料至 Supabase (覆寫與新增 merge-duplicates)
window.syncToSupabase = async function(casesData) {
  try {
    if (!casesData || casesData.length === 0) return;

    const payload = casesData.map(item => ({
      id: String(item.id),
      client_name: item.clientName || '',
      status: item.status || '案件評估',
      work_progress: item.workProgress || '',
      contract_amount: Number(item.contractAmount) || 0,
      data: item
    }));

    const response = await fetch(`${SUPABASE_URL}/rest/v1/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    console.log('✅ 雲端數據已成功寫入 Supabase！');
  } catch (error) {
    console.error('❌ 同步失敗：', error.message);
  }
};

// 3. 【新增】網頁載入完成時，自動觸發雲端拉取
document.addEventListener('DOMContentLoaded', () => {
  window.fetchFromSupabase();
});
