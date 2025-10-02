import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '1m', target: 20 }, // افزایش تدریجی کاربران
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // حداکثر زمان پاسخ 5 ثانیه
    http_req_failed: ['rate<0.01'], // کمتر از 1% خطا
  },
};

export default function () {
  const params = {
    timeout: '10s', // محدودیت زمانی برای شبکه‌های کند
    retries: 3, // تکرار خودکار برای قطعی‌ها
  };

  const res = http.get('https://api.example.com/auth/login', {
    mobile: '+۹۸۹۱۲۳۴۵۶۷۸۹',
    code: '۴۵۶۷۸۹',
  }, params);

  check(res, {
    'وضعیت ۲۰۰': (r) => r.status === 200,
    'زمان پاسخ منطقی': (r) => r.timings.duration < 3000,
  });

  sleep(Math.random() * 3 + 1); // شبیه‌سازی رفتار واقعی کاربر
}