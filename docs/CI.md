مستندات CI — راه‌اندازی، Secrets و استفاده از webhook در محیط staging

خلاصه
- این مخزن از GitHub Actions برای CI/CD استفاده می‌کند. جریان کاری (workflow) اصلی در `.github/workflows/ci.yml` قرار دارد.
- هدف: اجرا شدن linting، unit/integration/e2e tests، اسکن امنیتی، ساخت image و deploy به staging/production.
- بهینه‌سازی‌های انجام‌شده: cache برای pnpm/.nx، تولید گزارش‌های JUnit و coverage، نگهداری artifacts، و مکانیزم retry برای تست‌های flaky.

فهرست secrets مورد نیاز
- GITHUB_TOKEN — توسط GitHub برای اکشن‌ها استفاده می‌شود (در ریپو اتوماتیک موجود است).
- SONAR_TOKEN — برای SonarCloud scan (اختیاری در صورتی که SonarCloud فعال باشد).
- RESEND_API_KEY — کلید API سرویس Resend (برای ارسال ایمیل‌های واقعی در integration testها).
- EMAIL_FROM — آدرس فرستنده ایمیل برای تست‌های Reset password.
- CODECOV_TOKEN — (اختیاری) برای آپلود coverage به Codecov.
- SHAPARAK_API_KEY — (در صورت نیاز به اجرای integration tests که با درگاه پرداخت شاپرک سروکار دارند).

نحوهٔ افزودن Secrets به ریپوزیتوری GitHub
1. به صفحه ریپوزیتوری در GitHub بروید → Settings → Secrets and variables → Actions.
2. روی New repository secret کلیک کنید.
3. نام را با دقت وارد کنید (مثلاً `RESEND_API_KEY`) و مقدار را بچسبانید.
4. ذخیره کنید.

تنظیمات محیط staging
- فایل environment `staging` از workflow از متغیرهای زیر استفاده می‌کند:
  - `DATABASE_URL` — باید به دیتابیس staging Postgres اشاره کند.
  - `REDIS_URL` — URL مربوط به Redis در staging.
  - `RESEND_API_KEY` و `EMAIL_FROM` — برای ارسال ایمیل در staging (در صورتی که نخواهید ایمیل واقعی بفرستید، از سرویس mailbox اختصاصی تست یا آدرس‌های catch-all استفاده کنید).

چگونه webhook Resend را در محیط staging ثبت (register) کنیم
1. تولید endpoint امن در staging
   - سرویس شما باید یک endpoint HTTPS قابل دسترس عمومی داشته باشد، مثلاً `https://staging.example.com/webhook/resend`.
   - این endpoint باید بررسی امضای webhook را (HMAC یا header اختصاصی) پیاده‌سازی کند تا از منبع مطمئن باشد.

2. تولید و نگهداری WEBHOOK_SECRET
   - هنگام ثبت webhook در Resend، یک مقدار secret برای امضا‌سازی payload ایجاد کنید.
   - مقدار `RESEND_WEBHOOK_SECRET` را به عنوان یک secret در GitHub ذخیره کنید (Settings → Secrets).
   - در فایل `.env.staging` یا سیستم مدیریت کانفیگ استیجینگ (مثل Vault) نیز همین مقدار را قرار دهید.

3. ثبت webhook در Resend (مثال کلی)
   - از داشبورد Resend استفاده کنید یا از API آنها برای ثبت webhook استفاده نمایید:
     - URL = `https://staging.example.com/webhook/resend`
     - Method = POST
     - Secret = `<RESEND_WEBHOOK_SECRET>`
     - Events = mail.delivered, mail.opened, mail.clicked (بستگی به نیاز شما)

4. پیاده‌سازی بررسی امضا در سرور
   - برای امنیت payload، سرور باید header امضا (مثلاً `X-Resend-Signature` یا نامی مشابه) را بررسی کند.
   - اگر امضا معتبر نبود، با 401 پاسخ بدهید و لاگ کنید (بدون ذخیرهٔ payload شامل توکن‌ها).

چگونگی تست webhook در staging
- قبل از ثبت webhook عمومی، از ابزارهایی مثل `ngrok` یا `cloudflare tunnel` برای expose موقتی endpoint محلی به اینترنت استفاده کنید.
- Resend معمولاً یک UI یا API برای ارسال تست webhook دارد — از آن برای فرستادن نمونه payload استفاده کنید.
- در این پروژه یک endpoint تست-only (`/webhook/resend/test`) وجود دارد که تنها در NODE_ENV=test فعال می‌شود. برای تست staging واقعی، از endpoint اصلی ثبت‌شده استفاده کنید.

توصیه‌های امنیتی و محرمانگی
- هرگز توکن‌های reset، refresh tokenها یا هر راز حساس دیگر را در لاگ‌ها نگنجانید.
- payloadهای webhook که حاوی توکن هستند باید قبل از ذخیره، پاک (sanitize) شوند یا فقط یک هش امن از آن‌ها ذخیره شود.
- دسترسی به secrets را محدود کنید و از GitHub Environments برای محیط‌های حساس (staging/production) استفاده کنید.

دسترسی به گزارش‌ها و artifacts
- هر job که گزارش JUnit یا coverage تولید می‌کند فایل گزارش را به عنوان artifact آپلود می‌کند (با نگهداری پیش‌فرض 30 روز؛ برای artifacts مهم‌تر گاهی 90 روز تنظیم می‌شود).
- برای مشاهده نتایج test/coverage:
  1. به صفحه Actions → اجرای مورد نظر بروید.
  2. job مورد نظر را باز کنید و از بخش Artifacts، فایل junit/coverage را دانلود کنید.
  3. برای دید سریع، فایل merged/junit.xml نیز در job `test-report-aggregate` تولید و آپلود می‌شود.

مدیریت تست‌های flaky
- مکانیزم retry در jobهای unit/integration به کار گرفته شده است: هر پروژه تا 3 بار اجرا می‌شود.
- اگر تستی در تلاش اول شکست بخورد اما در تلاش دوم یا سوم موفق شود، یک نشانگر flaky برای آن پروژه در artifacts (FLAKY-<project>.md) آپلود می‌شود.
- مدیران تیم باید پس از شناسایی flaky testها اقدام به بازنویسی یا پایدارسازی آن‌ها کنند (مثلاً با حذف وابستگی‌های زمانی، استفاده از determinism در دیتابیس‌های تست یا اصلاح تستهای انتگرال).

تنظیمات پیشرفته برای CI
- Cache keys: cacheها بر اساس `pnpm-lock.yaml` و `package.json` ساخته می‌شوند تا تغییر وابستگی‌ها باعث invalidation شود.
- Cache برای Rust و Python به صورت جداگانه فعال شده است (`~/.cargo`, `~/.cache/pip`).
- اگر قصد استفاده از Codecov دارید، مقدار `CODECOV_TOKEN` را در Secrets اضافه کنید؛ CI به طور شرطی coverageها را به Codecov ارسال خواهد کرد.

نکات عملی برای توسعه‌دهندگان
- برای اجرای همان flow محلی:
  1. نصب pnpm: `npm i -g pnpm`
  2. نصب وابستگی‌ها: `pnpm install`
  3. اجرای lint: `pnpm nx lint <project>`
  4. اجرای تست‌ها محلی: `pnpm nx test <project> --ci`
- برای شبیه‌سازی webhook تستی بدون دیتابیس خارجی: از endpoint `/webhook/resend/test` در حالت تست استفاده کنید یا payload نمونه را با curl ارسال کنید.

نمونه دستور برای ارسال تست webhook به staging (پس از ثبت webhook):

curl -X POST https://staging.example.com/webhook/resend \
  -H "Content-Type: application/json" \
  -H "X-Resend-Signature: <signature>" \
  -d '{"event":"mail.delivered","message":{...}}'

(توجه: مقدار header امضا باید مطابق با کلید `RESEND_WEBHOOK_SECRET` تولید شود — مستندات Resend را برای نحوهٔ محاسبه HMAC بررسی کنید.)

سؤالات متداول
- Q: آیا CI توابع rollback خودکار دارد؟
  A: بله، در مرحله `deploy-prod` اگر failure رخ دهد تلاش به rollback خواهد شد.

- Q: چطور می‌توانم نگهداری artifacts را تغییر دهم؟
  A: در workflow از `actions/upload-artifact` پارامتر `retention-days` تنظیم شده است — برای تغییر، فایل ci.yml را ویرایش کنید.

- Q: webhook تست-only چیست؟
  A: endpoint ای که فقط در حالت NODE_ENV=test فعال می‌شود تا تست‌های integration و unit بتوانند webhookها را شبیه‌سازی کنند بدون باز کردن endpoint به اینترنت.

پایان
- هرگونه تغییر مهم در CI (مثلاً افزایش تعداد retries، تغییر سیاست cache یا تغییر متغیرهای محرمانه) باید در یک PR جداگانه و با مستندات مرتبط ارائه شود.
