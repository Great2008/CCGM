// CCOGM Service Worker — Offline PWA Support
const CACHE_NAME = 'ccogm-v1'
const BIBLE_CACHE = 'ccogm-bible-v1'

// App shell — always cached
const APP_SHELL = [
  '/',
  '/bible',
  '/hymnal',
  '/devotional',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== BIBLE_CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Cache Bible API requests (bible-api.com)
  if (url.hostname === 'bible-api.com') {
    e.respondWith(
      caches.open(BIBLE_CACHE).then(async cache => {
        const cached = await cache.match(e.request)
        if (cached) return cached
        try {
          const res = await fetch(e.request)
          cache.put(e.request, res.clone())
          return res
        } catch {
          return new Response(JSON.stringify({ error: 'Offline — chapter not cached yet' }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }
      })
    )
    return
  }

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request).then(r => r || new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
      )
    )
    return
  }

  // Cache-first for static assets
  if (e.request.destination === 'script' || e.request.destination === 'style' || e.request.destination === 'image') {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone))
        return res
      }))
    )
    return
  }

  // Navigation — serve index.html from cache for SPA
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    )
    return
  }
})
