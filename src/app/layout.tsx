import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/provider";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: {
    default: "فلوپی — کیف پول چندارزی",
    template: "%s | فلوپی",
  },
  description:
    "پلتفرم کیف پول چندارزی فلوپی؛ نگهداری، مدیریت و تبدیل ارزهای بین‌المللی با امنیت بالا",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
