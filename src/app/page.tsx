import {
  ArrowDownUp,
  Banknote,
  Coins,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const FEATURES = [
  {
    icon: Coins,
    title: "کیف پول چندارزی",
    description:
      "ارزهای بین‌المللی را در یک کیف پول واحد نگهداری کنید و به‌راحتی بین آن‌ها جابه‌جا شوید.",
  },
  {
    icon: ArrowDownUp,
    title: "تبدیل آنی",
    description:
      "تبدیل ارز با نرخ لحظه‌ای و کارمزد شفاف ۰٫۷۵٪، فقط با چند کلیک و بدون پیچیدگی.",
  },
  {
    icon: ShieldCheck,
    title: "پرداخت اتمیک و امن",
    description:
      "هر تراکنش به‌صورت اتمیک و با کلید یکتا ثبت می‌شود؛ هیچ تراکنش تکراری یا ناقصی ندارید.",
  },
  {
    icon: Landmark,
    title: "تاریخچه‌ی کامل",
    description:
      "همه‌ی تبدیل‌ها را با جستجو و فیلتر بر اساس وضعیت، ارز و بازه‌ی زمانی مرور کنید.",
  },
];

const CURRENCIES = [
  {
    code: "USD",
    name: "دلار آمریکا",
    symbol: "$",
    note: "ارز مرجع برای محاسبه دارایی",
  },
  { code: "EUR", name: "یورو", symbol: "€", note: "رایج‌ترین ارز اروپا" },
  { code: "GBP", name: "پوند انگلیس", symbol: "£", note: "ارز رسمی بریتانیا" },
  {
    code: "AED",
    name: "درهم امارات",
    symbol: "د.إ",
    note: "ارتودلی منطقه‌ی خلیج",
  },
];

const accentClass: Record<string, string> = {
  USD: "text-currency-usd",
  EUR: "text-currency-eur",
  GBP: "text-currency-gbp",
  AED: "text-currency-aed",
};

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-background">
      {/* ===== Header ===== */}
      <header className="fixed w-full top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container md:mx-auto flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/25">
              <Wallet className="size-5" />
            </span>
            <span className="text-xl font-bold">فلوپی</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "#features", label: "امکانات" },
              { href: "#currencies", label: "ارزها" },
              { href: "#cta", label: "شروع" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user ? (
              <Button
                className={"ml-2"}
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                <Wallet className="size-4" />
                داشبورد من
              </Button>
            ) : (
              <>
                <Button
                  className={"ml-2"}
                  nativeButton={false}
                  variant="ghost"
                  render={<Link href="/login" />}
                >
                  ورود
                </Button>
                <Button nativeButton={false} render={<Link href="/register" />}>
                  شروع رایگان
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-1/4 size-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute top-40 -left-20 size-72 rounded-full bg-currency-eur/15 blur-3xl" />
            <div className="absolute bottom-0 right-1/3 size-64 rounded-full bg-currency-usd/10 blur-3xl" />
          </div>

          <div className="container mx-auto relative grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-start">
              <Badge className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                <Sparkles className="size-3" />
                کیف پول چندارزی · امن و سریع
              </Badge>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                دارایی‌هایت را در یک کیف پول{" "}
                <span className="bg-linear-to-l from-primary to-indigo-500 bg-clip-text text-transparent">
                  هوشمند
                </span>{" "}
                نگه‌دار و تبدیل کن
              </h1>
              <p className="mx-auto max-w-xl text-base text-muted-foreground lg:mx-0">
                فلوپی به شما امکان می‌دهد ارزهای بین‌المللی را به‌صورت امن
                نگهداری و با نرخ لحظه‌ای و کارمزد شفاف به هم تبدیل کنید؛ همه‌چیز
                اتمیک، بدون تراکنش تکراری و قابل بازبینی.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button
                  nativeButton={false}
                  size="lg"
                  render={<Link href="/register" />}
                >
                  <Wallet className="size-4" />
                  شروع رایگان
                </Button>
                <Button
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                  render={<a href="#features" />}
                >
                  مشاهده امکانات
                </Button>
              </div>
            </div>

            {/* کارت نمونه‌ی تبدیل */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 -z-10 scale-105 rounded-3xl bg-linear-to-br from-primary/25 via-currency-eur/15 to-currency-usd/15 blur-2xl" />
              <div className="rounded-3xl bg-card p-6 shadow-xl shadow-primary/10 ring-1 ring-foreground/10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <ArrowDownUp className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold">تبدیل آنی ارز</p>
                      <p className="text-xs text-muted-foreground">
                        نرخ لحظه‌ای · کارمزد ۰٫۷۵٪
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-success">
                    فعال
                  </Badge>
                </div>

                <div className="space-y-3">
                  <ExchangeRow label="از" code="USD" amount="۱٬۰۰۰٫۰۰" />
                  <div className="flex justify-center">
                    <span className="grid size-8 place-items-center rounded-full border bg-muted">
                      <ArrowDownUp className="size-4 text-muted-foreground" />
                    </span>
                  </div>
                  <ExchangeRow
                    label="به"
                    code="EUR"
                    amount="۸۵۱٫۲۰"
                    highlight
                  />
                </div>

                <div className="mt-5 space-y-1.5 rounded-2xl bg-muted/70 p-4 text-sm">
                  <Row label="نرخ" value="۱ USD = ۰٫۸۵۱۲۰۰۰۰۰۰ EUR" dir="ltr" />
                  <Row label="کارمزد" value="$ ۷٫۵۰" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-muted-foreground">دریافتی</span>
                    <b className="text-base text-currency-usd">€ ۸۵۱٫۲۰</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== آمار ===== */}
        <section className="border-y bg-card/60 py-10">
          <div className="container mx-auto grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              { value: "۴", label: "ارز بین‌المللی" },
              { value: "۰٫۷۵٪", label: "کارمزد تبدیل" },
              { value: "اتمیک", label: "تایید تراکنش" },
              { value: "JWT", label: "نشست امن" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <p className="text-2xl font-black text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== امکانات ===== */}
        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto space-y-12">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-2xl font-black sm:text-4xl">
                همه‌چیز برای مدیریت هوشمند دارایی
              </h2>
              <p className="text-muted-foreground">
                سرویس‌های فلوپی حول سه اصل «امنیت»، «شفافیت» و «سرعت» طراحی
                شده‌اند.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl bg-card p-6 ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ارزها ===== */}
        <section id="currencies" className="py-16 md:py-20">
          <div className="container mx-auto space-y-10">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-2xl font-black sm:text-4xl">
                ارزهای پشتیبانی‌شده
              </h2>
              <p className="text-muted-foreground">
                با افتتاح حساب، کیف پول تمام این ارزها به‌صورت خودکار برای شما
                ساخته می‌شود.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CURRENCIES.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
                >
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl ${accentClass[c.code]} bg-current/10`}
                  >
                    <Banknote className="size-6 text-inherit" />
                  </span>
                  <div>
                    <p className="font-bold">
                      {c.name}{" "}
                      <span className="text-sm text-muted-foreground">
                        ({c.code})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section id="cta" className="py-16 md:py-20">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-indigo-600 to-indigo-800 px-6 py-14 text-center text-primary-foreground shadow-xl shadow-primary/25">
              <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative mx-auto max-w-xl space-y-5">
                <h2 className="text-2xl font-black sm:text-4xl">
                  همین حالا کیف پول چندارزی خودت را بساز
                </h2>
                <p className="text-primary-foreground/80">
                  ثبت‌نام رایگان است؛ کمتر از یک دقیقه طول می‌کشد و تمام کیف
                  پول‌ها بلافاصله فعال می‌شوند.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                    nativeButton={false}
                    render={<Link href="/register" />}
                  >
                    <RefreshCw className="size-4" />
                    ساخت حساب رایگان
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    ورود به حساب
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t py-8 mx-auto container">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            <span className="font-bold">فلوپی</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © ۱۴۰۵ فلوپی —ساخته شده توسط lho3ein.ir تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ExchangeRow({
  label,
  code,
  amount,
  highlight,
}: {
  label: string;
  code: string;
  amount: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
        highlight
          ? "bg-currency-eur/10 ring-1 ring-currency-eur/30"
          : "bg-muted/70"
      }`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <code className="rounded-md bg-background px-1.5 py-0.5 text-xs font-bold">
          {code}
        </code>
        <b
          className={`tabular-nums ${highlight ? "text-currency-eur" : ""}`}
          dir="ltr"
        >
          {amount}
        </b>
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums" dir={dir ?? "rtl"}>
        {value}
      </span>
    </div>
  );
}
