"use client";
import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
function StockList() {
  const [stocks, setStocks] = useState<string[]>([]);
  const [stockName, setStockName] = useState<string>("");
  const stockList = stocks.map((item) => <li>{item}</li>);
  function handleChange(event: React.ChangeEvent<any>): void {
    setStockName(event.target.value);
  }
  function addToList(): void {
    setStocks([...stocks, stockName]);

    console.log(stockName);
    setStockName("");
  }
  return (
    <div>
      <div className="flex items-center justify-evenly">
        <label>Stock:</label>
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
        <Button onClick={addToList} type="submit">
          Add
        </Button>
      </div>
      <ul className="flex items-center justify-evenly">{stockList}</ul>
    </div>
  );
}
export default StockList;
