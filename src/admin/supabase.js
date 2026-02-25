import supabaseAdmin from '../lib/supabaseAdmin'

// ── Site Settings (homepage content, etc.) ─────────────────
export async function getContent(key) {
  const { data } = await supabaseAdmin.from('site_settings').select('value').eq('key', key).single()
  return data?.value || null
}
export async function setContent(key, value) {
  const { error } = await supabaseAdmin.from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}
