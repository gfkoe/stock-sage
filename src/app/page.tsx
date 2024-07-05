import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StockList from "@/components/StockList";
export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <StockList />
    </main>
  );
}
