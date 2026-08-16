// src/lib/contentSync.js
// Fetches static content snapshots (Sermons, Sabbath School, Devotional,
// Blog, Gallery, Newsletter) from the main site's public/data/ folder,
// polling once a day for anything new, and caching the result locally so
// pages can read it instantly — even fully offline — without hitting
// Supabase at all for this read-only content. Interactive/write-heavy
// content (Events RSVPs, Timeline, Prayer) is NOT part of this system and
// keeps using live Supabase as before.
//
// The actual data only changes when someone manually runs the "Sync
// Content" GitHub Action on the main site's repo — this module just checks
// once a day whether that's happened since our last check.

const CONTENT_BASE_URL = 'https://ccgm-pwa.vercel.app/data'
const SYNC_META_KEY = 'ccgworld_content_sync_meta'
const CONTENT_KEY = (name) => `ccgworld_content_${name}`
const POLL_INTERVAL_MS = 24 * 60 * 60 * 1000 // once a day

const CONTENT_FILES = ['sermons', 'sabbath-lessons', 'devotionals', 'blog', 'gallery', 'newsletters']

function getSyncMeta() {
  try { return JSON.parse(localStorage.getItem(SYNC_META_KEY)) || {} } catch { return {} }
}
function setSyncMeta(meta) {
  try { localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta)) } catch {}
}

// Reads a content type's locally cached snapshot — null if never synced yet
// (e.g. very first app launch, before the first successful daily check).
export function getBundledContent(name) {
  try {
    const raw = localStorage.getItem(CONTENT_KEY(name))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Call once per app session (e.g. on app mount). Does nothing most of the
// time — only actually fetches anything if it's been 24h+ since the last
// check, and only re-downloads content files if the manifest shows a newer
// snapshot than what's already cached.
export async function syncContentIfNeeded() {
  if (!navigator.onLine) return
  const meta = getSyncMeta()
  const now = Date.now()
  if (meta.lastCheckedAt && (now - meta.lastCheckedAt) < POLL_INTERVAL_MS) return

  try {
    const manifestRes = await fetch(`${CONTENT_BASE_URL}/manifest.json`, { cache: 'no-store' })
    if (!manifestRes.ok) throw new Error('manifest fetch failed')
    const manifest = await manifestRes.json()

    // Nothing new since our last successful sync — just record that we
    // checked, so we don't check again for another 24h.
    if (meta.generatedAt === manifest.generatedAt) {
      setSyncMeta({ ...meta, lastCheckedAt: now })
      return
    }

    // New snapshot available — fetch every content file and replace the
    // previous cache entirely (full clean replace, not a merge, matching
    // how the export workflow always writes a complete fresh snapshot).
    await Promise.all(CONTENT_FILES.map(async (name) => {
      const res = await fetch(`${CONTENT_BASE_URL}/${name}.json`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`${name} fetch failed`)
      const data = await res.json()
      localStorage.setItem(CONTENT_KEY(name), JSON.stringify(data))
    }))

    setSyncMeta({ generatedAt: manifest.generatedAt, lastCheckedAt: now })
  } catch (err) {
    // Offline mid-check, or the main site briefly unreachable — silently
    // keep using whatever's already cached and try again on the next poll.
    console.warn('Content sync failed (will retry on next check):', err.message)
  }
}
