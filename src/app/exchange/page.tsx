import { ExchangeView } from "@/components/exchange/exchange-view";

export const metadata = {
  title: "تبدیل ارز",
};

export default async function ExchangePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;

  return (
    <div className="py-4">
      <ExchangeView initialSource={source} />
    </div>
  );
}