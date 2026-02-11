// اسم الذاكرة (النسخة المخبأة)
const CACHE_NAME = 'secret-calc-v1';

// قائمة بالملفات التي نريد حفظها لتعمل بدون إنترنت
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// الخطوة 1: تثبيت (Install) عامل الخدمة وحفظ الملفات في ذاكرة الهاتف
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('تم حفظ ملفات التطبيق بنجاح');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// الخطوة 2: تفعيل (Activate) عامل الخدمة وتنظيف أي ملفات قديمة (إن وجدت)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// الخطوة 3: جلب (Fetch) الملفات
// عندما يطلب التطبيق ملفاً، سنعطيه النسخة المحفوظة إذا لم يكن هناك إنترنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // إذا وجدنا الملف في الذاكرة المخبأة، نعيده. وإلا نجلبه من الإنترنت.
            return response || fetch(event.request);
        })
    );
});
