const CACHE_NAME = 'auto-cache-v1';

// 1. 安装阶段：立即激活，无需等待
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 2. 激活阶段：立即接管所有页面
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// 3. 拦截请求：有网自动更新并缓存，没网自动读取本地缓存
self.addEventListener('fetch', event => {
  // 只处理常规的网页和资源读取请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 如果联网获取成功，自动把最新文件复制一份存进手机缓存
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 如果手机断网了（fetch失败），直接从手机缓存里拿出之前存好的页面
        return caches.match(event.request);
      })
  );
});
