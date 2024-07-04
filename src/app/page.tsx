import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <div className="flex items-center">
        <h1 className="text-xl ">Stock:</h1>
        &nbsp;
        <Input className="w-3/4" type="text" placeholder="Ex: NVDA" />
        <Button type="submit">Add</Button>
      </div>
    </main>
  );
}
