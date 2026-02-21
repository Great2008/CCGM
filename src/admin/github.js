/**
 * GitHub Content API Helper
 * Reads/writes JSON files in your repo's /public/content/ folder.
 * Set these in Vercel environment variables:
 *   VITE_GH_TOKEN  — GitHub Personal Access Token (repo scope)
 *   VITE_GH_OWNER  — GitHub username e.g. "Great2008"
 *   VITE_GH_REPO   — Repo name e.g. "CCGM"
 *   VITE_GH_BRANCH — Branch e.g. "main"
 */

const TOKEN  = import.meta.env.VITE_GH_TOKEN
const OWNER  = import.meta.env.VITE_GH_OWNER
const REPO   = import.meta.env.VITE_GH_REPO
const BRANCH = import.meta.env.VITE_GH_BRANCH || 'main'
const BASE   = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  }
}

/** Read a JSON file from /public/content/{filename} */
export async function readContent(filename) {
  const res = await fetch(`${BASE}/public/content/${filename}?ref=${BRANCH}`, { headers: headers() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`)
  const data = await res.json()
  return {
    content: JSON.parse(atob(data.content.replace(/\n/g, ''))),
    sha: data.sha,
  }
}

/** Write a JSON file to /public/content/{filename} */
export async function writeContent(filename, content, sha = null) {
  const body = {
    message: `Admin update: ${filename}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(`${BASE}/public/content/${filename}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub write error: ${res.status}`)
  }
  return res.json()
}

/** Helper to load content with localStorage fallback for offline preview */
export async function loadWithFallback(filename, defaultData) {
  const cacheKey = `ccogm_content_${filename}`
  try {
    const result = await readContent(filename)
    if (result) {
      localStorage.setItem(cacheKey, JSON.stringify(result))
      return result
    }
  } catch {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  }
  return { content: defaultData, sha: null }
}

export function isConfigured() {
  return !!(TOKEN && OWNER && REPO)
}
