import { sb_publishable_V9QZLQBKv2SGrthA814LAg_x167CTRD } from '../config.js';

window.syncToSupabase = async function(casesData) {
  try {
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
