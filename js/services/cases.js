import { supabaseClient } from '../config.js';

export async function saveCase(content) {
  if (!content) throw new Error('請輸入內容');

  const { data, error } = await supabaseClient
    .from('cases')
    .insert([{ data: { content } }]);

  if (error) throw new Error(error.message);
  return data;
}

export async function loadCases() {
  const { data, error } = await supabaseClient
    .from('cases')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
