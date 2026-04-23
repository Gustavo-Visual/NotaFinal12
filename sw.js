const CACHE_NAME = "nota-final-v4";
const APP_SHELL = [
    "./",
    "./index.html",
    "./index.css?v=20260423-3",
    "./app.js?v=20260423-3",
    "./manifest.json?v=20260423-3",
    "./Imgs/EpromatLogo.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        );

        await self.clients.claim();

        const clients = await self.clients.matchAll({ type: "window" });
        await Promise.all(
            clients.map((client) => client.navigate(client.url).catch(() => undefined))
        );
    })());
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request, "./index.html"));
        return;
    }

    if (isDynamicAsset(url.pathname)) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (request.destination === "image" || request.destination === "font") {
        event.respondWith(cacheFirst(request));
    }
});

function isDynamicAsset(pathname) {
    return (
        pathname.endsWith(".html") ||
        pathname.endsWith(".css") ||
        pathname.endsWith(".js") ||
        pathname.endsWith(".json")
    );
}

async function networkFirst(request, fallbackUrl) {
    try {
        const response = await fetch(request);
        await cacheResponse(request, response);
        return response;
    } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
        if (fallbackUrl) {
            const fallback = await cache.match(fallbackUrl);
            if (fallback) return fallback;
        }
        throw _;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
}

async function cacheResponse(request, response) {
    if (!response || response.status !== 200 || response.type !== "basic") return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
}
