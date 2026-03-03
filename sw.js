// Service Worker — офлайн кеширование
const CACHE_NAME = 'goals-2026-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://cdn.tailwindcss.com'
];

// При установке — кешируем все локальные ресурсы
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Кешируем только локальные файлы (CDN может не поддерживать CORS)
            return cache.addAll(['/', '/index.html', '/manifest.json']);
        })
    );
    self.skipWaiting();
});

// При активации — удаляем старые кеши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Стратегия: Network First, fallback to Cache
self.addEventListener('fetch', event => {
    // Пропускаем не-GET запросы
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Сохраняем свежий ответ в кеш
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
