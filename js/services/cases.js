// js/services/cases.js
import { supabaseClient, STORAGE_KEY } from '../config.js';

export async function syncToSupabase(data) {
    if (!data || !supabaseClient) return;
    try {
        await supabaseClient.from('cases').insert([{ data: data }]);
        console.log('雲端同步成功！');
    } catch (err) {
        console.error('雲端同步失敗：', err);
    }
}

export async function loadFromSupabase(casesDataRef, callback) {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('cases')
            .select('data')
            .order('id', { ascending: false })
            .limit(1);

        if (error) throw error;
        // ...後續邏輯
    } catch (err) {
        console.error('載入失敗：', err);
    }
}
