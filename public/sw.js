// CCOGM Service Worker v2 — Full Offline PWA
const CACHE = 'ccogm-v2'

// App shell + preloaded assets
const PRECACHE = [
  '/',
  '/bible',
  '/hymnal',
  '/devotional',
  '/sermons',
  '/events',
  '/about',
  '/contact',
  '/gallery',
  '/blog',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Precache app shell (ignore individual failures)
      return Promise.allSettled(PRECACHE.map(url =>
        cache.add(url).catch(() => null)
      ))
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return

  // API calls — network first, no offline fallback needed (data is preloaded in JS)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
    )
    return
  }

  // Static assets (JS, CSS, fonts, images) — cache first
  if (request.destination === 'script' || request.destination === 'style' ||
      request.destination === 'font' || request.destination === 'image') {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(request, clone))
          }
          return res
        }).catch(() => null)
      })
    )
    return
  }

  // Navigation — serve cached index.html for SPA routing (offline support)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then(r => r || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } }))
      )
    )
    return
  }
})
