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
  const url = event.request.url

  // Never cache API calls
  if (url.includes('api.anthropic.com') ||
      url.includes('firestore.googleapis.com') ||
      url.includes('firebase') ||
      url.includes('stripe.com') ||
      url.includes('api.nal.usda.gov')) {
    return
  }

  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200) return response
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
