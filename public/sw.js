const CACHE_NAME = 'vibefit-pro-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Skip non-GET and external API calls
  if (event.request.method !== 'GET') return
  if (url.hostname.includes('anthropic.com')) return
  if (url.hostname.includes('googleapis.com')) return
  if (url.hostname.includes('firebaseio.com')) return
  if (url.hostname.includes('stripe.com')) return
  if (url.hostname.includes('nal.usda.gov')) return

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetchPromise = fetch(event.request)
          .then(response => {
            if (response.ok) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
            }
            return response
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
  )
})
