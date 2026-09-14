import "dotenv/config";

import bcrypt from "bcryptjs";
import Decimal from "decimal.js";

import { prisma } from "../src/lib/prisma";

const CURRENCIES = [
  { code: "USD", name: "دلار آمریکا", symbol: "$", decimalPlaces: 2 },
  { code: "EUR", name: "یورو", symbol: "€", decimalPlaces: 2 },
  { code: "GBP", name: "پوند انگلیس", symbol: "£", decimalPlaces: 2 },
  { code: "AED", name: "درهم امارات", symbol: "د.إ", decimalPlaces: 2 },
];

// نرخ‌های پایه نسبت به دلار (مطابق مستندات محصول)
const USD_RATES: Record<string, string> = {
  EUR: "0.8512",
  GBP: "0.7421",
  AED: "3.6725",
};

const DEMO_USER = {
  email: "demo@flowpay.app",
  password: "Demo1234!",
  name: "کاربر نمونه",
};

// موجودی‌های اولیه کاربر دمو (بر اساس نمونه مستندات)
const DEMO_WALLETS: Record<string, string> = {
  USD: "10000.00",
  EUR: "2450.50",
  GBP: "1200.00",
  AED: "5000.00",
};

Decimal.set({ precision: 30 });

async function seedCurrencies() {
  for (const c of CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: { name: c.name, symbol: c.symbol, decimalPlaces: c.decimalPlaces },
      create: c,
    });
  }
  console.log(`✓ ${CURRENCIES.length} ارز ثبت شد`);
}

async function seedRates() {
  // پاک‌سازی نرخ‌های قبلی برای اجرای پاک و قابل تکرار
  await prisma.exchangeRate.deleteMany({});

  const codes = CURRENCIES.map((c) => c.code);
  const currencies = await prisma.currency.findMany();
  const byCode = new Map(currencies.map((c) => [c.code, c]));

  Decimal.set({ toExpNeg: -20 });

  let count = 0;
  for (const base of codes) {
    for (const quote of codes) {
      if (base === quote) continue;

      let rate: Decimal;
      if (base === "USD") {
        rate = new Decimal(USD_RATES[quote as keyof typeof USD_RATES]);
      } else if (quote === "USD") {
        rate = new Decimal(1).dividedBy(USD_RATES[base as keyof typeof USD_RATES]);
      } else {
        // نرخ متقاطع: USD→quote تقسیم بر USD→base
        rate = new Decimal(USD_RATES[quote as keyof typeof USD_RATES]).dividedBy(
          USD_RATES[base as keyof typeof USD_RATES],
        );
      }

      await prisma.exchangeRate.create({
        data: {
          baseCurrencyId: byCode.get(base)!.id,
          quoteCurrencyId: byCode.get(quote)!.id,
          rate: rate.toFixed(10),
          validFrom: new Date(),
        },
      });
      count += 1;
    }
  }
  console.log(`✓ ${count} نرخ ارز ثبت شد`);
}

async function seedDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      passwordHash,
    },
  });

  const currencies = await prisma.currency.findMany();
  for (const c of currencies) {
    const balance = DEMO_WALLETS[c.code];
    if (balance === undefined) continue;

    await prisma.wallet.upsert({
      where: { userId_currencyId: { userId: user.id, currencyId: c.id } },
      update: {},
      create: {
        userId: user.id,
        currencyId: c.id,
        balance,
      },
    });
  }
  console.log(`✓ کاربر دمو: ${DEMO_USER.email}`);
}

async function main() {
  await seedCurrencies();
  await seedRates();
  await seedDemoUser();
  console.log("Seed completed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });