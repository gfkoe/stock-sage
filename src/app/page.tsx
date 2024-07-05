import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <div className="flex items-center justify-evenly">
        <label>Stock:</label>
        &nbsp;
        <Input
          className="w-3/4"
          id="stockname"
          type="text"
          placeholder="Ex: NVDA"
        />
        <Button type="submit">Add</Button>
      </div>
    </main>
  );
}
