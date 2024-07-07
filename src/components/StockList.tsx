"use client";
import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStock } from "@/actions/YahooFetch";
import AlertComponent from "@/components/Alert";
type Stock = {
  name: string;
  price: number;
};

function StockList() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockName, setStockName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  function handleChange(event: React.ChangeEvent<any>): void {
    setStockName(event.target.value);
  }
  async function addToList(): Promise<void> {
    if (!stockName) return;
    try {
      const { regularMarketPrice, symbol } = await getStock(stockName);
      const stock = { name: symbol, price: regularMarketPrice };
      setStocks((prevStocks) => [...prevStocks, stock as Stock]);

      setStockName("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }
  function closeAlert(): void {
    setError(null);
  }
  return (
    <div className="relative">
      <div className="h-16 flex flex-col items-center">
        {error && (
          <AlertComponent
            alertTitle="Error"
            alertDescription={error}
            onClose={closeAlert}
          />
        )}
      </div>
      <br />
      <div className="flex items-center justify-center">
        <label>STOCK:</label>
        &nbsp;
        <Input
          className="w-3/4"
          id="stockName"
          type="text"
          placeholder="Ex: NVDA"
          name="stockName"
          value={stockName}
          onChange={handleChange}
        />
        &nbsp;
        <Button onClick={addToList} type="submit">
          Add
        </Button>
      </div>
      <ul className="block items-center justify-evenly">
        {stocks.map((stock, index) => (
          <li className="flex justify-between text-4xl" key={index}>
            <span className="text-left">{stock.name}:</span>
            <span className="text-right">
              ${Number(stock.price).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default StockList;
