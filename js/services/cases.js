import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

const STORAGE_KEY = 'RUILI_SYSTEM_CASES_2026';

// 1. 從 Supabase 抓取資料並【強制刷新畫面】
window.fetchFromSupabase = async function() {
  try {
    console.log('🔄 開始從 Supabase 拉取最新案件資料...');
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
    console.log('📦 Supabase 回傳原始資料：', remoteData);

    if (Array.isArray(remoteData) && remoteData.length > 0) {
      // 優先讀取 JSON 物件 (data)，若無則解析欄位
      const parsedCases = remoteData.map(row => {
        if (row.data && typeof row.data === 'object') {
          return row.data;
        }
        return {
          id: String(row.id),
          clientName: row.client_name || '未命名客戶',
          status: row.status || '簽約案件',
          workProgress: row.work_progress || '已簽約',
          contractAmount: Number(row.contract_amount) || 0,
          quoteAmount: Number(row.quote_amount) || 0,
          salesNote: row.sales_note || ''
        };
      });

      // A. 強制更新瀏覽器快取 (localStorage)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedCases));

      // B. 強制覆寫 index.html 中的全域變數 (casesData)
      if (typeof window.casesData !== 'undefined') {
        window.casesData = parsedCases;
      }

      // C. 強制重新呼叫渲染函式
      if (typeof window.loadCasesFromStorage === 'function') {
        window.loadCasesFromStorage();
        console.log('✅ 已成功將 Supabase 資料渲染至畫面！');
      } else {
        // 備用方案：若找不到函式直接重刷頁面
        window.location.reload();
      }
    } else {
      console.warn('⚠️ Supabase 中沒有找到任何案件資料。');
    }
  } catch (error) {
    console.error('❌ 從 Supabase 讀取資料失敗：', error.message);
  }
};

// 2. 同步資料至 Supabase
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

// 3. 確保網頁載入時立刻執行拉取
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  window.fetchFromSupabase();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    window.fetchFromSupabase();
  });
}
