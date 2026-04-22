import { FobCalculator } from "@/components/FobCalculator";
import { FobLoadError } from "@/components/FobLoadError";
import { loadAuctionRecords } from "@/lib/loadFobCsv";

export const dynamic = "force-dynamic";

export default function Home() {
  try {
    const auctions = loadAuctionRecords();
    return <FobCalculator auctions={auctions} />;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неизвестная ошибка при чтении CSV.";
    return <FobLoadError message={message} />;
  }
}
