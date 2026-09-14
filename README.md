# فلوپی (FlowPay)

کیف پول چندارزی با تبدیل ارز امن و آنی؛ ساخته‌شده به‌صورت تمام‌استک با Next.js 16 (App Router + Route Handlers)، Auth.js/NextAuth v5، Prisma 7 و PostgreSQL روی Neon.

## امکانات

- ثبت‌نام و ورود با جلسهٔ JWT (NextAuth)، رمزنگاری رمز عبور با bcrypt
- کیف پول چندارزی: ۴ ارز پایه (USD/EUR/GBP/AED) که در ثبت‌نام به‌صورت خودکار ساخته می‌شوند
- تبدیل ارز لحظه‌ای با نرخ‌های از پیش تعریف‌شده و کارمزد شفاف (۰٫۷۵٪)
- اجرای اتمیک و ایدمپوتنت تراکنش‌ها (قفل صف مبدأ + کلید یکتا) — درخواست تکراری نتیجهٔ قبلی را برمی‌گرداند و موجودی را دوباره کم نمی‌کند
- تاریخچهٔ تراکنش‌ها با فیلتر (وضعیت، نوع، ارز، بازهٔ زمانی) و صفحه‌بندی
- داشبورد با مجموع ارزش کیف پول‌ها به USD و ۵ تراکنش اخیر
- رابط فارسی/RTL، حالت روشن/تیره، طراحی کاملاً واکنش‌گرا و مب‌صرتی

## پشتهٔ فنی

| بخش | فناوری |
| --- | --- |
| فریم‌ورک | Next.js 16.3.5 (App Router) |
| احراز هویت | next-auth@5.0.0-beta.32 (Auth.js) |
| دیتابیس | PostgreSQL روی Neon + Prisma 7 (Driver Adapter `@prisma/adapter-pg`) |
| اعتبارسنجی | Zod 4 |
| فرم/استیت | React Hook Form، TanStack Query |
| UI | Tailwind CSS v4 + shadcn/ui (بر پایهٔ Base UI) |
| تست | Vitest (۴۶ تست: محاسبات مالی، فرمت اعداد، نرخ ارز، اِسکیمای اعتبارسنجی، نگاشت خطا) |

> نکته: `next-auth@beta` عمداً انتخاب شد؛ نسخهٔ پایدار v4 از `next@16` پشتیبانی نمی‌کند و این نسخهٔ بتا به‌طور رسمی با `next@16` و `react@19` سازگار است.

## راه‌اندازی

پیش‌نیازها: Node.js 20+، یک بانک Neon PostgreSQL.

```bash
cp .env.example .env        # سپس مقادیر واقعی را بگذارید
npm install
npm run prisma:migrate      # اعمال مایگریشن‌ها
npm run db:seed             # ارزها، نرخ‌ها و کاربر دمو
npm run dev
```

متغیرهای محیطی (`DATABASE_URL`، `AUTH_SECRET`، `NEXT_PUBLIC_APP_URL`) در `.env.example` مستند شده‌اند.

### کاربر دمو

`demo@flowpay.app` / `Demo1234!` — با کیف پول‌های USD ۱۰٬۰۰۰، EUR ۲٬۴۵۰٫۵۰، GBP ۱٬۲۰۰ و AED ۵٬۰۰۰.

## اسکریپت‌ها

| دستور | توضیح |
| --- | --- |
| `npm run dev` | سرور توسعه |
| `npm run build` | ساخت تولید |
| `npm run start` | اجرای ساخت |
| `npm run lint` | ESLint |
| `npm run typecheck` | بررسی تایپ با tsc |
| `npm run test` | اجرای Vitest |
| `npm run verify` | لینت + تایپ‌چک + تست + بیلد |
| `npm run db:seed` | اجرای Seed |
| `npm run prisma:migrate` | مایگریشن در محیط توسعه |

## معماری و تصمیمات کلیدی

### ایدمپوتنسی و همزمانی تراکنش تبدیل

- کلید یکتای درخواست با unique مشترک `(userId, key)` در جدول `IdempotencyKey` ثبت می‌شود.
- اجرا در یک `prisma.$transaction` با قفل `SELECT ... FOR UPDATE` روی کیف پول مبدأ و `updateMany` شرطی (اگر موجودی تغییر نکرد → `INSUFFICIENT_BALANCE`).
- الگوی صحیح PostgreSQL برای جلوگیری از خطای `25P02` (transaction aborted): ابتدا `findUnique` برای تشخیص تراکنش تکراری/کلید یتیم، سپس `create` در try/catch؛ هنگام برخورد با درگیری unique فقط `DUPLICATE_REQUEST` برمی‌گردد و در همان تراکنش کوئری جدیدی صادر نمی‌شود.
- مسیر `POST /api/exchange` برای درخواست تکراری با همان کلید، تراکنش قبلی را با `replayed: true` و کد ۲۰۰ برمی‌گرداند.

### محاسبات مالی

- کارمزد: `sourceAmount × 0.0075` با گرد کردن `ROUND_HALF_UP` روی اعشار ارز مبدأ.
- مبلغ نهایی: `sourceAmount − fee` ضرب‌در نرخ با `ROUND_DOWN` روی اعشار ارز مقصد.
- نرخ به‌صورت لحظه‌ای از `ExchangeRate` خوانده و در `Transaction.exchangeRate` ذخیره می‌شود.
- موجودی‌ها `Decimal(20,8)` و محاسبات با `decimal.js` انجام می‌شود.

### مدل خطا

خطاهای API با ساختار یکسان `{ error: CODE, message }` و نگاشت وضعیت‌ها در `src/lib/errors.ts` (۴۰۰/۴۰۴/۴۰۹/۵۰۰) برگردانده می‌شوند.

### امنیت

- حفاظت مسیرها در `proxy.ts` (Next 16): دسترسی‌های محافظت‌شده فقط با نشست معتبر، صفحات ورود/ثبت‌نام فقط برای مهمان‌ها.
- تمام کوئری‌های مربوط به کاربر با `userId` محدود شده‌اند (بدون نشت داده بین کاربران).
- هدرهای امنیتی: CSP، `X-Frame-Options: DENY`، `X-Content-Type-Options`، `Referrer-Policy` و `Permissions-Policy`.
- رمز عبور با bcrypt (rounds=12) و کلید نشست از `AUTH_SECRET`.
- اعتبارسنجی ورودی در لبهٔ هر API با Zod.

## API

| متد | مسیر | توضیح |
| --- | --- | --- |
| GET | `/api/currencies` | ارزهای فعال |
| GET/POST | `/api/wallets` | کیف پول‌های کاربر / افزودن کیف پول |
| GET | `/api/exchange-rates?from=&to=` | نرخ تبدیل لحظه‌ای |
| GET | `/api/exchange/quote?from=&to=&amount=` | نقل‌قول تبدیل |
| POST | `/api/exchange` | اجرای تبدیل (ایدمپوتنت) |
| GET | `/api/transactions` | تاریخچهٔ تراکنش با فیلتر و صفحه‌بندی |
| GET | `/api/transactions/:id` | جزئیات تراکنش |

## تست

تست‌های واحد در کنار کد (`*.test.ts`) قرار دارند:

```bash
npm run test
```

## وضعیت پروژه و محدودیت‌ها

- اکنون نوع تراکنش فقط «تبدیل ارز» است؛ واریز/برداشت و کارت‌های پیش‌فرض اضافه نشده‌اند.
- محدودکنندهٔ نرخ (rate limiting) و بازنشانی رمز عبور در نسخه‌های بعدی پیشنهاد می‌شود.
- نرخ‌ها به‌صورت دستی در Seed تعریف می‌شوند؛ اتصال به ارائه‌دهندهٔ نرخ زنده خارج از محدودهٔ MVP بود.