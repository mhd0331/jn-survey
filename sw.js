// Service Worker - sw.js
const CACHE_NAME = 'jinan-survey-v2'; // 버전 업데이트
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data.json',
    './manifest.json'
    // 아이콘 파일은 존재할 때만 캐시하도록 함
];

// 설치 이벤트
self.addEventListener('install', event => {
    console.log('Service Worker 설치 중...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('캐시 열기 성공');
                // 각 URL을 개별적으로 캐시하고 오류 처리
                const cachePromises = urlsToCache.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn(`캐시 실패 (무시됨): ${url}`, err);
                        return Promise.resolve();
                    });
                });
                
                // 아이콘 파일이 있으면 캐시 시도
                return Promise.all([
                    ...cachePromises,
                    cache.add('./icons/icon-192x192.png').catch(() => {
                        console.log('아이콘 파일 없음 - 무시');
                        return Promise.resolve();
                    })
                ]);
            })
            .then(() => {
                console.log('Service Worker 설치 완료');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('Service Worker 설치 오류:', err);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    console.log('Service Worker 활성화 중...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker 활성화 완료');
            return self.clients.claim();
        })
    );
});

// Fetch 이벤트
self.addEventListener('fetch', event => {
    // Chrome 확장 프로그램 요청 무시
    if (event.request.url.includes('chrome-extension://')) {
        return;
    }
    
    // POST 요청은 캐시하지 않음
    if (event.request.method !== 'GET') {
        return;
    }

    // API 요청은 캐시하지 않음
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 있으면 캐시된 응답 반환
                if (response) {
                    return response;
                }

                // 네트워크 요청 시도
                return fetch(event.request).then(response => {
                    // 404 응답이면 캐시하지 않음
                    if (!response || response.status === 404) {
                        return response;
                    }
                    
                    // 유효한 응답이 아니거나 외부 리소스인 경우 캐시하지 않음
                    if (response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 응답 복제 (캐시와 브라우저 모두에 사용)
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        })
                        .catch(err => {
                            console.warn('캐시 저장 실패:', err);
                        });

                    return response;
                }).catch(err => {
                    console.error('네트워크 요청 실패:', err);
                    
                    // 오프라인 폴백 페이지
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                    
                    // 아이콘 요청이 실패하면 빈 응답 반환
                    if (event.request.url.includes('/icons/')) {
                        return new Response('', {
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers({
                                'Content-Type': 'image/png'
                            })
                        });
                    }
                    
                    // 기타 리소스는 오류 응답 반환
                    return new Response('오프라인 상태입니다.', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain; charset=utf-8'
                        })
                    });
                });
            })
    );
});

// 메시지 수신
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
    if (event.tag === 'sync-survey-responses') {
        event.waitUntil(syncSurveyResponses());
    }
});

// 푸시 알림 (선택사항)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('진안군 설문조사', options)
    );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});

// 동기화 함수
async function syncSurveyResponses() {
    try {
        // 클라이언트와 통신하여 저장된 응답 가져오기
        const allClients = await clients.matchAll();
        
        for (const client of allClients) {
            client.postMessage({
                type: 'SYNC_REQUEST'
            });
        }
        
        return true;
    } catch (error) {
        console.error('동기화 실패:', error);
        return false;
    }
}